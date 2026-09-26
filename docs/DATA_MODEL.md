# Proposed relational model

## Demo operating schema implemented (2026-09-26)

`20260926172727_demo_product_domain.sql` adds workspace-bound demo products, branch product state, opportunities, approval requests, simulated executions, audit events, internal drafts, and synthetic daily performance. `20260926180626_branch_scoped_demo_audit.sql` adds branch scope to audit events associated with an opportunity or approval. Both are applied to the hosted development project. All exposed tables have RLS. The new entities are explicitly demo-only and do not replace the future observed channel, job, webhook, and experiment entities described below.

## Milestone 1 schema implemented (2026-09-26)

`supabase/migrations/20260926170434_platform_foundation.sql` creates `profiles`, `workspaces`, `workspace_memberships`, `brands`, `branches`, `membership_branch_access`, `aggregator_connections`, and `aggregator_branch_links`. The exposed tables all have RLS enabled. `20260926170553_private_credentials_rls.sql` enables defense-in-depth RLS on the unexposed private credential-reference table. Both migrations are applied to hosted project `ocwgdprgoelmqbspkdms`. Composite foreign keys bind branch and connection mappings to their workspace. Membership roles are owner, general manager, ecommerce manager, operator, and viewer. Branch scope is represented by `scope_all_branches` plus `membership_branch_access`.

`private.aggregator_credentials` stores a future server-side secret reference and has no browser role grants. Connection mode is `mock` or `sandbox`; no production mode or live credential flow exists in this milestone. Demo records carry `is_demo`. The local-only seed migration is `supabase/development-migrations/20260926164636_development_seed.sql`. Future catalog and commercial entities below remain proposals.

The foundation and demo entities above are applied to the hosted project; the richer observed-channel, external-job, and experiment entities below remain a migration plan. Keep cross-tenant foreign keys anchored to `workspace_id`; constrain external IDs by provider/account and preserve import provenance. Use UTC timestamps, explicit currency (SAR initially), decimal money, stable enum/check domains and archived timestamps rather than destructive history loss.

## Identity and organization

| Entity | Key fields and relationships |
|---|---|
| `profiles` | `user_id` references `auth.users`; display name, locale; no workspace entitlement by itself. |
| `workspaces` | id, name, owner, settings; one business tenant. |
| `workspace_memberships` | workspace/user unique pair, role, status, invitation metadata; separate branch scope join when needed. |
| `brands`, `branches` | workspace-scoped brand; branch references brand, time zone, operational metadata. |

## Channel and canonical catalog

| Entity | Key fields and relationships |
|---|---|
| `aggregator_connections` | workspace, provider, external chain/account ID, entitlement/capability snapshot, credential reference only, connection/sync status. |
| `aggregator_branches` | connection + branch + external vendor ID unique; source/read-back timestamps. Avoid treating vendor ID as a Yamdy branch ID. |
| `sync_runs`, `external_jobs`, `webhook_events` | connection, scope, cursors, operation, external job ID, idempotency/dedup key, status, feedback, attempts; webhook payload redacted or stored privately. |
| `categories`, `products` | canonical workspace/brand catalog with localized text and SKU; category hierarchy and category-product relation as needed. |
| `product_images`, `modifier_groups`, `modifiers` | internal drafts/assets and modifier rules; no implied HungerStation write support. |
| `branch_product_state` | branch/product/channel mapping, price, quantity/active intent, observed external state, sync status and read-back time; unique branch/product/connection. |
| `price_history` | immutable before/after values, source, actor, execution reference. |

## Commercial domain

`promotions` and `promotion_products` represent internal offer definition, type, schedule, branch scope, external ID and state. `bundles` and `bundle_items` represent canonical composition; they are not mapped to a HungerStation custom-bundle write without proof. `campaigns`, `campaign_products`, `campaign_performance` and `bid_history` are internal abstractions with provider/source/verification fields and may contain only demo data initially. `performance_daily` aggregates observed order/product/branch/channel metrics with source and ingestion time; keep raw source ID or evidence for reconciliation. `market_observations` requires provider, license/permission, geography, collection time and confidence.

## Decision and audit

`opportunities` holds type, priority, branch scope, status and current recommendation version. `recommendation_evidence`, `recommendation_predictions` and `recommendation_feedback` preserve immutable source snapshots, forecast assumptions and reviewer response. `approval_requests` and `approval_events` store requested change, reviewer, decision, reason and policy version. `executions` and `execution_attempts` hold approved parameter snapshot, idempotency key, operation, external job/result, retry state and separate confirmation state. `experiments` and `experiment_measurements` hold baseline/test periods, exposure, outcome and caveats. `audit_log` is append-only with workspace, actor, object, action, correlation ID, timestamp and redacted diff. Partition or retention policy can be chosen after usage evidence.

## Integrity and RLS

Use composite foreign keys or constraint triggers to ensure a child branch/product/connection belongs to the same workspace. Unique external mappings are `(connection_id, external_vendor_id)`, `(connection_id, external_product_id)` where present. Unique webhook event and execution idempotency keys prevent duplicate processing. A security-definer helper, if truly needed for membership checks, must be in a private schema with fixed `search_path`, limited `EXECUTE` grants and tests. Prefer ordinary invoker queries. RLS policies use authenticated membership and role/branch scope, with `USING` and `WITH CHECK` for updates; service workers bypass RLS only after validating request authority and tenant binding. No client can insert approval or audit events as another actor.
