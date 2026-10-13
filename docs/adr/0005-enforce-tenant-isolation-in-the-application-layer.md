# ADR 0005: Enforce Tenant Isolation in the Application Layer

## Status
Accepted

## Date
2026-10-13

## Context and Problem
Orivanta PIM supports multiple workspaces (tenants). Cross-tenant data leaks are a critical vulnerability. However, because SQLite is chosen as the embedded local database, PostgreSQL-style native Row Level Security (RLS) is not available. Relying on frontend visibility toggles or optional query filters creates severe risks of unauthorized access.

## Decision
We enforce multi-tenant isolation rigorously in the **Application Layer** using the **Context-Enforced Repository Pattern**:
1. **Server-Side Session Resolution**: Every authenticated HTTP request resolves the user's session and verifies active workspace membership via middleware (`backend/src/middleware/tenant.ts`).
2. **Mandatory WorkspaceContext**: Controllers and services extract `WorkspaceContext { userId, workspaceId, role }` from `req.workspaceCtx` and pass it to all repository functions.
3. **Repository Scope Enforcement**: Every repository query (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) strictly includes an `and(eq(table.id, id), eq(table.workspaceId, ctx.workspaceId))` condition.
4. **Ownership Before Existence**: Lookups for out-of-scope IDs return 404/403 without revealing whether the record exists in another workspace, preventing tenant enumeration.
5. **AI Tool Scoping**: AI agent tools strictly inherit `ctx.workspaceId` from the authenticated request, preventing the LLM from accessing data outside the authorized tenant.
6. **Negative Authorization Tests**: Automated integration tests verify that a user in Workspace A receives 404/403 when attempting to access or mutate records belonging to Workspace B.

## Options Considered
1. **Database-per-Tenant (Separate SQLite files)**: High file management overhead, complex migrations across dozens of files, difficult aggregation.
2. **Dynamic Query Interceptor Proxy**: Complex SQL parsing and AST manipulation; high risk of subtle bypasses in complex subqueries.
3. **Context-Enforced Repository Pattern (Chosen)**: Clear, explicit, type-safe, simple to audit, and verified by negative integration tests.

## Positive Consequences
- Robust tenant isolation with zero database-level dependency.
- Negative test suite provides continuous regression verification.
- Consistent developer experience across all modules.

## Security Implications
- Documentation explicitly clarifies that SQLite does not provide RLS, and tenant security is maintained by strict application-layer access controls.

## Related ADRs
- [ADR 0002: Use SQLite for Local Persistence](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0002-use-sqlite-for-local-persistence.md)
