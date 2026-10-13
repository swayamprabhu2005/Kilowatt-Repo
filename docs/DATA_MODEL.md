# Data Model Specification — Orivanta PIM

## 1. Relational Entities (SQLite)

### 1.1 `workspaces`
Represents an isolated multi-tenant organization.
- `id` (TEXT, PK): Unique identifier (e.g. `ws_default`).
- `name` (TEXT): Display name.
- `slug` (TEXT, UNIQUE): URL-friendly unique identifier.
- `created_at` (INTEGER): Unix timestamp (ms).
- `updated_at` (INTEGER): Unix timestamp (ms).

### 1.2 `users`
System user account. Passwords hashed using Argon2id.
- `id` (TEXT, PK): Unique identifier.
- `email` (TEXT, UNIQUE): Login email address.
- `password_hash` (TEXT): Argon2id password hash.
- `name` (TEXT): User full name.
- `created_at` (INTEGER): Unix timestamp (ms).
- `updated_at` (INTEGER): Unix timestamp (ms).

### 1.3 `workspace_members`
Association table linking users to workspaces with role-based access.
- `id` (TEXT, PK): Member identifier.
- `workspace_id` (TEXT, FK): References `workspaces.id`.
- `user_id` (TEXT, FK): References `users.id`.
- `role` (TEXT): `owner`, `admin`, `editor`, or `viewer`.
- `created_at` (INTEGER): Unix timestamp (ms).
- *Constraints*: Unique index on `(workspace_id, user_id)`.

### 1.4 `sessions`
Server-persisted user sessions for cookie authentication.
- `id` (TEXT, PK): Cryptographically secure random session token.
- `user_id` (TEXT, FK): References `users.id`.
- `active_workspace_id` (TEXT, FK): References `workspaces.id`.
- `expires_at` (INTEGER): Expiry timestamp (ms).
- `created_at` (INTEGER): Creation timestamp (ms).

### 1.5 `categories`
Hierarchical product taxonomy.
- `id` (TEXT, PK): Unique category ID.
- `workspace_id` (TEXT, FK): Tenant isolation scope.
- `name` (TEXT): Category name.
- `slug` (TEXT): URL slug.
- `description` (TEXT): Optional category description.
- `parent_id` (TEXT, FK): Optional reference to parent category `id`.
- `woo_category_id` (INTEGER): External mapped WooCommerce category ID.
- `created_at` (INTEGER): Unix timestamp (ms).
- `updated_at` (INTEGER): Unix timestamp (ms).
- *Constraints*: Unique index on `(workspace_id, slug)`.

### 1.6 `attribute_definitions`
Metadata defining dynamic product attributes.
- `id` (TEXT, PK): Attribute ID.
- `workspace_id` (TEXT, FK): Tenant isolation scope.
- `code` (TEXT): Machine-readable identifier (e.g. `ram_gb`, `color`).
- `name` (TEXT): Human-readable label.
- `description` (TEXT): Field description and helper text.
- `data_type` (TEXT): `text`, `number`, `boolean`, `select`, `multiselect`, `date`.
- `is_required` (INTEGER): 1 = mandatory, 0 = optional.
- `is_filterable` (INTEGER): 1 = enable filter in catalogue table.
- `is_variant_param` (INTEGER): 1 = eligible for variant generation.
- `applicable_product_types` (TEXT): Comma-delimited (`simple,variable`).
- `options_json` (TEXT): JSON array of string options for select/multiselect.
- `validation_rules_json` (TEXT): JSON object containing constraints (`min`, `max`, `pattern`).
- `created_at` (INTEGER): Unix timestamp (ms).
- `updated_at` (INTEGER): Unix timestamp (ms).
- *Constraints*: Unique index on `(workspace_id, code)`.

