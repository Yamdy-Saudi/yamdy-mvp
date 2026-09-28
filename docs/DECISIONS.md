# Architecture decisions and open questions

## Client workspace branding (2026-09-28)

- The owner supplied the Aclo wordmark. The original JPEG is kept unchanged as a version-controlled public asset, and the selected Aclo workspace stores its relative asset path in `workspaces.logo_path`. The UI shows it beside the workspace name while retaining Yamdy's own product mark. Other workspaces retain their initial-letter icon.

## Client order-report import (2026-09-28)

### Aclo demo studio refresh (2026-09-28)

- The owner authorized relevant **invented demo content** for Aclo in addition to the observed order report. A read-only review of item names and local order times informed ten internal menu concepts: 8-, 18-, and 40-piece mini sandwich boxes; chicken pie; carrot and marble cakes; peach iced tea; one-liter coffee; and halloumi and tuna mini sandwiches. The three box prices (SAR 49, 99, 199) match common single-item historical order subtotals, but are not asserted as current channel prices. All other prices, descriptions, portions, availability, listing quality, offers, and campaign budgets are illustrative. Costs, margin, competitor comparisons, attribution, and intervention impact remain unknown.
- Generated food photography and a breakfast-box campaign banner are version-controlled under `public/aclo-demo/`. These are labeled concept art, not authentic product photography or verified HungerStation listings. No raw item string, order ID, address, or line-item record is imported into Yamdy.
- Migration `20260928173531_aclo_menu_demo_refresh.sql` updates only the selected Aclo client workspace's demo products, archived demo branch scenarios, recommendations, and three internal drafts. Existing product, opportunity, and approval IDs are preserved for dependent history. The unrelated synthetic ad spend/revenue series for this workspace is removed. The 211-day observed report and its totals are unchanged. Other demo workspaces and their bootstrap fixtures remain independent.
- Migration `20260928181032_demo_price_basis_on_edit.sql` changes the internal product-draft save function so an edited box price loses its historical-subtotal tag. A PGlite test exercises this transition without changing the hosted box prices.
- Migration `20260928183426_aclo_campaign_art.sql` assigns separate generated promotion and office-breakfast banner assets to their existing internal drafts. The Home, Promotions, and Marketing banners remain visibly labeled concepts.
- Home, Listings, Pricing, Promotions, Bundles, Marketing, Opportunity Detail, and Health show the relevant Aclo concepts with explicit observed-versus-illustrative labeling. Marketing shows historical gross sales without ad attribution and marks ad spend/ROAS unknown. No client-facing campaign, catalog, or price is published.

- The owner chose to convert the current demo workspace to the restaurant in nine HungerStation order-detail exports. The files cover one store, 582 unique orders, and 211 observed dates from 2026-01-01 through 2026-09-27. The import retains daily aggregates only. The one-time aggregate backfill is version-controlled; raw order IDs, addresses, and item strings stay outside the repository and database.
- Delivered order subtotal is labeled **gross sales**. Reported payout and estimated earnings remain separate because the export does not reconcile them to the same measure. Cancelled orders are counted, but their order amounts are excluded from delivered-order financial totals. A date absent from the exports is unknown, not asserted to be zero orders.
- The new client branch replaces mock branches in active selectors; historical demo branches and their audit references remain archived. Unsupported catalog, opportunity, promotion, and advertising examples stay visibly marked as demo and do not claim to describe the client branch. No HungerStation API connection or customer-visible publication is inferred from the report.
- The owner selected the later of two existing Aclo demo workspaces, created 2026-09-27 17:10 UTC. The project-scoped `supabase-yamdy` MCP applied the schema and backfill migrations. Hosted read-only verification found one active real branch, three archived demo branches, 211 observed days, 577 delivered orders, 5 cancellations, SAR 62,296.00 delivered gross sales, and SAR 27,437.84 reported payout. The other three workspaces remain in demo mode.
- Browser roles have read access to these aggregate tables only when workspace and branch RLS permits it. A follow-up migration removed the default write grants for `anon` and `authenticated`; hosted privilege checks and PGlite tests confirm the restriction.
- The owner asked for `ahmad.agha@yamdy.net` to see the converted Aclo workspace. A hosted migration added that account as an active viewer with access to the imported branch. The account also owns Sultan Burger, so the app now offers a workspace selector and defaults to the client report until a choice is saved.

## Demo product decisions (2026-09-26)

- The owner authorized the remaining product screens as demo workflows until HungerStation access is available. Screens 4–18 use the inspected Stitch exports, explicitly labeled sample values, internal drafts, and simulated outcomes. Marketing spend, opportunity impact, and performance values are synthetic; they do not claim attribution.
- `20260926172727_demo_product_domain.sql` and `20260926180626_branch_scoped_demo_audit.sql` are applied through `supabase_yamdy`. The first adds the demo operating schema and role-checked RPCs; the second aligns audit visibility with branch access. Generated TypeScript database types come from all committed migrations.
- Hosted workspace demo data is created only by the authenticated idempotent bootstrap after a mock import. The standalone development seed stays local. The development-only static preview is for visual QA without a login.
- Approval creates a simulated execution with no external confirmation. No live channel publishing, campaign placement, bid spending, or financial action is inferred from a Stitch control. Partner eligibility, contracts, credentials, and confirmation semantics remain open.
- Lovable's synced build did not receive ignored `.env.local`, leaving Supabase Auth unconfigured. The repository now carries only the hosted URL and Supabase publishable key in `.env`, as public `VITE_` build values. This is safe for the browser with the existing RLS; service-role and integration secrets remain excluded. The client reads these values with static `import.meta.env.VITE_*` access.

