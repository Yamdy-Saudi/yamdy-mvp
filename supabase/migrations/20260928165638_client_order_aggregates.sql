-- Imported order-report aggregates are observed data, separate from demo fixtures.
alter table public.workspaces
  add column reporting_mode text not null default 'demo'
    check (reporting_mode in ('demo', 'client_export'));

alter table public.branches add column archived_at timestamptz;

create table public.order_import_batches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  branch_id uuid not null,
  source text not null check (source = 'hungerstation_order_details_export'),
  source_files_sha256 text not null check (length(source_files_sha256) = 64),
  source_store_sha256 text not null check (length(source_store_sha256) = 64),
  source_file_count integer not null check (source_file_count > 0),
  source_order_count integer not null check (source_order_count >= 0),
  first_order_day date not null,
  last_order_day date not null check (last_order_day >= first_order_day),
  imported_at timestamptz not null default now(),
  foreign key (branch_id, workspace_id) references public.branches(id, workspace_id),
  unique (id, workspace_id),
  unique (workspace_id, source_files_sha256)
);

create table public.order_performance_daily (
  workspace_id uuid not null,
  branch_id uuid not null,
  import_batch_id uuid not null,
  day date not null,
  delivered_orders integer not null check (delivered_orders >= 0),
  cancelled_orders integer not null check (cancelled_orders >= 0),
  complaint_orders integer not null check (complaint_orders >= 0),
  gross_sales_sar numeric(12,2) not null check (gross_sales_sar >= 0),
  reported_payout_sar numeric(12,2) not null,
  estimated_earnings_sar numeric(12,2) not null,
  vendor_discount_sar numeric(12,2) not null check (vendor_discount_sar >= 0),
  commission_sar numeric(12,2) not null check (commission_sar >= 0),
  online_payment_fee_sar numeric(12,2) not null check (online_payment_fee_sar >= 0),
  operational_charges_sar numeric(12,2) not null check (operational_charges_sar >= 0),
  ads_fee_sar numeric(12,2) not null check (ads_fee_sar >= 0),
  delivery_minutes_sum numeric(12,2) not null check (delivery_minutes_sum >= 0),
  delivery_minutes_count integer not null check (delivery_minutes_count >= 0),
  primary key (branch_id, day),
  foreign key (branch_id, workspace_id) references public.branches(id, workspace_id),
  foreign key (import_batch_id, workspace_id) references public.order_import_batches(id, workspace_id),
  check (complaint_orders <= delivered_orders + cancelled_orders),
  check (delivery_minutes_count <= delivered_orders)
);

create index order_performance_daily_workspace_day_idx
  on public.order_performance_daily(workspace_id, day desc);

alter table public.order_import_batches enable row level security;
alter table public.order_performance_daily enable row level security;

create policy order_import_batches_branch_read on public.order_import_batches
  for select to authenticated
  using (private.can_access_branch(workspace_id, branch_id));
create policy order_performance_daily_branch_read on public.order_performance_daily
  for select to authenticated
  using (private.can_access_branch(workspace_id, branch_id));

grant select on public.order_import_batches, public.order_performance_daily to authenticated;

-- Keep demo fixtures out of converted client workspaces.
create or replace function public.bootstrap_demo_workspace(p_workspace_id uuid)
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
  if exists (select 1 from public.workspaces w where w.id = p_workspace_id and w.reporting_mode = 'client_export') then
    return 0;
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