### 1.7 `products`
Core product catalog entity.
- `id` (TEXT, PK): PIM product ID.
- `workspace_id` (TEXT, FK): Tenant isolation scope.
- `name` (TEXT): Product title.
- `slug` (TEXT): Product URL slug.
- `sku` (TEXT): Stock Keeping Unit.
- `product_type` (TEXT): `simple` or `variable`.
- `status` (TEXT): `draft`, `published`, `archived`.
- `brand` (TEXT): Manufacturer or brand name.
- `short_description` (TEXT): Summary description.
- `description` (TEXT): Detailed HTML/Markdown description.
- `price` (REAL): Base regular price.
- `stock_quantity` (INTEGER): Current inventory count.
- `attributes_json` (TEXT): Validated JSON object of attribute code-value pairs:
  ```json
  {
    "ram_gb": 32,
    "storage_gb": 1024,
    "processor": "M3 Pro",
    "wireless": true
  }
  ```
- `images_json` (TEXT): Validated JSON array of media assets:
  ```json
  [
    { "url": "https://images.unsplash.com/...", "alt": "Front View" }
  ]
  ```
- `woo_product_id` (INTEGER): External mapped WooCommerce product ID.
- `sync_status` (TEXT): `not_synced`, `pending`, `syncing`, `synced`, `failed`.
- `last_sync_at` (INTEGER): Timestamp of last successful sync.
- `sync_error` (TEXT): Sanitized error message if sync failed.
- `created_at` (INTEGER): Unix timestamp (ms).
- `updated_at` (INTEGER): Unix timestamp (ms).
- *Constraints*: Unique index on `(workspace_id, sku)`.

### 1.8 `product_variants`
Variations of a parent variable product.
- `id` (TEXT, PK): Variant ID.
- `product_id` (TEXT, FK): References parent `products.id`.
- `workspace_id` (TEXT, FK): Tenant isolation scope.
- `sku` (TEXT): Unique variant SKU.
- `attribute_combination_json` (TEXT): Validated combination mapping:
  ```json
  { "color": "Midnight Black", "size": "M" }
  ```
- `price_override` (REAL): Optional variant-specific price.
- `stock_quantity` (INTEGER): Variant inventory level.
- `is_active` (INTEGER): 1 = active, 0 = disabled.
- `woo_variation_id` (INTEGER): External WooCommerce variation ID.
- `sync_status` (TEXT): `not_synced`, `pending`, `syncing`, `synced`, `failed`.
- `created_at` (INTEGER): Unix timestamp (ms).
- `updated_at` (INTEGER): Unix timestamp (ms).
- *Constraints*: Unique index on `(workspace_id, sku)`.

### 1.9 `sync_jobs`
Audit trail and queue of all synchronization operations.
- `id` (TEXT, PK): Unique job ID (e.g. `job_001`).
- `workspace_id` (TEXT, FK): Tenant isolation scope.
- `product_id` (TEXT, FK): References `products.id` (set null on delete).
- `integration_mode` (TEXT): `mock` or `woocommerce`.
- `operation_type` (TEXT): `create`, `update`, `delete`, `bulk`.
- `status` (TEXT): `pending`, `syncing`, `synced`, `failed`.
- `attempt_count` (INTEGER): Retry counter.
- `started_at` (INTEGER): Timestamp when worker initiated sync.
- `finished_at` (INTEGER): Timestamp when completed or failed.
- `woo_id` (INTEGER): External ID returned by WooCommerce.
- `error_code` (TEXT): Machine error code (e.g. `VALIDATION_FAILED`).
- `error_message` (TEXT): Sanitized human-readable error.
- `request_payload_sanitized` (TEXT): Redacted payload snapshot.
- `response_payload_sanitized` (TEXT): Redacted response snapshot.
- `created_at` (INTEGER): Creation timestamp (ms).

### 1.10 `ai_agent_runs`
Audit log of all Gemini agentic executions.
- `id` (TEXT, PK): Unique run ID.
- `workspace_id` (TEXT, FK): Tenant isolation scope.
- `user_id` (TEXT, FK): User who initiated the AI task.
- `task_type` (TEXT): `audit`, `enrichment`, `diagnosis`, `catalogue_query`.
- `model` (TEXT): Gemini model identifier (e.g. `gemini-2.5-flash`).
- `status` (TEXT): `running`, `completed`, `failed`, `step_limit_reached`.
- `tool_trace_json` (TEXT): Structured array of executed tools and sanitized outputs.
- `summary` (TEXT): High-level agent executive summary.
- `structured_result_json` (TEXT): Machine-readable output (diffs, checklist).
- `created_at` (INTEGER): Unix timestamp (ms).
