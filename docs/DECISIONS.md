# Architecture decisions and open questions

## Recorded decisions (2026-09-26)

1. **Preserve existing stack.** React/TanStack Start, TypeScript, Vite, Tailwind, Radix/shadcn and Bun lockfile already exist. Do not rewrite to another framework.
2. **Stitch is the visual source.** One Yamdy project `projects/8813799588670496359` contains all 18 numbered desktop screens; extra image assets are not additional product screens. Screen routes are proposed.
3. **Canonical model plus adapter.** HungerStation-specific IDs and payloads stay outside canonical domain entities. Capability checks gate every external action.
4. **No inferred external API.** Public HungerStation docs describe Q-Commerce/Local Shops; restaurant eligibility and account entitlements need direct confirmation. Product content creation is beta/not production, same-item bundle is work in progress, and advertising/bid APIs were not found.
5. **Approval, execution and confirmation are distinct.** A 202, completed job or human approval cannot alone assert customer-visible publication.
6. **Migration files for every database change.** Schema, RLS, functions, reference data and backfills must be committed as migration files and applied through the migration workflow. Direct SQL writes through MCP, SQL Editor or other clients are prohibited; read-only inspection is allowed. Read-only `supabase-yamdy` MCP inspection found no app tables, migrations or dev branches.
7. **No AI vendor or scraping choice yet.** Recommendations and market observations use provider boundaries and transparent demo data until sources are approved.
8. **No feature implementation in this phase.** These documents specify a sequence for later approval.

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
