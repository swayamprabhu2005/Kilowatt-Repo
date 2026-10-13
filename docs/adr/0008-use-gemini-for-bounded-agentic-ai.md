# ADR 0008: Use Gemini for Bounded Agentic AI

## Status
Accepted

## Date
2026-10-13

## Context and Problem
The project requires an agentic AI assistant capable of reasoning over product data, checking attribute completeness, drafting enriched content, and diagnosing sync failures. A simple one-shot LLM chat or prompt completion does not satisfy the requirement for true agentic tool use. Conversely, an unbounded autonomous loop poses risks of runaway API consumption, hallucinations, infinite loops, and data destruction.

## Decision
We implement a **Bounded Agentic Tool Execution Loop** powered by Gemini (`gemini-2.5-flash` via `@google/genai`):
1. **Registered Toolset**: A finite set of server-controlled tools:
   - `get_product(productId)`
   - `search_products(query, filters, limit)`
   - `get_attribute_definitions(productType)`
   - `get_categories(query)`
   - `validate_product(productId)`
   - `get_product_variants(productId)`
   - `get_sync_history(productId, limit)`
   - `draft_product_enrichment(productId, notes, requestedFields)`
   - `compare_product_changes(productId, proposedPatch)`
2. **Strict Argument Validation**: All model-generated tool arguments are parsed and validated via Zod schemas before execution.
3. **Bounded Execution**: Loop enforces a hard step limit (`AI_MAX_TOOL_STEPS=6`) and request timeout (`AI_REQUEST_TIMEOUT_MS=30000`).
4. **Verifiable Execution Traces**: Every tool execution is recorded in a trace containing tool name, sanitized inputs, duration, success/failure, and summary, visible to users in the UI.
5. **Zero-Credential Fallback**: When `AI_ENABLED=false` or `GEMINI_API_KEY` is not provided, the backend seamlessly employs `MockGeminiProvider` to execute deterministic agentic demonstrations and pass automated tests without network requests or API costs.

## Options Considered
1. **Unbounded Autonomous Loop**: High risk of infinite loops, prompt injection exploits, and quota depletion.
2. **Static One-Shot Chatbot**: Does not use real backend tools; fails hackathon agentic criteria.
3. **Bounded Server-Controlled Tool Loop (Chosen)**: Predictable, verifiable, safe, testable offline with mock provider, and fully functional with live Gemini API keys.

## Positive Consequences
- True agentic workflow: model reasons, selects tools, inspects real PIM state, and formulates structured recommendations.
- Trace visibility proves tool execution to evaluators.
- Graceful offline fallback ensures the entire PIM is testable without a paid Gemini key.

## Related ADRs
- [ADR 0009: Require Human Approval for AI-Proposed Mutations](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0009-require-human-approval-for-ai-proposed-mutations.md)
