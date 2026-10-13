# Architecture Decision Records (ADR) — Orivanta PIM

This directory contains the formal Architecture Decision Records for **Orivanta PIM**, following the conventions established by [Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) and the [Architecture Decision Record Repository](https://github.com/architecture-decision-record/architecture-decision-record).

## Numbering & Lifecycle Conventions
- Records are numbered sequentially using four digits: `0001`, `0002`, etc.
- Record filenames follow the pattern: `####-short-descriptive-title.md`.
- Status transitions:
  - **Proposed**: Under review.
  - **Accepted**: Decision made and in effect.
  - **Superseded**: Replaced by a subsequent ADR (must reference the superseding ADR).
  - **Deprecated**: Abandoned or no longer applicable.
- Once accepted, ADRs are immutable historical records. If an architectural decision changes, author a new ADR that explicitly references and supersedes the earlier record.

---

## Index of Architectural Decisions

| ID | Title | Status | Date | Decision Summary |
| :--- | :--- | :--- | :--- | :--- |
| [0001](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0001-use-react-and-express.md) | Use React and Express in a Monorepo | Accepted | 2026-10-13 | Full-stack TypeScript architecture with Vite/React frontend and Express backend. |
| [0002](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0002-use-sqlite-for-local-persistence.md) | Use SQLite for Local Persistence | Accepted | 2026-10-13 | Local zero-dependency persistence with `better-sqlite3`, WAL mode, and Drizzle ORM. |
| [0003](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0003-isolate-woocommerce-integration.md) | Isolate WooCommerce Integration Behind Adapter | Accepted | 2026-10-13 | Decouple internal PIM models from external WooCommerce REST API schemas. |
| [0004](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0004-use-a-mock-integration-mode.md) | Use a Deterministic Mock Integration Mode | Accepted | 2026-10-13 | Support zero-credential offline development, automated tests, and predictable evaluations. |
| [0005](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0005-enforce-tenant-isolation-in-the-application-layer.md) | Enforce Tenant Isolation in the Application Layer | Accepted | 2026-10-13 | Strict WorkspaceContext repository filtering compensating for SQLite's lack of RLS. |
| [0006](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0006-model-flexible-product-attributes.md) | Model Flexible Product Attributes via Hybrid Relational + JSON | Accepted | 2026-10-13 | Relational attribute definitions combined with Zod-validated JSON product attributes. |
| [0007](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0007-design-idempotent-product-synchronisation.md) | Design Idempotent Product Synchronisation | Accepted | 2026-10-13 | Explicit state machine, SQLite-backed job queue, and duplicate-prevention tracking. |
| [0008](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0008-use-gemini-for-bounded-agentic-ai.md) | Use Gemini for Bounded Agentic AI | Accepted | 2026-10-13 | Server-side bounded tool loop via `@google/genai` with verifiable execution traces. |
| [0009](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0009-require-human-approval-for-ai-proposed-mutations.md) | Require Human Approval for AI-Proposed Mutations | Accepted | 2026-10-13 | Strict safety boundary; AI generates diffs and audits, human explicitly commits changes. |
