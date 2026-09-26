# Proposed architecture

## Existing repository, inspected 2026-09-26

This is a mostly empty Lovable starter: React 19, TypeScript 5.8 strict mode, TanStack Start/Router file routes and React Query, Vite 8 plus Nitro server entry, Tailwind CSS 4, shadcn-style Radix components, Zod and React Hook Form. Bun lockfile and `bunfig.toml` indicate Bun; README's npm command is generic starter text. ESLint 9 and Prettier are configured. No test runner or app-specific tests, Supabase client, migrations, product routes or business schema are present. `src/routes/index.tsx` only says “Ready to build.” `vite.config.ts` uses Lovable's Vite preset; its comment says cloudflare is the default Nitro build target, but actual hosting and secret deployment remain to be confirmed.

## Boundaries

```text
Browser (TanStack Router + Query, Stitch-derived components)
  → TanStack Start loaders/actions or authenticated server functions
  → application services (workspace, catalog, opportunities, approvals, execution)
  → repositories (Supabase Auth/Postgres/Storage) and provider ports
  → HungerStationAdapter / future aggregator adapters
  → server-side credential store + async job/webhook handlers
```

Browser receives only publishable Supabase key and workspace-authorized data. UI may propose a workspace/branch selection but every server operation resolves membership and scope against Auth identity. Supabase RLS independently enforces reads and writes; privileged Edge Functions or server handlers run with narrowly scoped secrets and explicit authorization. Edge Functions suit webhooks, async dispatch and scheduled sync where the chosen deployment supports them. The TanStack server can own authenticated app orchestration; do not split a single workflow across runtimes without a reason.

Domain services work on canonical brands, branches, products, prices, promotions, observations and recommendations. External IDs, payloads and capability flags live in adapter mappings; UI does not call external API URLs. `AggregatorAdapter` supports capability discovery and bounded methods such as `listVendorCatalog`, `updatePriceAvailability`, `listOrders`, `upsertPromotion` only when a concrete adapter verifies them. Unsupported operations return a typed `unsupported` result. Avoid a giant interface requiring every future aggregator to implement fake methods.

## Execution lifecycle

An observation with timestamp and provenance creates a recommendation and evidence snapshot. Authorized member submits a request; a distinct authorized reviewer approves/rejects. Approval creates an immutable execution intent with idempotency key and parameter snapshot. Worker checks capability, entitlement, scope, guardrails and current state, obtains cached client-credentials token server-side, then submits. Persist external job ID and outcome. Webhook or poll updates job state after signature/auth validation and deduplication. Read-back, when possible, can mark `confirmed_live`; otherwise remain `not_confirmed`. Retry only known-safe operations, with bounded backoff and dead-letter/manual review for ambiguous outcomes. Metrics use explicit before/after windows and confounder notes; forecasts remain predictions.

## Data and security

Supabase Auth identifies users; Postgres holds tenant/business records and append-only events; private Storage may hold approved assets/evidence. Every exposed table uses RLS. Migrations and generated TS database types are versioned. Secrets (HungerStation client secret, service role, AI providers) live in server-managed secret storage and never browser bundles, logs or audit payloads. Verify webhooks with the mechanism the partner actually documents; if validation is not available, do not accept authoritative external state from unauthenticated callbacks. Rate limits, quotas, token TTL, sync checkpoints and correlation IDs are adapter concerns.

## Source of truth and current status

The connected `supabase-yamdy` MCP read-only check found no `public` application tables, no migrations and no development branches. The Supabase [Auth](https://supabase.com/docs/guides/auth), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Edge Functions](https://supabase.com/docs/guides/functions) and [CLI migrations](https://supabase.com/docs/guides/local-development/overview) guides should be rechecked when implementing; versions and deployment choices are not yet fixed. HungerStation boundaries are detailed in the capability matrix.
