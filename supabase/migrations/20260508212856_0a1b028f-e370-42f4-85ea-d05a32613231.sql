
-- Roles enum and table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "user can read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

-- Items table
create table public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null check (category in ('apps','websites','trending')),
  url text not null,
  cta text not null default 'زيارة الموقع',
  badge text,
  views text,
  emoji text not null default '✨',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.items enable row level security;

create policy "items public read" on public.items
  for select using (true);

create policy "admin insert items" on public.items
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));

create policy "admin update items" on public.items
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "admin delete items" on public.items
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger items_updated_at before update on public.items
  for each row execute function public.set_updated_at();

-- Auto-make first signup an admin
create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_role();
