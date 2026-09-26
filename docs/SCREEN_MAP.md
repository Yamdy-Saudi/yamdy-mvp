# Approved Stitch screen map

Source: Stitch project `projects/8813799588670496359`, inspected through its MCP screen list and exported HTML on 2026-09-26. Routes are proposed implementation routes, not routes already present. Each number is the Stitch screen title prefix. Inspect the screen in Stitch again before implementation. All 18 are desktop at 1280 px; no approved mobile screens were found.

## Shared visual and interaction system

Stitch's project theme uses IBM Plex Sans for display, headings, body and labels. Tokens: display 40/48 semibold; heading 32/40, 24/32 and 20/28; body 16/24 and 14/20; label 14/20, 12/16 and 11/14. Light background `#faf9fb`, white lowest surface, green primary `#006235` with container `#167d48`, dark text `#1b1c1e`, outline `#6f7a70`, purple tertiary `#604791`, red error `#ba1a1a`. Theme radii range 4–24 px, with 8 px default; spacing uses 4/8/16/24/32 px, 20 px gutter and 32 px desktop margin. These are source tokens, not an invitation to replace the designs.

Onboarding has a top progress/navigation rail and benefit panel. Core screens use a left sidebar, top utility controls (notifications, help, language), page title and branch/date selectors where relevant. Opportunity cards, priority/status badges, filter chips, charts, tables, row actions, audit trails and approval controls recur. Some later screens add Campaigns/Bundles and nested Marketing links to the sidebar; consolidate only after checking the intended information architecture. Exact active/empty/error states are not comprehensively designed. Preserve visible ones, including failed changes (0), connection success, sync progress, draft and execution statuses. A mobile adaptation must convert wide tables to accessible row detail, retain approval evidence and make branch scope obvious; validate with the owner before treating it as approved.

| # | Stitch screen / proposed route | Visible interaction and dependency |
|---|---|---|
| 1 | Create Yamdy Workspace / `/signup` | Name, work email, password, business name, primary role, terms; creates auth user and workspace. Sign-in link. |
| 2 | Connect HungerStation / `/onboarding/connect` | Connect, defer, connected confirmation, permissions explanation, language. Requires workspace and verified partner onboarding mechanism; do not assume user-facing OAuth from design. |
| 3 | Import & Sync Business / `/onboarding/import` | Select branches, import/analyze, sync scope and diagnostics. Requires verified chain/vendor mapping and catalog access. |
| 4 | Home / Opportunity Inbox / `/app` | Priority cards; Operational/Pricing/Marketing/Promotions filters, resolve/review/dismiss, recent executions. Requires fresh observations and provenance. |
| 5 | AI Opportunity Detail / `/app/opportunities/$id` | Evidence, market price chart, simulation, rollout checkbox, guardrails, audit, edit/dismiss/approve. Market data and elasticity model must be sourced or labeled demo; approval and publish separated. |
| 6 | Restaurant Health / `/app/health` | Branch/date filters, domain health links, priority table, manual re-audit and settings. Requires metric freshness and calculation definitions. |
| 7 | Menu & Listings / `/app/listings` | Product/category/unavailable tabs, search/filter, selection, bulk availability/category/price/publish, pagination, quality diagnostic. Category write and product creation are gated by capability matrix. |
| 8 | Product Detail / Edit / `/app/listings/$id` | English/Arabic names, description, image, price, branch availability, modifiers, draft/save/publish, sync metadata. Only verified price/active/quantity write may be wired; other edits remain draft. |
| 9 | AI Content Optimizer / `/app/listings/$id/optimize` | Compare/select/ignore copy and image suggestions; apply to product draft. Provider and channel content publish are unverified. |
| 10 | Pricing Intelligence / `/app/pricing` | Price matrix, filters, recommendations, confidence, elasticity, quick edit, experiment launch. Requires cost/market source and approval path. |
| 11 | Promotions / `/app/promotions` | Opportunity cards, promotion table and builder with objective, mechanism and impact estimate. Strikethrough API is documented; entitlement and restaurant scope pending. |
| 12 | Bundle Builder / `/app/bundles` | Composition, localization, price, schedule, branch scope, existing bundles. Custom mixed-item bundle publish unverified; same-item bundle is documented work in progress. |
| 13 | Marketing Campaign Hub / `/app/marketing` | Campaign list, spend/revenue/ROAS chart, AI suggestions, filters/export. Advertising APIs and attribution data unverified. |
| 14 | AI Campaign Builder / `/app/marketing/new` | Objective, products, branches, placement, budget, bid guardrails, projection, draft/approve. Keep as internal draft/simulation pending advertising API. |
| 15 | Search & Bid Optimization / `/app/marketing/bids` | Bid matrix, sponsored search details, recommendation and financial guardrails. External bidding API unverified; no live button until entitled. |
| 16 | Performance & Experiments / `/app/performance` | Intervention timeline, test states, before/after chart, deep dive, rollout. Requires observed data and experiment design; distinguish correlation from attribution. |
| 17 | Approvals & Activity / `/app/approvals` and `/app/activity` | Queue, inspect, approve/edit/reject reason, retry, execution status, audit export. Requires role enforcement, immutable events and retry policy. |
| 18 | Settings / Users / Integrations / `/app/settings` | Profile, branches, users/roles, channel, API keys/webhooks, AI guardrails, notifications, billing. Key management server-side; invitation/billing specifics unresolved. |

Navigation links connect inbox → detail → approval → execution/activity → experiment; listings → product → optimizer; pricing/promotions/marketing → recommendation review; settings controls membership and integration state. Save/discard, destructive actions and all financial changes need explicit state feedback. The designs show populated examples, so empty/error/loading states require future product decisions rather than invented visual claims.
