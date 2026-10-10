begin;
create table public.rider_logs (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 date date not null, platform text not null check(platform in ('PickMe','Uber')),
 trips integer not null check(trips >= 0), hours numeric(6,2) not null check(hours > 0 and hours <= 24),
 distance numeric(10,2) not null default 0 check(distance >= 0),
 gross numeric(14,2) not null check(gross >= 0), commission numeric(14,2) not null default 0 check(commission >= 0),
 fuel numeric(14,2) not null default 0 check(fuel >= 0), other_cost numeric(14,2) not null default 0 check(other_cost >= 0),
 note text, created_at timestamptz not null default now()
);
create table public.casino_shifts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 starts_at timestamptz not null, ends_at timestamptz not null,
 break_minutes integer not null default 0 check(break_minutes >= 0),
 table_game text not null, tips numeric(14,2) not null default 0 check(tips >= 0), note text,
 created_at timestamptz not null default now(),
 check(ends_at > starts_at and ends_at <= starts_at + interval '24 hours'),
 check(extract(epoch from (ends_at-starts_at))/60 > break_minutes)
);
alter table public.rider_logs enable row level security;
alter table public.casino_shifts enable row level security;
create policy rider_owner on public.rider_logs for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy shift_owner on public.casino_shifts for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
grant select, insert, update, delete on public.rider_logs, public.casino_shifts to authenticated;
revoke all on public.rider_logs, public.casino_shifts from anon;
create index rider_logs_owner_date on public.rider_logs(user_id,date);
create index casino_shifts_owner_date on public.casino_shifts(user_id,starts_at);
create policy cj_income_integrity on public.income as restrictive for all to authenticated
 using(user_id=(select auth.uid()))
 with check(user_id=(select auth.uid()) and amount > 0 and amount < 1000000000000 and (account_id is null or exists(select 1 from public.accounts a where a.id=account_id and a.user_id=(select auth.uid()))));
create policy cj_expense_integrity on public.expenses as restrictive for all to authenticated
 using(user_id=(select auth.uid()))
 with check(user_id=(select auth.uid()) and amount > 0 and amount < 1000000000000 and (account_id is null or exists(select 1 from public.accounts a where a.id=account_id and a.user_id=(select auth.uid()))));
create policy cj_transfer_integrity on public.transactions as restrictive for all to authenticated
 using(user_id=(select auth.uid()))
 with check(user_id=(select auth.uid()) and amount > 0 and amount < 1000000000000 and from_account_id <> to_account_id and from_account_id is not null and to_account_id is not null
 and exists(select 1 from public.accounts a where a.id=from_account_id and a.user_id=(select auth.uid()))
 and exists(select 1 from public.accounts a where a.id=to_account_id and a.user_id=(select auth.uid())));
commit;
