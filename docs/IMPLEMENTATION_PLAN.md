# Proposed implementation milestones

## Milestone 1 status (2026-09-26)

Foundation implementation includes all planned route registrations, the shared shell, Supabase Auth and tenant model, migrations and RLS, generated database types, local demo seeds, and the three Stitch onboarding screens. Connection and import in this milestone save mock/demo records only; catalog and production integration remain outside scope. The committed migrations are applied to hosted Supabase project `ocwgdprgoelmqbspkdms`; migration and RLS tests also run in isolated PGlite. Docker is not required. Test the browser Auth/API flow against the hosted project.

Milestone 1 was authorized and implemented. Each further milestone should ship a small working vertical slice, with migrations, RLS and evidence of behavior where data is exposed. The partner access gate remains before any live HungerStation operation.

## Demo product pass (2026-09-26)

With the owner authorizing completion of the remaining product using demo data, screens 4–18 now have working read, filter, draft, recommendation, approval, and activity surfaces. The domain migration seeds sample catalog, opportunity, draft, and performance data through an authenticated idempotent RPC after mock import. Draft edits, opportunity decisions, and simulated approvals persist and create audit events. A follow-up migration scopes branch-specific audit reads. All four migrations were applied through `supabase_yamdy`; isolated PGlite tests continue to run without Docker. No HungerStation production endpoint, advertising action, or financial transaction is called. Live capabilities and externally confirmed publication remain behind the partner access gate.

| Milestone | Scope | Acceptance criteria |
|---|---|---|
| 0. Access and contract gate | Confirm HungerStation restaurant/market eligibility, partner contact, sandbox credentials, chain/vendor mapping, webhook validation, allowed catalog/promotion operations, and hosting. Confirm mock labels and approval policy. | Written entitlement/capability decision; no live control depends on an unverified API. |
| 1. Foundation | Preserve TanStack Start stack; add Supabase client/server split, Auth, workspace/branch schema migrations, RLS, generated types, role checks and Stitch tokens/shell. | Two-tenant isolation tests pass; workspace creation/sign-in works; no secret in client bundle. |
| 2. Connection and import | Server-side credential flow, branch mapping, catalog/category import, sync runs, onboarding screens 2–3, sandbox/mock adapter. | Authorized branches import idempotently; failures visible; no production call in automated tests. |
| 3. Actionable home | Observation store, rule-based/seeded opportunities, evidence and prioritization, screens 4–6. | Every card shows source, age, branch and action; demo observations labeled; filters and empty/error states work. |
| 4. Catalog vertical slice | Screens 7–9, internal drafts, verified price/active/quantity operation, approval and async job/read-back. | No unsupported content/modifier write; approved change has separate execution/confirmation states and audit trail. |
| 5. Pricing and measurement | Screen 10, price history, guarded recommendation review; screen 16 baseline/after experiment view using order data where available. | Forecast vs observed clear; cost/market inputs declared; no causal claim without design. |
| 6. Promotions | Screen 11 strikethrough path if entitlement confirmed; screen 12 bundle drafts or clearly marked simulation. | API behavior tested in sandbox; unsupported bundle types cannot publish. |
| 7. Governance and settings | Screens 17–18, member roles, branch scopes, audit export, integration health, retry policy and guardrails. | Forbidden actions fail server and RLS checks; duplicate and ambiguous executions are safe. |
| 8. Marketing exploration | Screens 13–15 as internal/demonstration workflow while advertising contract absent; integrate only after separate evidence and approval. | Every value and control declares source/capability; no fabricated ad API calls. |

For each slice, inspect exact Stitch screen, record deviations, write migration and tests, generate types, implement domain/adapter/server/UI, verify on a nonproduction environment, then update docs and decisions. Roll out only after observability, support and rollback paths are defined.
