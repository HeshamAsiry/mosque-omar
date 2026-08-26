-- Case archive + audit metadata
alter table public.cases
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists deleted_by uuid references auth.users(id),
  add column if not exists deleted_at timestamptz;

-- Keep archived records in the same table so no family/child history is lost.
-- The application uses status='archived' for the archive screen.

create index if not exists cases_status_idx on public.cases(status);
create index if not exists cases_created_by_idx on public.cases(created_by);
create index if not exists cases_deleted_by_idx on public.cases(deleted_by);
create index if not exists cases_deleted_at_idx on public.cases(deleted_at);

-- Existing rows are intentionally left with created_by NULL because their
-- original creator cannot be recovered from the current database.

-- Allow authenticated staff to archive cases while preserving the record.
drop policy if exists "reviewers can update cases" on public.cases;
create policy "staff can update cases" on public.cases
for update to authenticated
using(public.my_role() in ('admin','reviewer'))
with check(public.my_role() in ('admin','reviewer'));
