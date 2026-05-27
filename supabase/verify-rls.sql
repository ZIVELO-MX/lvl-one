-- LVL ONE — RLS Verification
-- Checks table-level RLS + policy coverage

-- 1. Tables with RLS enabled
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename not in ('schema_migrations', 'supabase_migrations')
order by tablename;

-- 2. All policies
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 3. Tables with RLS but NO policies (gaps)
select t.tablename
from pg_tables t
where t.schemaname = 'public'
  and t.tablename not in ('schema_migrations', 'supabase_migrations')
  and t.rowsecurity = true
  and not exists (
    select 1 from pg_policies p
    where p.schemaname = t.schemaname
      and p.tablename = t.tablename
  );

-- 4. Tables WITHOUT RLS (missing)
select tablename
from pg_tables
where schemaname = 'public'
  and tablename not in ('schema_migrations', 'supabase_migrations')
  and rowsecurity = false;
