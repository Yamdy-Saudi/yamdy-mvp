-- Local-only fixture migration, applied during `supabase db reset` through db.seed.
-- These synthetic users have no password and cannot sign in. Use the sign-up UI
-- for a login-capable local account. Never push this fixture migration remotely.
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', 'owner@shawarma-demo.invalid', '{"full_name":"Sultan Al-Otaibi"}'),
  ('22222222-2222-4222-8222-222222222222', 'owner@burger-demo.invalid', '{"full_name":"Maha Al-Faris"}');

insert into public.workspaces (id, name, created_by, onboarding_stage) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Shawarma & Co. · Demo', '11111111-1111-4111-8111-111111111111', 'complete'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Burger House · Demo', '22222222-2222-4222-8222-222222222222', 'complete');

insert into public.workspace_memberships (workspace_id, user_id, role, status) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'owner', 'active'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'owner', 'active');

insert into public.brands (id, workspace_id, name, name_ar, is_demo) values
  ('aaaa0000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Shawarma & Co.', 'شاورما وشركاه', true),
  ('bbbb0000-0000-4000-8000-000000000001', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Burger House', 'بيت البرجر', true);

insert into public.branches (id, workspace_id, brand_id, code, name, name_ar, city, is_demo) values
  ('aaaa1000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaa0000-0000-4000-8000-000000000001', 'demo-olaya', 'Riyadh — Olaya', 'الرياض — العليا', 'Riyadh', true),
  ('aaaa1000-0000-4000-8000-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaa0000-0000-4000-8000-000000000001', 'demo-nakheel', 'Riyadh — Al Nakheel', 'الرياض — النخيل', 'Riyadh', true),
  ('aaaa1000-0000-4000-8000-000000000003', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaa0000-0000-4000-8000-000000000001', 'demo-malqa', 'Riyadh — Al Malqa', 'الرياض — الملقا', 'Riyadh', true),
  ('bbbb1000-0000-4000-8000-000000000001', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'bbbb0000-0000-4000-8000-000000000001', 'demo-rawdah', 'Jeddah — Al Rawdah', 'جدة — الروضة', 'Jeddah', true);

insert into public.aggregator_connections (id, workspace_id, provider, mode, status, display_name, created_by) values
  ('aaaa2000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'hungerstation', 'mock', 'mock_ready', 'HungerStation · Demo', '11111111-1111-4111-8111-111111111111'),
  ('bbbb2000-0000-4000-8000-000000000001', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'hungerstation', 'mock', 'mock_ready', 'HungerStation · Demo', '22222222-2222-4222-8222-222222222222');

insert into public.aggregator_branch_links (workspace_id, connection_id, branch_id, external_vendor_id, is_demo) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaa2000-0000-4000-8000-000000000001', 'aaaa1000-0000-4000-8000-000000000001', 'demo-olaya', true),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaa2000-0000-4000-8000-000000000001', 'aaaa1000-0000-4000-8000-000000000002', 'demo-nakheel', true),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaa2000-0000-4000-8000-000000000001', 'aaaa1000-0000-4000-8000-000000000003', 'demo-malqa', true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'bbbb2000-0000-4000-8000-000000000001', 'bbbb1000-0000-4000-8000-000000000001', 'demo-rawdah', true);
