-- Yamdy foundation. All persistent database changes belong in migrations.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.workspace_role as enum ('owner', 'general_manager', 'ecommerce_manager', 'operator', 'viewer');
create type public.membership_status as enum ('active', 'invited', 'suspended');
create type public.connection_mode as enum ('mock', 'sandbox');
create type public.connection_status as enum ('draft', 'mock_ready', 'pending_credentials', 'connected', 'error');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  locale text not null default 'en' check (locale in ('en', 'ar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 120),
  created_by uuid not null references auth.users(id),
  onboarding_stage text not null default 'connect' check (onboarding_stage in ('connect', 'import', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null,
  status public.membership_status not null default 'active',
  scope_all_branches boolean not null default true,
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id),
  unique (id, workspace_id)
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 120),
  name_ar text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, workspace_id),
  unique (workspace_id, name)
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_id uuid not null,
  code text not null check (length(trim(code)) between 2 and 80),
  name text not null check (length(trim(name)) between 2 and 120),
  name_ar text,
  city text not null default '',
  timezone text not null default 'Asia/Riyadh',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  foreign key (brand_id, workspace_id) references public.brands(id, workspace_id) on delete cascade,
  unique (id, workspace_id),
  unique (workspace_id, code)
);

create table public.membership_branch_access (
  membership_id uuid not null,
  workspace_id uuid not null,
  branch_id uuid not null,
  primary key (membership_id, branch_id),
  foreign key (membership_id, workspace_id) references public.workspace_memberships(id, workspace_id) on delete cascade,
  foreign key (branch_id, workspace_id) references public.branches(id, workspace_id) on delete cascade
);

create table public.aggregator_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null check (provider = 'hungerstation'),
  mode public.connection_mode not null default 'mock',
  status public.connection_status not null default 'draft',
  display_name text not null default 'HungerStation',
  external_account_id text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, workspace_id),
  unique (workspace_id, provider)
);

-- The reference is kept in a schema unavailable to browser Data API roles.
create table private.aggregator_credentials (
  connection_id uuid primary key references public.aggregator_connections(id) on delete cascade,
  secret_ref text not null,
  created_at timestamptz not null default now()
);
revoke all on private.aggregator_credentials from public, anon, authenticated;

create table public.aggregator_branch_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  connection_id uuid not null,
  branch_id uuid not null,
  external_vendor_id text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  foreign key (connection_id, workspace_id) references public.aggregator_connections(id, workspace_id) on delete cascade,
  foreign key (branch_id, workspace_id) references public.branches(id, workspace_id) on delete cascade,
  unique (connection_id, branch_id),
  unique (connection_id, external_vendor_id)
);

create index workspace_memberships_user_idx on public.workspace_memberships(user_id, workspace_id) where status = 'active';
create index branches_workspace_idx on public.branches(workspace_id, brand_id);
create index aggregator_connections_workspace_idx on public.aggregator_connections(workspace_id);

create function private.member_role(p_workspace_id uuid)
returns public.workspace_role
language sql stable security definer set search_path = ''
as $$
  select m.role from public.workspace_memberships m
  where m.workspace_id = p_workspace_id and m.user_id = (select auth.uid()) and m.status = 'active'
  limit 1
$$;

