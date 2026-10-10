-- Additive schema, applied through Supabase migration cj_planning_v1.
-- No existing tables, policies or records are modified.
create table public.budgets (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 month date not null check (extract(day from month)=1),
 category text not null check (category in ('Food','Rent','Transport','Bills','Education','Health','Shopping','Other')),
 amount numeric(14,2) not null check (amount>0 and amount<1000000000000),
 created_at timestamptz not null default now(),
 unique (user_id,month,category)
);
create table public.bills (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 name text not null check (length(trim(name)) between 1 and 100),
 due_date date not null,
 category text not null check (category in ('Food','Rent','Transport','Bills','Education','Health','Shopping','Other')),
 amount numeric(14,2) not null check (amount>0 and amount<1000000000000),
 status text not null default 'pending' check (status in ('pending','paid')),
 note text check (length(note)<=500),
 created_at timestamptz not null default now()
);
create table public.savings_goals (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 name text not null check (length(trim(name)) between 1 and 100),
 target_amount numeric(14,2) not null check (target_amount>0 and target_amount<1000000000000),
 saved_amount numeric(14,2) not null default 0 check (saved_amount>=0 and saved_amount<=target_amount),
 target_date date not null,
 note text check (length(note)<=500),
 created_at timestamptz not null default now()
);
create index bills_owner_due_idx on public.bills(user_id,due_date);
create index savings_goals_owner_idx on public.savings_goals(user_id);
alter table public.budgets enable row level security;
alter table public.bills enable row level security;
alter table public.savings_goals enable row level security;
revoke all on public.budgets,public.bills,public.savings_goals from public,anon,authenticated;
grant select,insert,update on public.budgets,public.bills,public.savings_goals to authenticated;
create policy budgets_owner_read on public.budgets for select to authenticated using ((select auth.uid())=user_id);
create policy budgets_owner_insert on public.budgets for insert to authenticated with check ((select auth.uid())=user_id);
create policy budgets_owner_update on public.budgets for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy bills_owner_read on public.bills for select to authenticated using ((select auth.uid())=user_id);
create policy bills_owner_insert on public.bills for insert to authenticated with check ((select auth.uid())=user_id);
create policy bills_owner_update on public.bills for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy savings_goals_owner_read on public.savings_goals for select to authenticated using ((select auth.uid())=user_id);
create policy savings_goals_owner_insert on public.savings_goals for insert to authenticated with check ((select auth.uid())=user_id);
create policy savings_goals_owner_update on public.savings_goals for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
