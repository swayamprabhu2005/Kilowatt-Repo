# ADR 0007: Design Idempotent Product Synchronisation

## Status
Accepted

## Date
2026-10-13

## Context and Problem
Synchronizing product data with an external ecommerce platform like WooCommerce involves network requests that may fail, time out, or be retried. Non-idempotent synchronisation could result in duplicate products in WooCommerce, corrupted variation mappings, or desynchronized inventory.

## Decision
We implement an **Idempotent State Machine & SQLite-Backed Sync Queue**:
1. **Explicit Sync States**: Products and variants transition through:
   - `not_synced` -> `pending` -> `syncing` -> `synced` (or `failed`).
2. **Pre-Sync Intent Recording**: Before making external requests, a `sync_jobs` record is atomically inserted with status `pending` and sanitized payload snapshot.
3. **External ID Persistence**:
   - If `woo_product_id` is null, the adapter executes `POST /wp-json/wc/v3/products` (create).
   - Once assigned, subsequent syncs strictly execute `PUT /wp-json/wc/v3/products/{woo_product_id}` (update).
   - Retrying a failed sync checks if an external ID was already returned to prevent duplicate creation.
4. **Validation-Before-Sync**: Products with missing required attributes, missing titles, or invalid pricing are blocked from syncing before any network request is initiated.
5. **Safe Retry Logic**: Failed sync jobs can be retried individually or in bulk. Retries increment `attempt_count` and update job history without creating duplicate external entities.

## Options Considered
1. **Direct Synchronous Calls Without Job Records**: Transient, unobservable, leaves no audit trail, fails silently on network blips.
2. **External Message Broker (RabbitMQ / Redis)**: Introduces heavy external dependencies, breaking the zero-cost local SQLite architecture.
3. **SQLite-Backed Sync Queue (Chosen)**: Zero external infrastructure, ACID-backed job status transitions, persistent history, observable via API and UI.

## Positive Consequences
- Zero risk of creating duplicate products upon repeated sync requests or retries.
- Full auditability via the `sync_jobs` table.
- Clear error messages captured and displayed in the UI.

## Related ADRs
- [ADR 0003: Isolate WooCommerce Integration Behind Adapter](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0003-isolate-woocommerce-integration.md)
- [ADR 0004: Use a Mock Integration Mode](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0004-use-a-mock-integration-mode.md)
