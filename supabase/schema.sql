create extension if not exists pgcrypto;

create type case_type as enum ('aid', 'orphan_sponsorship');
create type child_gender as enum ('male', 'female');
create type case_status as enum ('active', 'waiting', 'inactive');

create table public.cases (
  id uuid primary key default gen_random_uuid(),
  mother_name text not null,
  phone text not null,
  address text not null,
  case_type case_type not null,
  notes text,
  status case_status not null default 'active',
  priority_override integer,
  priority_reason text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  name text not null,
  gender child_gender not null,
  birth_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.amount_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  case_type case_type not null,
  child_count integer,
  amount numeric(12,2) not null check (amount >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.cases enable row level security;
alter table public.children enable row level security;
alter table public.amount_rules enable row level security;
alter table public.audit_logs enable row level security;

create policy "authenticated users can read cases" on public.cases for select to authenticated using (true);
create policy "authenticated users can insert cases" on public.cases for insert to authenticated with check (true);
create policy "authenticated users can update cases" on public.cases for update to authenticated using (true) with check (true);

create policy "authenticated users can read children" on public.children for select to authenticated using (true);
create policy "authenticated users can insert children" on public.children for insert to authenticated with check (true);
create policy "authenticated users can update children" on public.children for update to authenticated using (true) with check (true);
create policy "authenticated users can delete children" on public.children for delete to authenticated using (true);

create policy "authenticated users can read amount rules" on public.amount_rules for select to authenticated using (true);
create policy "authenticated users can manage amount rules" on public.amount_rules for all to authenticated using (true) with check (true);

create policy "authenticated users can read audit logs" on public.audit_logs for select to authenticated using (true);
create policy "authenticated users can insert audit logs" on public.audit_logs for insert to authenticated with check (true);

alter publication supabase_realtime add table public.cases;
alter publication supabase_realtime add table public.children;
alter publication supabase_realtime add table public.amount_rules;

insert into public.amount_rules (name, case_type, child_count, amount)
values
  ('مساعدات', 'aid', 0, 100),
  ('كفالة طفل', 'orphan_sponsorship', 1, 75)
;
