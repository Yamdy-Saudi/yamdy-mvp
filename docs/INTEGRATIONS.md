# Integration architecture

## Aggregator port

Use a small capability-based `AggregatorAdapter` with `getCapabilities(context)`, `validateConnection`, `listCatalog`, `readProductState`, `updatePriceAvailability`, `listOrders`, `upsertPromotion`, `getExternalJob`, and `readOutletStatus` as independently supported methods or sub-ports. Each returns a typed result: success, unsupported, entitlement missing, validation failure, retryable error or permanent error. Canonical requests carry workspace, branch, actor, correlation and idempotency IDs; adapters map to provider chain/vendor/SKU IDs. Future adapters should not inherit HungerStation-specific payloads. Optional advertising/content/bundle ports stay disabled until a contract exists.

## HungerStation onboarding and authentication

Official [Partner API](https://developer.hungerstation.com/api-specifications) uses OAuth 2 client credentials, not documented end-user OAuth consent. Product onboarding therefore cannot assume the Stitch “Connect” button launches a third-party consent screen. Confirm partner eligibility, restaurant applicability, chain/vendor IDs, production/sandbox credentials and webhook setup with HungerStation. Store credential references in private server-side secrets; never render credentials or service-role keys to the browser. Cache access tokens until near `expires_in`, serialize refresh per connection and handle 401/429 without credential leakage. Sandbox has separate credentials and currently lists only some supported endpoint families; verify each operation before an integration test.

## Synchronization and writes

Initial sync maps chain → vendor → Yamdy branch and imports catalog/categories, orders only if authorized. Preserve source payload version, external ID, observed time, cursor/page and import errors. Repeat sync incrementally where supported; do not infer deletion from one failed page. Execution intent freezes approved values, branch set and policy version. Worker obtains a unique idempotency key, checks current read state and local duplicate lock, submits an async write, saves external job ID and consumes job status/callback. Treat callback delivery as at least once. Validate webhook authentication/signature using documented Partner Portal configuration before trusting it; if mechanism is unavailable, cross-check via authenticated job endpoint and keep state unconfirmed. Poll with bounded backoff; distinguish request accepted, job complete, field read-back and customer-visible confirmation. Do not blindly replay an ambiguous publish.

Set per-connection rate budgets, retry on 429/5xx with jitter and `Retry-After` where provided, stop on validation/entitlement failures, and create a review task after retry exhaustion. Audit intent, attempts, external response code, feedback file reference and actor without storing tokens or personal order data in logs. Orders used for metrics should be minimized and retention-limited. Reconciliation should compare approved target to GET catalog state and flag drift.

## Other provider boundaries

Recommendation provider accepts normalized observations and returns proposed changes, evidence references, forecast assumptions and confidence; no vendor selected yet. Market-observation provider requires permission/license metadata; no unauthorized scraping. Demo provider returns clearly marked seeded values. Storage provider keeps approved images/evidence privately, with signed access and retention. Current official docs: [HungerStation portal](https://developer.hungerstation.com/en), [Partner API spec](https://developer.hungerstation.com/api-specifications), [Supabase Edge Functions](https://supabase.com/docs/guides/functions).
