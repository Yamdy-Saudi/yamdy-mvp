# Permissions and tenant isolation

Roles are proposed pending owner approval. A workspace member can have a subset of branches. Authorization combines authenticated user, active membership, role permission, branch scope and operation-specific guardrails. The UI hides unavailable actions, while server checks and RLS enforce them.

| Action | Owner | General manager | E-commerce manager | Operator | Viewer |
|---|---|---|---|---|---|
| View scoped inbox, catalog and metrics | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit internal catalog/promotion drafts | ✓ | ✓ | ✓ | Availability only | — |
| Request publish / submit recommendation | ✓ | ✓ | ✓ | Operational only | — |
| Approve financial price/promotion/ad spend | ✓ | ✓ within policy | Optional delegated limit | — | — |
| Approve operational availability | ✓ | ✓ | ✓ | Within branch scope | — |
| Manage integration credentials and webhook configuration | ✓ | — | — | — | — |
| Invite users, change roles/guardrails | ✓ | Optional delegated invite | — | — | — |
| View audit log | ✓ | ✓ | ✓ scoped | ✓ scoped | ✓ scoped |

Never let requester approve their own financially significant action by default; confirm whether the owner requires strict separation for all actions. A missing branch scope means no branch access, except explicit whole-workspace scope. An approval creates an execution intent; execution workers recheck connection entitlement and policy and never trust a client-provided approver, workspace ID or cost. Membership removal invalidates access to subsequent operations; pending intents need a documented policy.

RLS: `SELECT` checks active workspace membership and branch scope, `INSERT/UPDATE` checks role plus ownership of referenced rows; `WITH CHECK` prevents changing workspace or branch ownership. No exposed `public` table without RLS. Private credential references and raw webhook payloads are inaccessible to clients. Use explicit grants alongside RLS when Data API exposure is configured. Test two tenants, cross-workspace FK injection, revoked members and role downgrades. Supabase guidance: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [securing the Data API](https://supabase.com/docs/guides/api/securing-your-api).
