# Architecture decisions and open questions

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
