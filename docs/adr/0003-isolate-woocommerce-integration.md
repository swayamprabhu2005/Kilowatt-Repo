# ADR 0003: Isolate WooCommerce Integration Behind Adapter

## Status
Accepted

## Date
2026-10-13

## Context and Problem
WooCommerce REST API v3 has specific conventions, payload shapes, and limitations (e.g., HTML descriptions, flat attribute arrays with term options, separate endpoint structures for variations). Binding the internal PIM product domain model directly to WooCommerce's API representations would tightly couple the system to a single external platform, make future ecommerce connectors (Shopify, BigCommerce, Magento) difficult to introduce, and pollute PIM business logic with external validation nuances.

## Decision
We introduce an explicit **WooCommerce Adapter & Mapper** architecture:
- `backend/src/integrations/woocommerce/woo-client.ts`: Low-level HTTP client handling authentication, HTTPS enforcement, request timeouts, and secret redaction.
- `backend/src/integrations/woocommerce/woo-mapper.ts`: Pure translation layer between internal PIM entities and WooCommerce REST v3 representations (`PimProduct` <-> `WooProduct`, `PimVariant` <-> `WooVariation`).
- `backend/src/integrations/woocommerce/woo-service.ts`: High-level domain service providing a uniform interface for connection verification, product creation, updates, and variation syncing.

PIM database entities maintain separate identifiers (`id` vs `woo_product_id`, `woo_variation_id`).

## Options Considered
1. **Direct Coupling in Product Routes**: Controllers call WooCommerce REST API directly. High code duplication, fragile error handling, impossible to test offline.
2. **Generic Multi-Channel Abstract Engine**: High initial abstraction overhead with dynamic pluggable plugins. Overengineered for the hackathon challenge.
3. **Adapter & Mapper Architecture (Chosen)**: Clean boundary, single responsibility, easy to unit test mappers with static fixtures, decoupled PIM data model.

## Rationale and Trade-offs
Separating the mapper and client ensures that changes in WooCommerce API contracts (or differences between WooCommerce versions) only touch the adapter layer. Internal PIM entities retain rich typing and validated JSON dynamic attributes without compromising external compatibility.

## Positive Consequences
- PIM domain model remains clean, typed, and independent.
- 100% testable mapping logic with unit tests without making network calls.
- Clear error translation from external HTTP statuses (401, 404, 422) into domain error codes.

## Security Implications
- WooCommerce Consumer Key and Consumer Secret are consumed exclusively by the backend adapter from environment variables. They are never returned in API responses or logs.

## Related ADRs
- [ADR 0004: Use a Mock Integration Mode](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0004-use-a-mock-integration-mode.md)
- [ADR 0007: Design Idempotent Product Synchronisation](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0007-design-idempotent-product-synchronisation.md)
