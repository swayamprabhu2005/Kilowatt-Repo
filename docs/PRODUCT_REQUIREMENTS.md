# Product Requirements Document — Orivanta PIM

## 1. Executive Summary
**Orivanta PIM** is an enterprise-grade Product Information Management (PIM) platform designed to centralise, enrich, validate, and synchronise product catalogues with WooCommerce stores. Built with an offline-first architecture, local SQLite persistence, application-layer multi-tenancy, and a server-side Gemini-powered Agentic AI assistant, Orivanta PIM eliminates data discrepancies between product development and retail channels.

---

## 2. Core Functional Requirements

### 2.1 Workspace & User Authentication
- **Secure Authentication**: Server-side password verification using Argon2id with salted hashing.
- **Session Lifecycle**: HTTP-only, same-site session cookies stored in SQLite with explicit expiration and logout invalidation.
- **Multi-Tenant Workspaces**: Complete logical isolation of data by workspace. Every user operates within their authorized active workspace.
- **Demo Mode**: Built-in seeded demo administrator account (`demo@orivanta.local` / `OrivantaDemo2026!`) for zero-friction evaluation.

### 2.2 Dynamic Attribute Engine (Mandatory Hackathon Area 2)
- **Attribute Definitions**: Admin-configurable attributes supporting 6 core data types:
  1. `text`: Single-line or multi-line strings with length validation.
  2. `number`: Floats and integers with min/max range constraints.
  3. `boolean`: True/false flags.
  4. `select`: Single choice from an enumerated list of options.
  5. `multiselect`: Multiple choices from an enumerated list.
  6. `date`: ISO calendar dates.
- **Rules & Metadata**: Unique machine-readable code, display name, description, required/optional flag, filterable flag, and variant parameter eligibility.
- **Dynamic Product Schema Conformance**: Product attribute values are validated against active definitions on every write.

### 2.3 Product Catalogue Management (Mandatory Hackathon Area 1)
- **Product Hierarchy**: Support for Simple and Variable products.
- **Product Fields**: Name, slug, SKU (unique per workspace), status (`draft`, `published`, `archived`), brand, short description, rich full description, pricing, stock quantity, images, and category assignments.
- **Search & Filtering**: Multi-field search across Name, SKU, and brand; faceted filters for status, category, and sync state.
- **Batch Operations**: Bulk status changes, bulk category assignments, and bulk synchronization.
- **Import / Export**: CSV catalogue export and schema-compliant CSV import.

### 2.4 Product Variants & Matrix
- **Parent-Child Modeling**: Variable products link to multiple child variants.
- **Variant Attributes**: Variants define specific combinations of eligible attributes (e.g. Size `M` + Color `Terracotta Red`).
- **Overrides**: SKU override, price override, and dedicated stock quantities per variant.
- **Collision Prevention**: Detection and prevention of duplicate attribute combinations within the same product.

### 2.5 WooCommerce Integration & Sync Engine (Mandatory Hackathon Area 3)
- **Adapter Architecture**: PIM domain model decoupled from external WooCommerce schemas.
- **Dual Mode**:
  - `mock`: In-memory/SQLite deterministic simulated store for zero-cost, offline evaluation.
  - `woocommerce`: Real WooCommerce REST API v3 client with secure HTTPS transport.
- **Idempotent Sync Workflow**: State transitions (`not_synced` -> `pending` -> `syncing` -> `synced` / `failed`), pre-sync validation, external ID persistence, and duplicate-free retries.
- **Sync History**: Full audit trail of sync jobs with timestamps, attempt counts, and sanitized payloads.

### 2.6 Gemini-Powered Agentic AI Assistant
- **Bounded Tool Loop**: Server-side loop calling up to 6 registered tools per task.
- **Trace Visibility**: Step-by-step tool execution history visible in the UI.
- **Workflows**:
  1. *Product Completeness Audit*: Diagnoses missing attributes, descriptions, and sync blockers.
  2. *AI-Assisted Enrichment*: Drafts titles, descriptions, and compliant attribute values with field-level diffs.
  3. *Sync Readiness Diagnosis*: Explains validation errors and recommends safe remediations.
  4. *Natural Language Catalogue Query*: Answers structured inventory questions using scoped read-only tools.
- **Safety Boundary**: Zero autonomous mutations; requires explicit human review and confirmation.

---

## 3. Non-Functional Requirements
- **Budget**: ₹0 required expenditure.
- **Local Persistence**: Runs completely from local SQLite without hosted databases.
- **Performance**: Sub-50ms API response times for local catalogue queries.
- **Visual Identity**: Warm editorial palette (**Terracotta & Warm Ivory**), zero blue/green themes, following Emil Kowalski's design-engineering principles.
- **Security**: Application-layer tenant isolation, secret redaction, and strict input validation via Zod.
