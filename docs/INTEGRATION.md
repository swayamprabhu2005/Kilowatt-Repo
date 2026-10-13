# WooCommerce Integration Specification — Orivanta PIM

## 1. Overview
Orivanta PIM decouples the internal Product Information Management model from WooCommerce via an **Adapter Pattern**. This architecture guarantees that PIM workflows, data validation, and AI agent execution are independent of external store API status.

---

## 2. Supported Integration Modes

### 2.1 Mock Mode (`INTEGRATION_MODE=mock`)
- **Default Evaluation Mode**: Zero external accounts, zero credentials, zero network dependency.
- **Deterministic Emulation**: Simulates WooCommerce REST API v3 responses, ID generation, rate limits, and date timestamps.
- **Simulated Failure Capability**: The operator can trigger `POST /api/sync/simulate-failure` to verify error capture, diagnostic logging, and idempotent retry loops.

### 2.2 Live WooCommerce Mode (`INTEGRATION_MODE=woocommerce`)
- **Endpoint**: WooCommerce REST API v3 (`/wp-json/wc/v3`).
- **Transport**: Encrypted HTTPS with Basic Auth (`Consumer Key:Consumer Secret`).
- **Endpoints Utilized**:
  - `GET /wp-json/wc/v3/system_status` (Connection health check)
  - `POST /wp-json/wc/v3/products` (Product creation)
  - `PUT /wp-json/wc/v3/products/{id}` (Idempotent product update)
  - `DELETE /wp-json/wc/v3/products/{id}?force=true` (Product removal)
  - `POST /wp-json/wc/v3/products/{id}/variations` (Variation creation)
  - `PUT /wp-json/wc/v3/products/{id}/variations/{var_id}` (Variation update)

---

## 3. Data Mapping Matrix

| Orivanta PIM Field | WooCommerce v3 REST Field | Transformation Rule |
| :--- | :--- | :--- |
| `product.name` | `name` | Direct string mapping. |
| `product.sku` | `sku` | Unique workspace identifier. |
| `product.productType` | `type` | `'simple'` or `'variable'`. |
| `product.status` | `status` | `'published'` -> `'publish'`, `'draft'` -> `'draft'`, `'archived'` -> `'private'`. |
| `product.price` | `regular_price` | Floating point formatted to two decimals (e.g. `'1499.00'`). |
| `product.stockQuantity` | `stock_quantity`, `manage_stock` | Integer mapped; `manage_stock: true` if stock count provided. |
| `product.shortDescription` | `short_description` | Summary text. |
| `product.description` | `description` | Full HTML/formatted description. |
| `product.images` | `images` | Array of `{ src: url, alt: altText }`. |
| `product.attributes` | `attributes` | Transformed into `{ name, visible: true, variation: bool, options: [] }`. |
| `product.categoryIds` | `categories` | Resolved via `categories.woo_category_id` into `{ id: wooCatId }`. |
| `variant.attributeCombination`| `attributes` | Array of `{ name, option }` matching parent variation attributes. |

---

## 4. Idempotency Guarantees
1. **Pre-Sync Intent**: The backend records a `sync_jobs` record before initiating network transport.
2. **ID Preservation**: Once WooCommerce assigns an external ID (`woo_product_id`), all subsequent synchronisations execute `PUT /products/{woo_id}`. A new product is never created if an external ID already exists.
3. **Safe Retries**: Failed jobs store the error diagnostic message without corrupting existing external mappings. Retrying a job increments `attempt_count` and updates the existing entity.
