-- External distribution rule:
-- 50 EGP per aid case, 50 EGP per eligible orphan child.
-- Any remainder that cannot be distributed in 50 EGP units is transferred
-- from the external fund to the donation fund and remains available next month.

create or replace function public.approve_external_distribution(p_distribution_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  d public.external_distributions%rowtype;
  tx_id uuid;
  remainder_tx_id uuid;
  current_user_id uuid := auth.uid();
  target_month date;
  item record;
  mp public.monthly_payments%rowtype;
  base numeric := 0;
  extra numeric := 0;
  total numeric := 0;
  child_count integer := 0;
  external_balance numeric := 0;
begin
  select * into d from public.external_distributions where id = p_distribution_id for update;
  if not found then raise exception 'التوزيع غير موجود'; end if;
  if coalesce(d.status,'draft') = 'approved' then raise exception 'تم اعتماد هذا التوزيع من قبل'; end if;
  if coalesce(d.status,'draft') <> 'draft' then raise exception 'لا يمكن اعتماد هذا التوزيع في حالته الحالية'; end if;
  if coalesce(d.source_amount,0) <= 0 then raise exception 'لا يوجد مبلغ صالح للتوزيع'; end if;
  if coalesce(d.distributed_amount,0) <= 0 then raise exception 'لا يوجد مبلغ صالح للمستحقين'; end if;
  if coalesce(d.remainder,0) < 0 then raise exception 'المبلغ المتبقي غير صالح'; end if;
  if round(coalesce(d.distributed_amount,0) + coalesce(d.remainder,0),2) <> round(coalesce(d.source_amount,0),2) then raise exception 'تفاصيل التوزيع لا تتطابق مع المبلغ المصدر'; end if;
  target_month := date_trunc('month', d.distribution_date)::date;
  select coalesce(sum(case when transaction_type='income' then amount else -amount end),0) into external_balance from public.fund_transactions where fund_type='external';
  if external_balance < d.source_amount then raise exception 'الرصيد الخارجي لا يكفي لاعتماد هذا التوزيع'; end if;

  insert into public.fund_transactions(transaction_date,fund_type,transaction_type,amount,description,created_by,external_distribution_id)
  values(d.distribution_date,'external','expense',d.source_amount,'صرف توزيع خارجي رقم '||left(d.id::text,8),current_user_id,d.id)
  returning id into tx_id;

  if coalesce(d.remainder,0) > 0 then
    insert into public.fund_transactions(transaction_date,fund_type,transaction_type,amount,description,created_by)
    values(d.distribution_date,'donation','income',d.remainder,'تحويل فائض التوزيع الخارجي رقم '||left(d.id::text,8)||' إلى رصيد التبرعات',current_user_id)
    returning id into remainder_tx_id;
  end if;

  for item in select edi.* from public.external_distribution_items edi where edi.distribution_id=d.id loop
    insert into public.external_distribution_payment_items(distribution_id,distribution_item_id,case_id,month,amount)
    values(d.id,item.id,item.case_id,target_month,item.amount)
    on conflict (distribution_item_id) do nothing;
    select * into mp from public.monthly_payments where case_id=item.case_id and month=target_month for update;
    select count(*) into child_count from public.children ch where ch.case_id=item.case_id and ch.birth_date + interval '18 years' > target_month;
    select r.amount into base from public.amount_rules r join public.cases c on c.case_type=r.case_type where c.id=item.case_id and r.is_active=true and ((c.case_type='aid' and r.child_count is null) or (c.case_type='orphan_sponsorship' and r.child_count=child_count)) order by r.child_count desc nulls last limit 1;
    base := coalesce(base,mp.base_amount,mp.amount,0);
    extra := coalesce(mp.extra_amount,0) + item.amount;
    total := base + extra;
    if mp.id is null then
      insert into public.monthly_payments(case_id,month,paid,paid_at,paid_by,updated_at,amount,base_amount,extra_amount,total_amount)
      values(item.case_id,target_month,true,now(),current_user_id,now(),total,base,extra,total);
    else
      update public.monthly_payments set base_amount=base,extra_amount=extra,total_amount=total,amount=total,paid=true,paid_at=coalesce(paid_at,now()),paid_by=coalesce(paid_by,current_user_id),updated_at=now() where id=mp.id;
    end if;
  end loop;

  update public.external_distributions set status='approved',approved_at=now(),approved_by=current_user_id,fund_transaction_id=tx_id where id=d.id;
  insert into public.audit_logs(user_id,action,entity_type,entity_id,details)
  values(current_user_id,'external_distribution_approved','external_distribution',d.id,jsonb_build_object('source_amount',d.source_amount,'distributed_amount',d.distributed_amount,'remainder',d.remainder,'month',target_month,'fund_transaction_id',tx_id,'remainder_donation_transaction_id',remainder_tx_id));
  return jsonb_build_object('distribution_id',d.id,'fund_transaction_id',tx_id,'remainder_donation_transaction_id',remainder_tx_id,'month',target_month,'source_amount',d.source_amount,'distributed_amount',d.distributed_amount,'remainder',d.remainder);
end;
$$;

grant execute on function public.approve_external_distribution(uuid) to authenticated;
