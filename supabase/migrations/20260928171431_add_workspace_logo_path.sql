-- Workspace branding is separate from the Yamdy product mark.
alter table public.workspaces
  add column logo_path text
  check (logo_path is null or logo_path ~ '^/[a-z0-9][a-z0-9._/-]*$');

do $$
declare
  v_workspace uuid;
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
    raise exception 'Expected exactly one selected Aclo workspace, found %', v_matches;
  end if;
  update public.workspaces
  set logo_path = '/aclo-logo.jpeg', updated_at = now()
  where id = v_workspace;
end $$;
