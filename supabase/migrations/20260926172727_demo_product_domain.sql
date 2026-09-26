-- Workspace-owned demo operating data. No external-channel state is written here.
create table public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_id uuid not null,
  sku text not null,
  name_en text not null,
  name_ar text not null default '',
  category text not null,
  description_en text not null default '',
  price_sar numeric(10,2) not null check (price_sar >= 0),
  cost_sar numeric(10,2) check (cost_sar >= 0),
  listing_quality smallint not null default 70 check (listing_quality between 0 and 100),
  is_demo boolean not null default true check (is_demo),
  updated_at timestamptz not null default now(),
  foreign key (brand_id, workspace_id) references public.brands(id, workspace_id),
  unique (id, workspace_id),
  unique (workspace_id, sku)
);

create table public.product_branch_state (
  workspace_id uuid not null,
  product_id uuid not null,
  branch_id uuid not null,
  is_available boolean not null default true,
  price_sar numeric(10,2) not null check (price_sar >= 0),
  is_demo boolean not null default true check (is_demo),
  updated_at timestamptz not null default now(),
  primary key (product_id, branch_id),
  foreign key (product_id, workspace_id) references public.catalog_products(id, workspace_id) on delete cascade,
  foreign key (branch_id, workspace_id) references public.branches(id, workspace_id) on delete cascade
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  branch_id uuid,
  product_id uuid,
  demo_key text not null,
  domain text not null check (domain in ('operational','pricing','marketing','promotions','listings')),
  title text not null,
  description text not null,
  priority text not null check (priority in ('critical','high','medium','low')),
  status text not null default 'recommended' check (status in ('recommended','in_review','dismissed','resolved','simulated')),
  estimated_impact_sar numeric(10,2),
  confidence smallint check (confidence between 0 and 100),
  evidence jsonb not null default '{}'::jsonb,
  recommendation jsonb not null default '{}'::jsonb,
  source text not null default 'demo' check (source = 'demo'),
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (branch_id, workspace_id) references public.branches(id, workspace_id),
  foreign key (product_id, workspace_id) references public.catalog_products(id, workspace_id),
  unique (id, workspace_id),
  unique (workspace_id, demo_key)
);

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  opportunity_id uuid not null,
  branch_id uuid,
  requested_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  rationale text not null default '',
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (opportunity_id, workspace_id) references public.opportunities(id, workspace_id),
  foreign key (branch_id, workspace_id) references public.branches(id, workspace_id),
  unique (id, workspace_id),
  unique (opportunity_id)
);

create table public.demo_executions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  approval_id uuid not null,
  status text not null default 'simulated' check (status = 'simulated'),
  external_confirmation text not null default 'not_confirmed' check (external_confirmation = 'not_confirmed'),
  explanation text not null default 'Demo only: no channel request was sent.',
  created_at timestamptz not null default now(),
  foreign key (approval_id, workspace_id) references public.approval_requests(id, workspace_id),
  unique (approval_id)
);

create table public.demo_audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_kind text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  is_demo boolean not null default true check (is_demo),
  created_at timestamptz not null default now()
);

create table public.demo_drafts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kind text not null check (kind in ('promotion','bundle','campaign','content')),
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','sample')),
  created_by uuid references auth.users(id),
  is_demo boolean not null default true check (is_demo),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, kind, title)
);

create table public.performance_daily (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  branch_id uuid not null,
  day date not null,
  orders integer not null check (orders >= 0),
  revenue_sar numeric(12,2) not null check (revenue_sar >= 0),
  ad_spend_sar numeric(12,2) not null check (ad_spend_sar >= 0),
  source text not null default 'demo' check (source = 'demo'),
  primary key (branch_id, day),
  foreign key (branch_id, workspace_id) references public.branches(id, workspace_id) on delete cascade
);

create index opportunities_workspace_status_idx on public.opportunities(workspace_id, status, priority);
create index approval_requests_workspace_status_idx on public.approval_requests(workspace_id, status);
create index demo_audit_events_workspace_created_idx on public.demo_audit_events(workspace_id, created_at desc);

