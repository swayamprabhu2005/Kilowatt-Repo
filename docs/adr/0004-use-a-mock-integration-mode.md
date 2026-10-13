# ADR 0004: Use a Mock Integration Mode

## Status
Accepted

## Date
2026-10-13

## Context and Problem
Evaluators, hackathon judges, and developers evaluating the codebase may not possess an active WordPress + WooCommerce installation or external API keys. Requiring a paid hosting plan, local PHP/MySQL server, or cloud WooCommerce store would prevent zero-friction local execution. Furthermore, external network flakiness during automated CI tests could cause false-positive test failures.

## Decision
We implement a **Deterministic Mock Integration Mode** alongside the real WooCommerce adapter:
- Configured via environment variable: `INTEGRATION_MODE=mock` (default) vs `INTEGRATION_MODE=woocommerce`.
- `backend/src/integrations/woocommerce/woo-mock-adapter.ts` implements the exact same `WooAdapterInterface` as the live client.
- Provides realistic, deterministic responses for:
  - Connection health verification (`{ success: true, storeName: 'Orivanta Demo Store (Mock Mode)' }`).
  - Product creation (assigns simulated ID `woo-mock-100x`).
  - Product updates (reflects changes, updates timestamps).
  - Variation creation and synchronization.
  - Failure simulation (allows testing failed syncs and retry workflows on demand).
- The user interface displays a prominent `DEMO MODE` / `MOCK MODE` badge across all integration screens.

## Options Considered
1. **Require Real WooCommerce Store**: Blocks evaluators who do not own a WooCommerce store; breaks ₹0 budget constraint.
2. **Frontend-Only Fake Syncing**: Bypasses backend sync queues; fails to test the backend architecture, database jobs, and retry state machine.
3. **Backend Mock Adapter (Chosen)**: Executes the entire real backend stack (controllers, validation, sync queue, job records, error handling) while intercepting only the final external HTTP transport.

## Rationale and Trade-offs
Mock mode enables 100% end-to-end testing of the PIM sync engine, state transitions, and error recovery without external network dependencies. It is not a fake mockup; all sync jobs, attempts, and external IDs are genuinely stored in SQLite.

## Positive Consequences
- Zero-dependency local setup works immediately after `npm install` and `npm run db:seed`.
- Automated test suites run quickly and reliably without external network requests.
- Evaluators can demonstrate successful syncs, simulated failures, and idempotent retries out of the box.

## Security Implications
- Never reports mock operations as live WooCommerce operations; clear transparency in logs and UI prevents accidental confusion.

## Related ADRs
- [ADR 0003: Isolate WooCommerce Integration Behind Adapter](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0003-isolate-woocommerce-integration.md)
- [ADR 0007: Design Idempotent Product Synchronisation](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0007-design-idempotent-product-synchronisation.md)