## Milestone 1 decisions (2026-09-26)

- The owner authorized the foundation plus the first three Stitch onboarding screens in Milestone 1. The connection and import screens therefore use a deterministic mock adapter and create only demo brand, branch, and mapping records. Catalog sync and live partner integration remain Milestone 2 work.
- The frontend uses Supabase Auth with a publishable browser key and RLS. Authenticated database functions create a workspace and its owner membership atomically and set up an owner-controlled mock connection. A private credential-reference table is reserved for a future server-side integration.
- The hosted Supabase project `ocwgdprgoelmqbspkdms` is the development target. The owner requested no Docker dependency; apply committed migrations through `supabase_yamdy` MCP and test the live Auth/API flow against that project. Isolated migration, seed, and RLS tests continue to run in PGlite. The local seed is not applied remotely.
- Remote migration history assigned versions `20260926170434` and `20260926170553`; local filenames match. The second migration enables RLS on the private credential-reference table as defense in depth.
- npm scripts and `package-lock.json` were added for reproducible checks in this environment. The existing Bun lockfile and TanStack stack were preserved.

## Recorded decisions (2026-09-26)

**Auth email content.** Yamdy auth email templates are fully branded and version-controlled, while custom SMTP/domain sending is deferred. The hosted Auth template fields and URL settings require Dashboard application because the connected MCP exposes no Auth configuration operation. The local Docker stack remains outside this project's development workflow; use a dummy HTML preview and hosted test mailbox instead. See `docs/AUTH_EMAILS.md`.

**Hosted Auth update (2026-09-27).** The current live app is `https://yamdy.lovable.app`, and the hosted Auth Site URL plus exact production/local redirect allowlist now match it. Supabase Free disables custom template editing with its default email service; the committed Yamdy templates cannot be activated without a separately authorized Pro upgrade or a future delivery change. SMTP and Send Email hooks remain deferred. The live logo asset is reachable at `/yamdy-logo.png`.

1. **Preserve existing stack.** React/TanStack Start, TypeScript, Vite, Tailwind, Radix/shadcn and Bun lockfile already exist. Do not rewrite to another framework.
2. **Stitch is the visual source.** One Yamdy project `projects/8813799588670496359` contains all 18 numbered desktop screens; extra image assets are not additional product screens. Screen routes are proposed.
3. **Canonical model plus adapter.** HungerStation-specific IDs and payloads stay outside canonical domain entities. Capability checks gate every external action.
4. **No inferred external API.** Public HungerStation docs describe Q-Commerce/Local Shops; restaurant eligibility and account entitlements need direct confirmation. Product content creation is beta/not production, same-item bundle is work in progress, and advertising/bid APIs were not found.
5. **Approval, execution and confirmation are distinct.** A 202, completed job or human approval cannot alone assert customer-visible publication.
6. **Migration files for every database change.** Schema, RLS, functions, reference data and backfills must be committed as migration files and applied through the migration workflow. Direct SQL writes through MCP, SQL Editor or other clients are prohibited; read-only inspection is allowed. Read-only `supabase-yamdy` MCP inspection found no app tables, migrations or dev branches.
7. **No AI vendor or scraping choice yet.** Recommendations and market observations use provider boundaries and transparent demo data until sources are approved.
8. **Milestone 1 authorized and implemented.** Subsequent product milestones require their own scope and capability checks.

## Questions requiring owner or partner answer

- Does HungerStation grant the restaurant business access to this Partner API, or is a different restaurant integration program required? Which Saudi market operations are enabled in sandbox and production?
- How are the restaurant's chain and vendor IDs obtained and verified? Is any self-service “Connect” consent flow available, or must credentials be provisioned by an account manager?
- What callback authentication/signature scheme, event IDs and delivery guarantees are available? What proves a change is live in the customer app?
- Which exact promotion types are enabled for this account? Is custom meal-bundle, content/image/modifier editing, campaign/placement/bid management or advertising reporting exposed under another contract?
- What authorized source supplies competitor prices, impressions, visibility share, ROAS, margin/COGS and branch-level revenue? What are the data rights and retention limits?
- Which actions require two-person approval, what are role limits, and may a requester approve their own operational changes?
- Which of the 18 screens must be functional in the first release versus a clearly labeled draft/demo? What are approved mobile and Arabic/RTL designs?
- What hosting target, environment/secret management, alerting, billing provider and support process should be used?

Update this file when evidence changes a decision, with date, source and impact on the capability matrix and milestones.
