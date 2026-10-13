# ADR 0009: Require Human Approval for AI-Proposed Mutations

## Status
Accepted

## Date
2026-10-13

## Context and Problem
Allowing an AI model to autonomously update production database records, delete catalog items, or publish untested product changes to an external WooCommerce store carries severe operational risks. Hallucinated technical specifications, incorrect price updates, or unauthorized publications could cause immediate business harm.

## Decision
We enforce a strict **Human Approval Boundary**:
1. **Advisory by Default**: AI tools are strictly read-only (`get_*`, `search_*`, `validate_*`) or transient draft/comparison tools (`draft_*`, `compare_*`).
2. **Zero Autonomous Mutation Tools**: The agent registry contains no tools capable of writing to the database or publishing to WooCommerce.
3. **Structured Proposal with Field Diff**: The AI returns structured recommendations (audit checklist, proposed field-level diffs, validation notices).
4. **Independent Human Action**: Persisting any proposed change requires the user to review the diff in the UI and click an explicit "Apply Changes" button. The mutation is then submitted to standard authenticated, tenant-scoped, and schema-validated application endpoints.
5. **No AI-Triggered Sync**: Initiating an external WooCommerce synchronisation always requires an explicit human click in the UI.

## Options Considered
1. **Autonomous Mutation Tool (`update_product_in_db`)**: Grants the LLM direct database write access. Highly dangerous; vulnerable to prompt injection and hallucinated specs.
2. **Post-Mutation Undo Log**: The AI mutates first and allows the user to undo later. Unacceptable for external WooCommerce sync side effects.
3. **Strict Human-in-the-Loop Proposal & Commit (Chosen)**: The AI is an intelligent advisor; the human operator remains the authoritative decision-maker.

## Positive Consequences
- Guarantees zero unintentional data overwrites or hallucinations in production records.
- Complete compliance with enterprise security and audit standards.
- Evaluators can clearly see the proposed diff and the explicit approval boundary.

## Related ADRs
- [ADR 0008: Use Gemini for Bounded Agentic AI](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0008-use-gemini-for-bounded-agentic-ai.md)
- [ADR 0005: Enforce Tenant Isolation in the Application Layer](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0005-enforce-tenant-isolation-in-the-application-layer.md)
