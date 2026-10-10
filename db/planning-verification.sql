-- Rollback-only fixtures; never persists sample users or planning records.
begin;
do $$
declare
 owner_id uuid := gen_random_uuid();
 other_id uuid := gen_random_uuid();
 budget_id uuid; bill_id uuid; goal_id uuid;
 affected integer;
begin
 insert into auth.users(id,aud,role,email) values
  (owner_id,'authenticated','authenticated','planning-owner-'||owner_id||'@example.invalid'),
  (other_id,'authenticated','authenticated','planning-other-'||other_id||'@example.invalid');
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 perform set_config('request.jwt.claims',json_build_object('sub',owner_id,'role','authenticated')::text,true);
 execute 'set local role authenticated';
 insert into public.budgets(user_id,month,category,amount) values(owner_id,'2026-10-01','Food',100) returning id into budget_id;
 insert into public.bills(user_id,name,due_date,category,amount) values(owner_id,'Sample bill','2026-10-20','Bills',50) returning id into bill_id;
 insert into public.savings_goals(user_id,name,target_date,target_amount,saved_amount) values(owner_id,'Sample goal','2026-12-01',100,20) returning id into goal_id;
 update public.budgets set amount=200 where id=budget_id;
 update public.bills set status='paid' where id=bill_id;
 update public.savings_goals set saved_amount=30 where id=goal_id;
 if not exists(select 1 from public.budgets where id=budget_id and amount=200) or
    not exists(select 1 from public.bills where id=bill_id and status='paid') or
    not exists(select 1 from public.savings_goals where id=goal_id and saved_amount=30) then
   raise exception 'Owner reads or writes failed';
 end if;
 begin
  update public.budgets set user_id=other_id where id=budget_id;
  raise exception 'Owner reassignment allowed';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.budgets(user_id,month,category,amount) values(owner_id,'2026-10-01','Food',200);
  raise exception 'Duplicate budget allowed';
 exception when unique_violation then null; end;
 begin
  update public.savings_goals set saved_amount=101 where id=goal_id;
  raise exception 'Overallocated savings allowed';
 exception when check_violation then null; end;
 perform set_config('request.jwt.claim.sub',other_id::text,true);
 perform set_config('request.jwt.claims',json_build_object('sub',other_id,'role','authenticated')::text,true);
 if exists(select 1 from public.budgets where id=budget_id) or exists(select 1 from public.bills where id=bill_id) or exists(select 1 from public.savings_goals where id=goal_id) then
   raise exception 'Cross-user rows visible';
 end if;
 update public.budgets set amount=300 where id=budget_id;
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Cross-user budget update allowed'; end if;
 update public.bills set status='pending' where id=bill_id;
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Cross-user bill update allowed'; end if;
 update public.savings_goals set saved_amount=0 where id=goal_id;
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Cross-user goal update allowed'; end if;
 begin
  insert into public.bills(user_id,name,due_date,category,amount) values(owner_id,'Invalid owner','2026-10-20','Bills',50);
  raise exception 'Cross-user insert allowed';
 exception when insufficient_privilege then null; end;
 begin
  delete from public.bills where id=bill_id;
  raise exception 'Delete permission allowed';
 exception when insufficient_privilege then null; end;
 execute 'reset role';
 execute 'set local role anon';
 begin
  perform 1 from public.budgets;
  raise exception 'Anonymous budgets read allowed';
 exception when insufficient_privilege then null; end;
 begin
  perform 1 from public.bills;
  raise exception 'Anonymous bills read allowed';
 exception when insufficient_privilege then null; end;
 begin
  perform 1 from public.savings_goals;
  raise exception 'Anonymous goals read allowed';
 exception when insufficient_privilege then null; end;
 execute 'reset role';
end $$;
select 'Owner CRUD, ownership checks, constraints and anonymous access tests passed; all fixtures rolled back' as result;
rollback;
