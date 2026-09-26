# Yamdy product specification

## Purpose and users

Yamdy is a Saudi B2B SaaS operating layer for restaurant groups managing aggregator channels. The primary question is “What needs my attention and what should I do about it?” Owners approve commercial decisions; general managers oversee health; e-commerce managers manage listings, prices and channel work; operators resolve branch availability and execution issues. A workspace represents a business, with brands, branches, scoped members and one or more aggregator connections. HungerStation is the intended first channel; the core model stays channel-independent.

## Jobs to be done

- Connect an authorized business, choose branches, import a catalog and see freshness and sync errors.
- Detect and prioritize actionable health, listing, pricing and promotion issues with evidence, impact and confidence.
- Review a recommendation, edit its parameters, approve or reject it, then monitor execution and external confirmation.
- Compare a defined baseline with subsequent observed outcomes and feed acceptance, rejection and measured results into future recommendations.
- See who changed what, when, why, for which branch, and whether the external channel confirmed it.

## Operating loop and business rules

Observe → Diagnose → Recommend → Explain → Human Approval → Execute → Verify → Measure → Learn → Recommend Again. Every insight carries source, observation time, branch scope and provenance. Forecasts and “AI confidence” are estimates, never observed sales or causal proof. No autonomous financial action in MVP. Every external write needs capability entitlement, validation, explicit approval where required, idempotency and an audit event. Rejection is feedback, not an external write.

Recommendation status is `recommended`; approval is `pending|approved|rejected`; execution is `queued|publishing|submitted|published|failed`; external confirmation is `not_confirmed|confirmed_live`. A submitted or completed HungerStation job may still need a read-back or other evidence before “confirmed live.” Product drafts remain separate from published channel state.

## MVP boundaries

Build a trustworthy vertical path first: workspace/auth, authorized connection, branch and catalog import, opportunity inbox, human review, supported price/availability update, async result handling, audit and outcome measurement. Promotions may follow once access and restaurant applicability are confirmed. The approved UI also depicts rich content editing, modifiers, custom bundles, ads, sponsored search, bids, market intelligence and projections. Keep these as domain concepts and honest demo/internal workflows until official access and data rights are verified. Do not present simulated figures as HungerStation intelligence.

Language and money: design contains English and Arabic toggle, localized fields and SAR prices. Implement locale-aware RTL and formatting when building UI; confirm Arabic copy and tax/accounting rules with the product owner. Desktop is the approved visual source; mobile behavior needs explicit design decisions.

## Sources

- Approved Stitch project: `projects/8813799588670496359`, 18 desktop screens, inspected 2026-09-26.
- [HungerStation Partner API](https://developer.hungerstation.com/api-specifications) and [developer portal](https://developer.hungerstation.com/en), inspected 2026-09-26.
- [Supabase MCP guide](https://supabase.com/docs/guides/ai-tools/mcp). Connected `supabase-yamdy` read-only inspection found no application tables or migrations.
