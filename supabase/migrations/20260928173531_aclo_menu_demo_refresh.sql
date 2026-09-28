-- Aclo-specific *illustrative* operating studio. Historical order aggregates are
-- untouched. This changes only demo fixtures tied to the selected client workspace.
alter table public.catalog_products
  add column image_path text,
  add column price_basis text not null default 'illustrative'
    check (price_basis in ('illustrative', 'historical_single_item_subtotal'));

do $$
declare
  v_workspace uuid;
  v_brand uuid;
  v_branch uuid;
  v_count integer;
begin
  select count(*) into v_count
  from public.workspaces
  where name = 'Aclo - Al Muruj'
    and reporting_mode = 'client_export'
    and created_at = '2026-09-27 17:10:08.516764+00'::timestamptz;
  if v_count = 0 and current_setting('app.isolated_test', true) = 'on' then
    return;
  end if;
  if v_count <> 1 then
    raise exception 'Expected one selected Aclo client workspace, found %', v_count;
  end if;
  select id into v_workspace from public.workspaces
    where name = 'Aclo - Al Muruj'
      and reporting_mode = 'client_export'
      and created_at = '2026-09-27 17:10:08.516764+00'::timestamptz;
  select brand_id into v_brand from public.catalog_products
    where workspace_id = v_workspace and sku = 'DEMO-BURGER';
  select id into v_branch from public.branches
    where workspace_id = v_workspace and is_demo and code = 'demo-olaya';
  if v_brand is null or v_branch is null or
     (select count(*) from public.catalog_products where workspace_id = v_workspace) <> 6 then
    raise exception 'Aclo demo fixture has changed; refusing to overwrite it';
  end if;

  -- Preserve product IDs, branch states and the existing approval reference.
  update public.catalog_products p set
    sku = m.new_sku, name_en = m.name_en, name_ar = m.name_ar,
    category = m.category, description_en = m.description_en,
    price_sar = m.price_sar, cost_sar = null, listing_quality = m.quality,
    image_path = m.image_path, price_basis = m.price_basis, updated_at = now()
  from (values
    ('DEMO-BURGER','ACLO-BOX-8','8-Piece Mini Sandwich Box','علبة ساندويتشات ميني ٨ قطع','Mini sandwich boxes','A small Aclo sandwich box with a mix of fillings. The assortment is a demo concept; exact live options need catalog confirmation.',49::numeric,84::smallint,'/aclo-demo/box-8.png','historical_single_item_subtotal'),
    ('DEMO-CHICKEN','ACLO-BOX-18','18-Piece Mini Sandwich Box','علبة ساندويتشات ميني ١٨ قطعة','Mini sandwich boxes','Shareable mini sandwich box for office breakfasts and small gatherings. Filling combinations shown here are illustrative.',99::numeric,88::smallint,'/aclo-demo/box-18.png','historical_single_item_subtotal'),
    ('DEMO-SHAWARMA','ACLO-BOX-40','40-Piece Mini Sandwich Box','علبة ساندويتشات ميني ٤٠ قطعة','Mini sandwich boxes','A catering-sized mini sandwich box for teams and gatherings. Images and availability are illustrative.',199::numeric,81::smallint,'/aclo-demo/box-40.png','historical_single_item_subtotal'),
    ('DEMO-FAMILY','ACLO-CHICKEN-PIE','Creamy Chicken Pie','فطيرة الدجاج الكريمية','Savory bakes','A comforting savory pie inspired by items named in the order export. Recipe and price are sample content.',29::numeric,76::smallint,'/aclo-demo/chicken-pie.png','illustrative'),
    ('DEMO-FRIES','ACLO-CARROT-CAKE','Carrot Cake','كيك الجزر','Cakes & sweets','Carrot cake for a breakfast or afternoon add-on. Image, portion and price are illustrative.',24::numeric,79::smallint,'/aclo-demo/carrot-cake.png','illustrative'),
    ('DEMO-DRINK','ACLO-PEACH-TEA','Peach Iced Tea','شاي خوخ مثلج','Drinks','A chilled peach iced tea pairing for mini sandwich boxes. Image, serving and price are illustrative.',16::numeric,83::smallint,'/aclo-demo/peach-tea.png','illustrative')
  ) as m(old_sku,new_sku,name_en,name_ar,category,description_en,price_sar,quality,image_path,price_basis)
  where p.workspace_id = v_workspace and p.sku = m.old_sku;

  insert into public.catalog_products
    (workspace_id,brand_id,sku,name_en,name_ar,category,description_en,price_sar,cost_sar,listing_quality,image_path,price_basis)
  values
    (v_workspace,v_brand,'ACLO-HALLOUMI','Halloumi, Olives & Za’atar Mini','ميني حلومي وزيتون وزعتر','Mini sandwiches','A sample individual sandwich concept using fillings named in historical orders; the item format and price are not verified.',18,null,77,'/aclo-demo/halloumi.png','illustrative'),
    (v_workspace,v_brand,'ACLO-TUNA','Spicy Avocado Tuna Mini','ميني تونة وأفوكادو حارة','Mini sandwiches','A sample individual sandwich concept inspired by order-item wording. Recipe and price are illustrative.',19,null,75,'/aclo-demo/tuna.png','illustrative'),
    (v_workspace,v_brand,'ACLO-COFFEE-1L','Coffee of the Day · 1 Liter','قهوة اليوم · لتر','Drinks','A sharing coffee format named in historical orders. Image, serving details and price are illustrative.',42,null,80,'/aclo-demo/coffee.png','illustrative'),
    (v_workspace,v_brand,'ACLO-MARBLE-CAKE','Marble Cake','كيك رخامي','Cakes & sweets','A cake named in historical orders. Image, portion and price are illustrative.',22,null,78,'/aclo-demo/marble-cake.png','illustrative');

  update public.product_branch_state s set price_sar = p.price_sar, updated_at = now()
    from public.catalog_products p
    where s.workspace_id = v_workspace and s.product_id = p.id;
  insert into public.product_branch_state(workspace_id,product_id,branch_id,is_available,price_sar)
    select v_workspace,p.id,b.id,true,p.price_sar
    from public.catalog_products p cross join public.branches b
    where p.workspace_id = v_workspace and b.workspace_id = v_workspace and b.is_demo
    on conflict (product_id,branch_id) do nothing;

  update public.branches set
    name = case code when 'demo-olaya' then 'Aclo studio · breakfast scenario'
      when 'demo-nakheel' then 'Aclo studio · office scenario'
      when 'demo-malqa' then 'Aclo studio · catering scenario' else name end,
    name_ar = 'سيناريو تجريبي لأكلو'
    where workspace_id = v_workspace and is_demo;

  update public.opportunities o set
    title = m.title, description = m.description, product_id = p.id,
    estimated_impact_sar = null, confidence = null,
    evidence = jsonb_build_object('source','illustrative Aclo scenario','historical_context','Order export contains mini sandwich boxes and breakfast-hour orders','not_measured',true),
    recommendation = jsonb_build_object('action',m.action,'channel_request_sent',false),
    updated_at = now()
  from (values
    ('availability-chicken','Check 18-piece box availability in a sample breakfast scenario','A simulated stock interruption for a popular box format. The export does not report live availability.','ACLO-BOX-18','Review internal availability draft'),
    ('price-burger','Review an 8-piece box price concept','Historical single-item order subtotals include SAR 49 for this box. A SAR 45 test is only a demo proposal; margin and elasticity are unknown.','ACLO-BOX-8','Request human review of sample price test'),
    ('marketing-lunch','Explore office breakfast visibility','Orders cluster from 09:00 to 11:00 local time. This is an illustrative campaign brief, not measured advertising performance.',null,'Draft internal breakfast campaign'),
    ('promotion-tuesday','Explore a team breakfast add-on','Create an internal draft pairing sandwich boxes with coffee or cake. The export does not measure promotion lift.',null,'Draft internal breakfast offer'),
    ('listing-burger','Clarify the 8-piece box listing','Show box size and illustrative filling choices clearly in a draft listing. Live catalog content is unverified.','ACLO-BOX-8','Edit internal listing draft')
  ) as m(demo_key,title,description,sku,action)
  left join public.catalog_products p on p.workspace_id = v_workspace and p.sku = m.sku
  where o.workspace_id = v_workspace and o.demo_key = m.demo_key;

  update public.demo_drafts set
    title = 'Morning Box + Peach Tea Concept',
    payload = '{"objective":"Explore a breakfast add-on","items":["8-Piece Mini Sandwich Box","Peach Iced Tea"],"price_sar":59,"source":"illustrative demo","image_path":"/aclo-demo/hero.png","channel_request_sent":false}'::jsonb,
    updated_at = now()
    where workspace_id = v_workspace and kind = 'promotion' and title = 'Tuesday Afternoon Boost';
  update public.demo_drafts set
    title = 'Office Breakfast Sharing Set',
    payload = '{"items":["18-Piece Mini Sandwich Box","Coffee of the Day · 1 Liter"],"price_sar":129,"source":"illustrative demo","image_path":"/aclo-demo/box-18.png","channel_request_sent":false}'::jsonb,
    updated_at = now()
    where workspace_id = v_workspace and kind = 'bundle' and title = 'Family Lunch Combo';
  update public.demo_drafts set
    title = 'Aclo Morning Box Story',
    payload = '{"objective":"Explore breakfast discovery","budget_sar":300,"source":"illustrative demo","image_path":"/aclo-demo/hero.png","channel_request_sent":false}'::jsonb,
    updated_at = now()
    where workspace_id = v_workspace and kind = 'campaign' and title = 'Lunch Rush Awareness';

  -- Old synthetic spend/revenue magnitudes were unrelated to this client.
  delete from public.performance_daily where workspace_id = v_workspace;
end $$;
