create table if not exists public.fund_transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_date date not null default current_date,
  fund_type text not null check (fund_type in ('donation','external')),
  transaction_type text not null default 'income' check (transaction_type in ('income','expense')),
  amount numeric(12,2) not null check (amount >= 0),
  description text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists fund_transactions_date_idx on public.fund_transactions(transaction_date desc);
create index if not exists fund_transactions_type_idx on public.fund_transactions(fund_type, transaction_type);

alter table public.monthly_payments
  add column if not exists amount numeric(12,2);

create table if not exists public.external_distributions (
  id uuid primary key default gen_random_uuid(),
  distribution_date date not null default current_date,
  source_amount numeric(12,2) not null check (source_amount >= 0),
  distributed_amount numeric(12,2) not null default 0 check (distributed_amount >= 0),
  remainder numeric(12,2) not null default 0 check (remainder >= 0),
  notes text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.external_distribution_items (
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid not null references public.external_distributions(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  recipient_type text not null check (recipient_type in ('aid','orphan')),
  amount numeric(12,2) not null check (amount >= 0)
);

create index if not exists external_distribution_items_distribution_idx on public.external_distribution_items(distribution_id);

alter table public.fund_transactions enable row level security;
alter table public.external_distributions enable row level security;
alter table public.external_distribution_items enable row level security;

create policy "Authenticated users can view fund transactions"
on public.fund_transactions for select to authenticated using (true);
create policy "Authenticated users can insert fund transactions"
on public.fund_transactions for insert to authenticated with check (true);
create policy "Authenticated users can update fund transactions"
on public.fund_transactions for update to authenticated using (true) with check (true);

create policy "Authenticated users can view external distributions"
on public.external_distributions for select to authenticated using (true);
create policy "Authenticated users can insert external distributions"
on public.external_distributions for insert to authenticated with check (true);

create policy "Authenticated users can view external distribution items"
on public.external_distribution_items for select to authenticated using (true);
create policy "Authenticated users can insert external distribution items"
on public.external_distribution_items for insert to authenticated with check (true);

alter publication supabase_realtime add table public.fund_transactions;
alter publication supabase_realtime add table public.external_distributions;
alter publication supabase_realtime add table public.external_distribution_items;