create function private.can_view_demo_scope(p_workspace_id uuid, p_branch_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_member(p_workspace_id)
    and (p_branch_id is null or private.can_access_branch(p_workspace_id, p_branch_id))
$$;
revoke all on function private.can_view_demo_scope(uuid,uuid) from public, anon;
grant execute on function private.can_view_demo_scope(uuid,uuid) to authenticated;

alter table public.catalog_products enable row level security;
alter table public.product_branch_state enable row level security;
alter table public.opportunities enable row level security;
alter table public.approval_requests enable row level security;
alter table public.demo_executions enable row level security;
alter table public.demo_audit_events enable row level security;
alter table public.demo_drafts enable row level security;
alter table public.performance_daily enable row level security;

create policy catalog_products_member_read on public.catalog_products for select to authenticated
  using ((select private.is_member(workspace_id)));
create policy product_branch_state_scoped_read on public.product_branch_state for select to authenticated
  using (private.can_access_branch(workspace_id,branch_id));
create policy opportunities_scoped_read on public.opportunities for select to authenticated
  using (private.can_view_demo_scope(workspace_id,branch_id));
create policy approval_requests_scoped_read on public.approval_requests for select to authenticated
  using (private.can_view_demo_scope(workspace_id,branch_id));
create policy demo_executions_member_read on public.demo_executions for select to authenticated
  using ((select private.is_member(workspace_id)) and exists (
    select 1 from public.approval_requests a where a.id = approval_id
  ));
create policy demo_audit_events_member_read on public.demo_audit_events for select to authenticated
  using ((select private.is_member(workspace_id)));
create policy demo_drafts_member_read on public.demo_drafts for select to authenticated
  using ((select private.is_member(workspace_id)));
create policy performance_daily_scoped_read on public.performance_daily for select to authenticated
  using (private.can_access_branch(workspace_id,branch_id));

grant select on public.catalog_products, public.product_branch_state, public.opportunities,
  public.approval_requests, public.demo_executions, public.demo_audit_events,
  public.demo_drafts, public.performance_daily to authenticated;

create function public.bootstrap_demo_workspace(p_workspace_id uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_brand uuid;
  v_branch uuid;
  v_burger uuid;
  v_chicken uuid;
  v_pricing uuid;
  v_count integer;
begin
  if not coalesce(private.can_manage(p_workspace_id),false) then
    raise exception 'Workspace management permission required' using errcode = '42501';
  end if;
  if not exists (select 1 from public.aggregator_connections c
                 where c.workspace_id = p_workspace_id and c.mode = 'mock') then
    raise exception 'A mock connection is required' using errcode = '42501';
  end if;
  select b.id into v_brand from public.brands b where b.workspace_id = p_workspace_id
    order by b.created_at limit 1;
  select b.id into v_branch from public.branches b where b.workspace_id = p_workspace_id
    order by b.code limit 1;
  if v_brand is null or v_branch is null then
    raise exception 'Import a sample brand and branch first';
  end if;

  insert into public.catalog_products(workspace_id,brand_id,sku,name_en,name_ar,category,description_en,price_sar,cost_sar,listing_quality)
  values
    (p_workspace_id,v_brand,'DEMO-BURGER','Classic Burger','برجر كلاسيك','Burgers','Beef patty, house sauce and crisp lettuce.',42,16.5,76),
    (p_workspace_id,v_brand,'DEMO-CHICKEN','Chicken Meal','وجبة الدجاج','Meals','Grilled chicken, rice and house sauce.',38,14.2,82),
    (p_workspace_id,v_brand,'DEMO-SHAWARMA','Shawarma Wrap','ساندويتش شاورما','Sandwiches','Chicken shawarma with garlic sauce.',29,10.8,91),
    (p_workspace_id,v_brand,'DEMO-FAMILY','Family Feast','وجبة عائلية','Bundles','A generous meal for four.',129,53,68),
    (p_workspace_id,v_brand,'DEMO-FRIES','Loaded Fries','بطاطس محملة','Sides','Crisp fries with house seasoning.',19,6.4,73),
    (p_workspace_id,v_brand,'DEMO-DRINK','Mint Lemonade','ليموناضة بالنعناع','Drinks','Fresh lemon and mint.',17,4.1,88)
  on conflict (workspace_id,sku) do nothing;

  insert into public.product_branch_state(workspace_id,product_id,branch_id,is_available,price_sar)
  select p_workspace_id,p.id,b.id,
    not (p.sku = 'DEMO-CHICKEN' and b.id = v_branch),p.price_sar
  from public.catalog_products p cross join public.branches b
  where p.workspace_id = p_workspace_id and b.workspace_id = p_workspace_id
  on conflict (product_id,branch_id) do nothing;

  select id into v_burger from public.catalog_products where workspace_id=p_workspace_id and sku='DEMO-BURGER';
  select id into v_chicken from public.catalog_products where workspace_id=p_workspace_id and sku='DEMO-CHICKEN';
  insert into public.opportunities(workspace_id,branch_id,product_id,demo_key,domain,title,description,priority,estimated_impact_sar,confidence,evidence,recommendation,observed_at)
  values
    (p_workspace_id,v_branch,v_chicken,'availability-chicken','operational','Your best-selling Chicken Meal is unavailable','The sample branch is marked unavailable during its lunch window.','critical',860,94,'{"source":"sample catalog","window":"last 7 days","observed_orders":112}'::jsonb,'{"action":"review availability","risk":"No external write"}'::jsonb,now()-interval '18 minutes'),
    (p_workspace_id,v_branch,v_burger,'price-burger','pricing','Your Classic Burger may be overpriced','Review a simulated SAR 42 to SAR 39 price test. Market and elasticity figures are illustrative.','high',1320,78,'{"source":"synthetic comparison","current_price":42,"sample_range":"SAR 36–40"}'::jsonb,'{"proposed_price":39,"test_days":7,"requires_approval":true}'::jsonb,now()-interval '2 hours'),
    (p_workspace_id,v_branch,null,'marketing-lunch','marketing','Lunch impressions are falling while conversion remains strong','A sample campaign brief may help explore a lunch placement. Advertising access is unverified.','medium',940,68,'{"source":"synthetic campaign metrics","window":"14 days"}'::jsonb,'{"action":"create internal campaign draft"}'::jsonb,now()-interval '5 hours'),
    (p_workspace_id,v_branch,null,'promotion-tuesday','promotions','Tuesday afternoon demand is consistently weak','Explore an internal promotion draft for quiet weekday hours.','medium',620,71,'{"source":"synthetic order pattern","window":"28 days"}'::jsonb,'{"action":"create internal promotion draft"}'::jsonb,now()-interval '1 day'),
    (p_workspace_id,v_branch,v_burger,'listing-burger','listings','Classic Burger listing can be clearer','Improve copy in an internal draft; content publishing is unverified.','low',210,82,'{"source":"sample listing review","quality":76}'::jsonb,'{"action":"edit internal listing draft"}'::jsonb,now()-interval '2 days')
  on conflict (workspace_id,demo_key) do nothing;

  select id into v_pricing from public.opportunities where workspace_id=p_workspace_id and demo_key='price-burger';
  insert into public.approval_requests(workspace_id,opportunity_id,branch_id,requested_by,rationale)
  values (p_workspace_id,v_pricing,v_branch,null,'Seeded demo review: a separate sample requester proposed this price test.')
  on conflict (opportunity_id) do nothing;
  update public.opportunities set status='in_review',updated_at=now()
    where id=v_pricing and status='recommended';

  insert into public.demo_drafts(workspace_id,kind,title,payload,status)
  values
    (p_workspace_id,'promotion','Tuesday Afternoon Boost','{"objective":"Increase quiet-hour orders","discount":"15% off selected meals","channel":"internal demo"}'::jsonb,'sample'),
    (p_workspace_id,'bundle','Family Lunch Combo','{"items":["Chicken Meal","Loaded Fries","Mint Lemonade"],"price_sar":69,"channel":"internal demo"}'::jsonb,'sample'),
    (p_workspace_id,'campaign','Lunch Rush Awareness','{"objective":"Increase lunch orders","budget_sar":1200,"channel":"internal demo"}'::jsonb,'sample')
  on conflict (workspace_id,kind,title) do nothing;

  insert into public.performance_daily(workspace_id,branch_id,day,orders,revenue_sar,ad_spend_sar)
  select p_workspace_id,b.id,current_date-g.day,
    48 + ((g.day*7 + ascii(right(b.code,1))) % 31),
    (48 + ((g.day*7 + ascii(right(b.code,1))) % 31)) * 39.5,
    80 + ((g.day*11) % 38)
  from public.branches b cross join generate_series(0,27) as g(day)
  where b.workspace_id = p_workspace_id
  on conflict (branch_id,day) do nothing;

  select count(*) into v_count from public.catalog_products where workspace_id=p_workspace_id;
  return v_count;
end
$$;
revoke all on function public.bootstrap_demo_workspace(uuid) from public,anon;
grant execute on function public.bootstrap_demo_workspace(uuid) to authenticated;

create function public.demo_update_opportunity(p_opportunity_id uuid,p_action text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_opp public.opportunities%rowtype; v_role public.workspace_role;
begin
  select * into v_opp from public.opportunities where id=p_opportunity_id for update;
  if not found then raise exception 'Opportunity not found'; end if;
  v_role := private.member_role(v_opp.workspace_id);
  if v_role is null or (v_opp.branch_id is not null and not private.can_access_branch(v_opp.workspace_id,v_opp.branch_id)) then
    raise exception 'Opportunity access denied' using errcode='42501';
  end if;
  if v_role = 'viewer' then raise exception 'Viewer cannot change opportunities' using errcode='42501'; end if;
  if v_role = 'operator' and v_opp.domain <> 'operational' then
    raise exception 'Operator cannot change commercial opportunities' using errcode='42501';
  end if;
  if p_action = 'dismiss' then
    update public.opportunities set status='dismissed',updated_at=now() where id=p_opportunity_id;
  elsif p_action = 'resolve' and v_opp.domain = 'operational' then
    update public.opportunities set status='resolved',updated_at=now() where id=p_opportunity_id;
    if v_opp.product_id is not null and v_opp.branch_id is not null then
      update public.product_branch_state set is_available=true,updated_at=now()
        where product_id=v_opp.product_id and branch_id=v_opp.branch_id and is_demo;
    end if;
  elsif p_action = 'request' then
    insert into public.approval_requests(workspace_id,opportunity_id,branch_id,requested_by,rationale)
      values(v_opp.workspace_id,v_opp.id,v_opp.branch_id,auth.uid(),'Requested from Yamdy demo workspace')
      on conflict (opportunity_id) do nothing;
    update public.opportunities set status='in_review',updated_at=now() where id=p_opportunity_id;
  else
    raise exception 'Unsupported demo action';
  end if;
  insert into public.demo_audit_events(workspace_id,actor_user_id,action,entity_kind,entity_id)
    values(v_opp.workspace_id,auth.uid(),p_action,'opportunity',p_opportunity_id);
  return p_action;
end
$$;
revoke all on function public.demo_update_opportunity(uuid,text) from public,anon;
grant execute on function public.demo_update_opportunity(uuid,text) to authenticated;

create function public.demo_decide_approval(p_approval_id uuid,p_decision text,p_reason text default '')
returns text language plpgsql security definer set search_path = '' as $$
declare v_approval public.approval_requests%rowtype; v_opp public.opportunities%rowtype; v_role public.workspace_role;
begin
  select * into v_approval from public.approval_requests where id=p_approval_id for update;
  if not found then raise exception 'Approval not found'; end if;
  select * into v_opp from public.opportunities where id=v_approval.opportunity_id;
  v_role := private.member_role(v_approval.workspace_id);
  if v_role is null or (v_approval.branch_id is not null and not private.can_access_branch(v_approval.workspace_id,v_approval.branch_id)) then
    raise exception 'Approval access denied' using errcode='42501';
  end if;
  if v_role not in ('owner','general_manager') then
    raise exception 'Approval role required' using errcode='42501';
  end if;
  if v_approval.status <> 'pending' then raise exception 'Approval is already decided'; end if;
  if v_approval.requested_by = auth.uid() and v_opp.domain <> 'operational' then
    raise exception 'A separate reviewer is required for a commercial change' using errcode='42501';
  end if;
  if p_decision not in ('approved','rejected') then raise exception 'Unsupported decision'; end if;
  update public.approval_requests set status=p_decision,reviewed_by=auth.uid(),
    rationale=left(trim(p_reason),1000),decided_at=now() where id=p_approval_id;
  if p_decision='approved' then
    insert into public.demo_executions(workspace_id,approval_id)
      values(v_approval.workspace_id,p_approval_id) on conflict (approval_id) do nothing;
    update public.opportunities set status='simulated',updated_at=now() where id=v_opp.id;
  else
    update public.opportunities set status='dismissed',updated_at=now() where id=v_opp.id;
  end if;
  insert into public.demo_audit_events(workspace_id,actor_user_id,action,entity_kind,entity_id,details)
    values(v_approval.workspace_id,auth.uid(),p_decision,'approval',p_approval_id,
      jsonb_build_object('channel_request_sent',false,'reason',left(trim(p_reason),1000)));
  return p_decision;
end
$$;
revoke all on function public.demo_decide_approval(uuid,text,text) from public,anon;
grant execute on function public.demo_decide_approval(uuid,text,text) to authenticated;

create function public.demo_save_product_draft(p_product_id uuid,p_name_en text,p_name_ar text,p_description_en text,p_price_sar numeric)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_product public.catalog_products%rowtype;
begin
  select * into v_product from public.catalog_products where id=p_product_id for update;
  if not found then raise exception 'Product not found'; end if;
  if not coalesce(private.can_manage(v_product.workspace_id),false) then
    raise exception 'Catalog draft permission required' using errcode='42501';
  end if;
  if not v_product.is_demo or length(trim(p_name_en)) < 2 or p_price_sar < 0 then
    raise exception 'Invalid demo product draft';
  end if;
  update public.catalog_products set name_en=trim(p_name_en),name_ar=trim(p_name_ar),
    description_en=trim(p_description_en),price_sar=p_price_sar,updated_at=now()
    where id=p_product_id;
  insert into public.demo_audit_events(workspace_id,actor_user_id,action,entity_kind,entity_id,details)
    values(v_product.workspace_id,auth.uid(),'save_draft','product',p_product_id,
      jsonb_build_object('channel_request_sent',false));
  return p_product_id;
end
$$;
revoke all on function public.demo_save_product_draft(uuid,text,text,text,numeric) from public,anon;
grant execute on function public.demo_save_product_draft(uuid,text,text,text,numeric) to authenticated;

create function public.demo_save_draft(p_workspace_id uuid,p_kind text,p_title text,p_payload jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not coalesce(private.can_manage(p_workspace_id),false) then
    raise exception 'Draft management permission required' using errcode='42501';
  end if;
  if p_kind not in ('promotion','bundle','campaign','content') or length(trim(p_title)) not between 3 and 120 then
    raise exception 'Invalid demo draft';
  end if;
  insert into public.demo_drafts(workspace_id,kind,title,payload,created_by)
    values(p_workspace_id,p_kind,trim(p_title),coalesce(p_payload,'{}'::jsonb),auth.uid())
    on conflict (workspace_id,kind,title) do update set payload=excluded.payload,updated_at=now()
    returning id into v_id;
  insert into public.demo_audit_events(workspace_id,actor_user_id,action,entity_kind,entity_id,details)
    values(p_workspace_id,auth.uid(),'save_draft',p_kind,v_id,
      jsonb_build_object('channel_request_sent',false));
  return v_id;
end
$$;
revoke all on function public.demo_save_draft(uuid,text,text,jsonb) from public,anon;
grant execute on function public.demo_save_draft(uuid,text,text,jsonb) to authenticated;
