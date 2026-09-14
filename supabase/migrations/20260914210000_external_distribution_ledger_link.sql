alter table public.monthly_payments
  add column if not exists base_amount numeric,
  add column if not exists extra_amount numeric not null default 0,
  add column if not exists total_amount numeric;

alter table public.external_distributions
  add column if not exists status text not null default 'draft',
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid,
  add column if not exists fund_transaction_id uuid;

alter table public.fund_transactions
  add column if not exists external_distribution_id uuid;

create table if not exists public.external_distribution_payment_items (
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid not null references public.external_distributions(id) on delete cascade,
  distribution_item_id uuid not null references public.external_distribution_items(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete restrict,
  month date not null,
  amount numeric not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique(distribution_item_id)
);

create unique index if not exists monthly_payments_case_month_uidx on public.monthly_payments(case_id, month);
create unique index if not exists fund_transactions_distribution_uidx on public.fund_transactions(external_distribution_id) where external_distribution_id is not null;
create index if not exists external_distribution_payment_items_month_idx on public.external_distribution_payment_items(month);

alter table public.external_distribution_payment_items enable row level security;
create policy "authenticated can read external distribution payment items" on public.external_distribution_payment_items for select to authenticated using (true);
create policy "authenticated can insert external distribution payment items" on public.external_distribution_payment_items for insert to authenticated with check (true);

create or replace function public.approve_external_distribution(p_distribution_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  d public.external_distributions%rowtype;
  tx_id uuid;
  current_user_id uuid := auth.uid();
  target_month date;
  item record;
  mp public.monthly_payments%rowtype;
  base numeric := 0;
  extra numeric := 0;
  total numeric := 0;
  child_count integer := 0;
begin
  select * into d from public.external_distributions where id = p_distribution_id for update;
  if not found then raise exception 'التوزيع غير موجود'; end if;
  if coalesce(d.status,'draft') = 'approved' then raise exception 'تم اعتماد هذا التوزيع من قبل'; end if;
  if coalesce(d.status,'draft') <> 'draft' then raise exception 'لا يمكن اعتماد هذا التوزيع في حالته الحالية'; end if;
  if coalesce(d.distributed_amount,0) <= 0 then raise exception 'لا يوجد مبلغ صالح للتوزيع'; end if;
  target_month := date_trunc('month', d.distribution_date)::date;
  if (select coalesce(sum(case when transaction_type='income' then amount else -amount end),0) from public.fund_transactions where fund_type='external') < d.distributed_amount then raise exception 'الرصيد الخارجي لا يكفي لاعتماد هذا التوزيع'; end if;
  insert into public.fund_transactions(transaction_date,fund_type,transaction_type,amount,description,created_by,external_distribution_id)
  values(d.distribution_date,'external','expense',d.distributed_amount,'صرف توزيع خارجي رقم '||left(d.id::text,8),current_user_id,d.id) returning id into tx_id;
  for item in select edi.* from public.external_distribution_items edi where edi.distribution_id=d.id loop
    insert into public.external_distribution_payment_items(distribution_id,distribution_item_id,case_id,month,amount) values(d.id,item.id,item.case_id,target_month,item.amount) on conflict (distribution_item_id) do nothing;
    select * into mp from public.monthly_payments where case_id=item.case_id and month=target_month for update;
    select count(*) into child_count from public.children ch where ch.case_id=item.case_id and ch.birth_date + interval '18 years' > target_month;
    select r.amount into base from public.amount_rules r join public.cases c on c.case_type=r.case_type where c.id=item.case_id and r.is_active=true and ((c.case_type='aid' and r.child_count is null) or (c.case_type='orphan_sponsorship' and r.child_count=child_count)) order by r.child_count desc nulls last limit 1;
    base := coalesce(base,mp.base_amount,mp.amount,0);
    extra := coalesce(mp.extra_amount,0) + item.amount;
    total := base + extra;
    if mp.id is null then
      insert into public.monthly_payments(case_id,month,paid,paid_at,paid_by,updated_at,amount,base_amount,extra_amount,total_amount) values(item.case_id,target_month,true,now(),current_user_id,now(),total,base,extra,total);
    else
      update public.monthly_payments set base_amount=base,extra_amount=extra,total_amount=total,amount=total,paid=true,paid_at=coalesce(paid_at,now()),paid_by=coalesce(paid_by,current_user_id),updated_at=now() where id=mp.id;
    end if;
  end loop;
  update public.external_distributions set status='approved',approved_at=now(),approved_by=current_user_id,fund_transaction_id=tx_id where id=d.id;
  insert into public.audit_logs(user_id,action,entity_type,entity_id,details) values(current_user_id,'external_distribution_approved','external_distribution',d.id,jsonb_build_object('distributed_amount',d.distributed_amount,'month',target_month,'fund_transaction_id',tx_id));
  return jsonb_build_object('distribution_id',d.id,'fund_transaction_id',tx_id,'month',target_month,'distributed_amount',d.distributed_amount);
end;
$$;

grant execute on function public.approve_external_distribution(uuid) to authenticated;
