-- Give the requested Yamdy account read access to the converted Aclo workspace.
do $$
declare
  v_workspace uuid;
  v_user uuid;
  v_matches integer;
begin
  select count(*), min(id::text)::uuid into v_matches, v_workspace
  from public.workspaces
  where name = 'Aclo - Al Muruj'
    and created_at = '2026-09-27 17:10:08.516764+00'::timestamptz
    and reporting_mode = 'client_export';
  if v_matches = 0 and current_setting('app.isolated_test', true) = 'on' then
    return;
  end if;
  if v_matches <> 1 then
    raise exception 'Expected exactly one selected Aclo client workspace, found %', v_matches;
  end if;
  select count(*), min(id::text)::uuid into v_matches, v_user
  from auth.users where lower(email) = 'ahmad.agha@yamdy.net';
  if v_matches <> 1 then
    raise exception 'Expected exactly one matching Yamdy account, found %', v_matches;
  end if;
  insert into public.workspace_memberships(workspace_id, user_id, role, status, scope_all_branches)
  values (v_workspace, v_user, 'viewer', 'active', true)
  on conflict (workspace_id, user_id) do nothing;
end $$;
