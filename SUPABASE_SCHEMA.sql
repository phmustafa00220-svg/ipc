create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'عامل صحي',
  facility_id text default 'all',
  department text default 'ضبط العدوى',
  status text default 'نشط',
  created_at timestamptz default now()
);

create table if not exists public.app_state (
  id text primary key default 'main',
  state jsonb not null,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id)
);

alter table public.profiles enable row level security;
alter table public.app_state enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_admin_or_self" on public.profiles;
create policy "profiles_update_admin_or_self"
on public.profiles for update
to authenticated
using (
  auth.uid() = id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('مدير النظام','مدير منشأة','مسؤول ضبط العدوى')
  )
)
with check (
  auth.uid() = id
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role in ('مدير النظام','مدير منشأة','مسؤول ضبط العدوى')
  )
);

drop policy if exists "state_select_authenticated" on public.app_state;
create policy "state_select_authenticated"
on public.app_state for select
to authenticated
using (true);

drop policy if exists "state_write_authorized" on public.app_state;
create policy "state_write_authorized"
on public.app_state for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create or replace function public.touch_app_state()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists touch_app_state_trigger on public.app_state;
create trigger touch_app_state_trigger
before insert or update on public.app_state
for each row execute function public.touch_app_state();
