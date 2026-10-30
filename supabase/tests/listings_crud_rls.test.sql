begin;

select plan(6);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.listings'::regclass),
  'listings has row level security enabled'
);

select ok(has_table_privilege('authenticated', 'public.listings', 'SELECT'), 'authenticated can select listings');
select ok(has_table_privilege('authenticated', 'public.listings', 'INSERT'), 'authenticated can insert listings');
select ok(has_table_privilege('authenticated', 'public.listings', 'UPDATE'), 'authenticated can update listings');
select ok(has_table_privilege('authenticated', 'public.listings', 'DELETE'), 'authenticated can delete listings');

select is(
  (select count(*)::integer
   from pg_policies
   where schemaname = 'public'
     and tablename = 'listings'
     and policyname in (
       'Authenticated users can read active or owned listings',
       'Authenticated users can create their own listings',
       'Sellers can update their own listings',
       'Sellers can delete their own listings'
     )),
  4,
  'all four listing CRUD policies exist'
);

select * from finish();
rollback;
