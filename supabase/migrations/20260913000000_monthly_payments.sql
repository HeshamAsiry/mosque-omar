create table if not exists public.monthly_payments(
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  month date not null,
  paid boolean not null default true,
  paid_at timestamptz,
  paid_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_payments_case_month_unique unique(case_id,month)
);

alter table public.monthly_payments enable row level security;
create policy "authenticated users can read monthly payments" on public.monthly_payments for select to authenticated using(true);
create policy "authenticated users can insert monthly payments" on public.monthly_payments for insert to authenticated with check(true);
create policy "authenticated users can update monthly payments" on public.monthly_payments for update to authenticated using(true) with check(true);
create policy "admins can delete monthly payments" on public.monthly_payments for delete to authenticated using(public.current_role()='admin');

alter publication supabase_realtime add table public.monthly_payments;

create index if not exists monthly_payments_case_month_idx on public.monthly_payments(case_id,month);
