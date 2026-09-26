-- Demo audit entries tied to a branch inherit that branch's read boundary.
alter table public.demo_audit_events
  add column branch_id uuid,
  add constraint demo_audit_events_branch_workspace_fkey
    foreign key (branch_id,workspace_id) references public.branches(id,workspace_id);

create function private.assign_demo_audit_branch()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.entity_kind = 'opportunity' then
    select o.branch_id into new.branch_id from public.opportunities o
      where o.id = new.entity_id and o.workspace_id = new.workspace_id;
  elsif new.entity_kind = 'approval' then
    select a.branch_id into new.branch_id from public.approval_requests a
      where a.id = new.entity_id and a.workspace_id = new.workspace_id;
  end if;
  return new;
end
$$;
revoke all on function private.assign_demo_audit_branch() from public, anon, authenticated;

create trigger assign_demo_audit_branch_before_insert
  before insert on public.demo_audit_events
  for each row execute function private.assign_demo_audit_branch();

update public.demo_audit_events e set branch_id = o.branch_id
  from public.opportunities o
  where e.entity_kind='opportunity' and e.entity_id=o.id
    and e.workspace_id=o.workspace_id;
update public.demo_audit_events e set branch_id = a.branch_id
  from public.approval_requests a
  where e.entity_kind='approval' and e.entity_id=a.id
    and e.workspace_id=a.workspace_id;

drop policy demo_audit_events_member_read on public.demo_audit_events;
create policy demo_audit_events_scoped_read on public.demo_audit_events
  for select to authenticated
  using (private.can_view_demo_scope(workspace_id,branch_id));
