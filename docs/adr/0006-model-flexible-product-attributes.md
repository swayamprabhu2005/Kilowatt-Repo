# ADR 0006: Model Flexible Product Attributes via Hybrid Relational + JSON

## Status
Accepted

## Date
2026-10-13

## Context and Problem
PIM systems must accommodate radically diverse product types. For example, a laptop requires CPU, RAM (GB), storage (GB), and screen size attributes, while a t-shirt requires size, color, fit, and material. Adding fixed columns to a static `products` table causes schema churn, sparse tables, and inflexibility. Conversely, classic Entity-Attribute-Value (EAV) tables with multiple typed value columns (`value_text`, `value_number`, etc.) require costly multi-table joins, complex indexing, and difficult query assembly in SQLite.

## Decision
We select a **Hybrid Relational + Validated JSON** model:
1. **Relational Attribute Definitions**: The `attribute_definitions` table defines metadata, data types (`text`, `number`, `boolean`, `select`, `multiselect`, `date`), validation rules (min, max, pattern), allowed options (for select/multiselect), and flags (`isRequired`, `isFilterable`, `isVariantParam`).
2. **Validated JSON Product Attributes**: Product-specific values are stored in `products.attributes_json` as a structured JSON object (e.g., `{"ram_gb": 32, "storage_gb": 1024}`).
3. **Strict Backend Validation**: On every product create/update, the backend dynamically generates a Zod schema from the workspace's active attribute definitions and strictly validates the incoming JSON payload before writing to the database.

## Options Considered
1. **Fixed Columns on Products Table**: Rigid, cannot support dynamic user-defined attributes without running DDL migrations at runtime.
2. **Classic EAV (product_attribute_values table)**: Fully normalized, but requires multi-row inserts, multi-join queries for product details, and complex sorting/filtering logic in SQLite.
3. **Hybrid Relational Definitions + Validated JSON (Chosen)**: Fast reads (single row fetch), clean SQLite storage, flexible dynamic attributes, zero join overhead for WooCommerce payload generation, backed by strict server-side schema validation.

## Positive Consequences
- Adding or configuring attributes does not require altering the SQLite schema.
- Instant product retrieval with zero join penalty.
- Clean serialization directly into WooCommerce attribute structures.

## Negative Consequences and Risks
- Filtering products by arbitrary JSON attributes in SQLite requires JSON functions (`json_extract`). Addressed by indexed relational columns for core fields (status, sku, category) and in-memory or indexed JSON expressions where needed.

## Related ADRs
- [ADR 0002: Use SQLite for Local Persistence](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0002-use-sqlite-for-local-persistence.md)
