-- Keep the internal draft creative paths aligned with the Aclo studio banners.
do $$
declare v_workspace uuid; v_count integer;
begin
  select count(*) into v_count from public.workspaces
    where name='Aclo - Al Muruj' and reporting_mode='client_export'
      and created_at='2026-09-27 17:10:08.516764+00'::timestamptz;
  if v_count=0 and current_setting('app.isolated_test', true)='on' then return; end if;
  if v_count<>1 then raise exception 'Expected selected Aclo workspace, found %',v_count; end if;
  select id into v_workspace from public.workspaces
    where name='Aclo - Al Muruj' and reporting_mode='client_export'
      and created_at='2026-09-27 17:10:08.516764+00'::timestamptz;
  update public.demo_drafts set
    payload=jsonb_set(payload,'{image_path}','"/aclo-demo/promotion.png"'::jsonb), updated_at=now()
    where workspace_id=v_workspace and kind='promotion' and title='Morning Box + Peach Tea Concept';
  if not found then raise exception 'Aclo promotion concept is missing'; end if;
  update public.demo_drafts set
    payload=jsonb_set(payload,'{image_path}','"/aclo-demo/marketing.png"'::jsonb), updated_at=now()
    where workspace_id=v_workspace and kind='campaign' and title='Aclo Morning Box Story';
  if not found then raise exception 'Aclo marketing concept is missing'; end if;
end $$;