create function private.is_member(p_workspace_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select private.member_role(p_workspace_id) is not null
$$;

create function private.can_manage(p_workspace_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select private.member_role(p_workspace_id) in ('owner', 'general_manager', 'ecommerce_manager')
$$;

create function private.can_access_branch(p_workspace_id uuid, p_branch_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_memberships m
    where m.workspace_id = p_workspace_id and m.user_id = (select auth.uid()) and m.status = 'active'
      and (m.scope_all_branches or exists (
        select 1 from public.membership_branch_access a
        where a.membership_id = m.id and a.workspace_id = p_workspace_id and a.branch_id = p_branch_id
      ))
  )
$$;

revoke all on function private.member_role(uuid), private.is_member(uuid),
  private.can_manage(uuid), private.can_access_branch(uuid, uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.member_role(uuid), private.is_member(uuid),
  private.can_manage(uuid), private.can_access_branch(uuid, uuid) to authenticated;

create function public.create_workspace(p_name text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_user uuid := auth.uid(); v_workspace uuid;
begin
  if v_user is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if length(trim(p_name)) not between 2 and 120 then raise exception 'Invalid workspace name'; end if;
  insert into public.workspaces(name, created_by) values (trim(p_name), v_user) returning id into v_workspace;
  insert into public.workspace_memberships(workspace_id, user_id, role)
    values (v_workspace, v_user, 'owner');
  return v_workspace;
end
$$;
revoke all on function public.create_workspace(text) from public, anon;
grant execute on function public.create_workspace(text) to authenticated;

create function public.create_mock_connection(p_workspace_id uuid)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_id uuid;
begin
  if private.member_role(p_workspace_id) is distinct from 'owner' then
    raise exception 'Only an owner may configure a connection' using errcode = '42501';
  end if;
  insert into public.aggregator_connections(workspace_id, provider, mode, status, created_by)
    values (p_workspace_id, 'hungerstation', 'mock', 'mock_ready', auth.uid())
    on conflict (workspace_id, provider) do update
      set status = case when public.aggregator_connections.mode = 'mock' then 'mock_ready'::public.connection_status else public.aggregator_connections.status end
    returning id into v_id;
  update public.workspaces set onboarding_stage = 'import', updated_at = now() where id = p_workspace_id;
  return v_id;
end
$$;
revoke all on function public.create_mock_connection(uuid) from public, anon;
grant execute on function public.create_mock_connection(uuid) to authenticated;

create function private.create_profile()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles(user_id, full_name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
    on conflict (user_id) do nothing;
  return new;
end
$$;
create trigger create_profile_after_signup after insert on auth.users
  for each row execute function private.create_profile();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.brands enable row level security;
alter table public.branches enable row level security;
alter table public.membership_branch_access enable row level security;
alter table public.aggregator_connections enable row level security;
alter table public.aggregator_branch_links enable row level security;

create policy profiles_self_select on public.profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy profiles_self_update on public.profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy workspace_member_select on public.workspaces for select to authenticated
  using ((select private.is_member(id)));
create policy workspace_owner_update on public.workspaces for update to authenticated
  using ((select private.member_role(id)) = 'owner')
  with check ((select private.member_role(id)) = 'owner');
create policy membership_member_select on public.workspace_memberships for select to authenticated
  using ((select private.is_member(workspace_id)));
create policy brands_member_select on public.brands for select to authenticated
  using ((select private.is_member(workspace_id)));
create policy brands_manager_insert on public.brands for insert to authenticated
  with check ((select private.can_manage(workspace_id)));
create policy brands_manager_update on public.brands for update to authenticated
  using ((select private.can_manage(workspace_id)))
  with check ((select private.can_manage(workspace_id)));
create policy branches_scoped_select on public.branches for select to authenticated
  using (private.can_access_branch(workspace_id, id));
create policy branches_manager_insert on public.branches for insert to authenticated
  with check ((select private.can_manage(workspace_id)));
create policy branches_manager_update on public.branches for update to authenticated
  using ((select private.can_manage(workspace_id)))
  with check ((select private.can_manage(workspace_id)));
create policy branch_access_member_select on public.membership_branch_access for select to authenticated
  using ((select private.is_member(workspace_id)));
create policy connections_member_select on public.aggregator_connections for select to authenticated
  using ((select private.is_member(workspace_id)));
create policy links_scoped_select on public.aggregator_branch_links for select to authenticated
  using (private.can_access_branch(workspace_id, branch_id));
create policy links_manager_insert on public.aggregator_branch_links for insert to authenticated
  with check ((select private.can_manage(workspace_id))
    and exists (select 1 from public.aggregator_connections c
      where c.id = connection_id and c.workspace_id = aggregator_branch_links.workspace_id
        and c.mode = 'mock'));

grant select on public.profiles, public.workspaces, public.workspace_memberships,
  public.brands, public.branches, public.membership_branch_access,
  public.aggregator_connections, public.aggregator_branch_links to authenticated;
grant update (full_name, locale) on public.profiles to authenticated;
grant update (name, onboarding_stage, updated_at) on public.workspaces to authenticated;
grant insert, update (name, name_ar, is_demo) on public.brands to authenticated;
grant insert, update (name, name_ar, city, timezone, is_demo) on public.branches to authenticated;
grant insert on public.aggregator_branch_links to authenticated;
grant usage on type public.workspace_role, public.membership_status,
  public.connection_mode, public.connection_status to authenticated;
