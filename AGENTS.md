<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Yamdy project instructions

Read `docs/PRODUCT_SPEC.md`, `docs/SCREEN_MAP.md`, `docs/ARCHITECTURE.md`, `docs/HUNGERSTATION_CAPABILITY_MATRIX.md`, and `docs/DECISIONS.md` before product work. The approved UI is the 18 numbered desktop screens in Stitch project `projects/8813799588670496359`; inspect the actual screen before implementing it. Keep this repository's TanStack Start, React, TypeScript, Tailwind and shadcn/Radix stack unless a concrete need justifies a change.

Yamdy is a Saudi multi-tenant restaurant operating layer. Design around Observe → Diagnose → Recommend → Explain → Human Approval → Execute → Verify → Measure → Learn. Keep recommendation, approval, execution, and external confirmation as distinct states. Approval never means publication; an accepted job never proves a customer-visible change.

HungerStation is the first adapter, not the domain model. Consult current [official Partner API documentation](https://developer.hungerstation.com/api-specifications) and the capability matrix before using a capability. Its public portal describes quick commerce; restaurant applicability and account entitlements need confirmation. Never infer API support from a Stitch control. Keep unsupported flows as clearly labeled internal drafts or simulations. Never call production APIs or initiate financial actions without explicit authorization.

Every database change must be written in a version-controlled migration file and applied through the migration workflow. This includes schema, RLS policies, functions, reference data, and backfills. Never change a database by running ad hoc SQL directly through Supabase MCP, SQL Editor, `psql`, or another client; read-only inspection queries are allowed. Every exposed business table needs workspace-scoped RLS and tests. Resolve workspace membership server-side; never trust a client-supplied workspace ID for authorization. Integration, Supabase service role, and AI secrets stay server-side. Validate webhook authenticity, deduplicate events and publishes, use safe retries, and record immutable audit events. Financially significant recommendations need a human approver.

Use seeded data only with an explicit demo label. Keep market-intelligence acquisition and recommendation generation behind provider interfaces; do not scrape unauthorized sources or select an AI vendor by default. Update `docs/DECISIONS.md` when a technical assumption changes. Do not rewrite published Lovable Git history.
