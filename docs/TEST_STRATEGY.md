# Test strategy

Current repository has no test framework. Choose a lightweight unit runner compatible with Vite/TanStack only when implementation begins; add browser E2E for critical workflows. Test actual behavior and security boundaries, not component implementation details.

| Layer | Critical cases |
|---|---|
| Unit/domain | Priority rules, money/rounding and SAR formatting, recommendation state transitions, approval policy, capability rejection, adapter mapping, retry classification and idempotency key generation. |
| Database/RLS | Two workspaces with overlapping user/branch/product IDs; unauthorized reads/writes, role downgrade, branch scope, cross-tenant FK injection, immutable audit/approval events, `WITH CHECK` on updates. Run against a fresh migrated local/test Supabase DB. |
| Integration adapters | Contract fixtures from official HungerStation spec; token cache expiry; 202 async job, callback duplicates/out of order, partial item rejection, 401/403/429/5xx, ambiguous timeout, read-back drift. Sandbox tests only with authorized credentials; never production in CI. |
| Edge/server | Webhook validation, body size, dedup, worker reauthorization, secret absence from responses/logs, no client-selected workspace authority, failed connection and retry visibility. |
| UI | Screen routes and visible states, filters/search, forms, keyboard focus, Arabic/RTL and number formatting, responsive table access, clear demo/source labels, unavailable publish actions. Compare representative screens to Stitch. |
| E2E | Signup → workspace → demo/sandbox connection → import → opportunity → approval/rejection → async execution → audit → measured outcome. Verify approved ≠ published ≠ confirmed live. |

CI gates after implementation: lint, TypeScript, unit/integration, migration reset and RLS tests, build, then a small browser smoke suite. Use seeded deterministic fixtures; redact tokens and customer PII from test artifacts. Test a failed external publish and a replayed webhook before any live rollout.
