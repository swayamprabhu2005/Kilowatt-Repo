# Agentic AI Assistant Demonstration Walkthrough — Orivanta PIM

This document outlines the architecture, tool registry, safety boundaries, and step-by-step reproducible walkthrough for evaluating the **Gemini-Powered Agentic AI Assistant** in Orivanta PIM.

---

## 1. Agent Architecture & Execution Model

The AI assistant is implemented as a **server-controlled bounded tool execution loop**:
1. Interprets user product-management goals.
2. Formulates reasoning plans and queries server-registered tools.
3. Validates tool arguments with Zod schemas before database queries.
4. Collects results and repeats reasoning until goal is satisfied or `AI_MAX_TOOL_STEPS=6` is reached.
5. Emits structured synthesis containing summaries, checklists, diffs, and tool traces.

### 1.1 Registered Tools
| Tool Name | Parameters | Purpose |
| :--- | :--- | :--- |
| `get_product` | `productId: string` | Fetches full product data within the tenant scope. |
| `search_products` | `query?, status?, limit` | Scoped keyword search with pagination. |
| `get_attribute_definitions` | `productType?` | Retrieves dynamic attribute rules and allowed options. |
| `get_categories` | (None) | Lists product taxonomy and WooCommerce mappings. |
| `validate_product` | `productId: string` | Executes backend completeness and sync-readiness checks. |
| `get_product_variants` | `productId: string` | Retrieves child variant permutations. |
| `get_sync_history` | `productId?, limit` | Fetches recent sync jobs and error diagnostics. |
| `compare_product_changes` | `productId, proposedPatch` | Computes field-level before/after diffs in-memory. |

### 1.2 Safety & Human Approval Boundaries
- **Advisory Default**: The tool registry contains **zero mutation tools**. The agent cannot autonomously write to SQLite, delete items, or publish to WooCommerce.
- **Diff Preview**: Proposed enrichments are presented as diffs with field-level checkable approvals.
- **Explicit Human Commit**: Changes are committed only when an authenticated operator clicks **Apply Selected Changes**.

---

## 2. Reproducible Walkthrough

### Step 1: Open Incomplete Seed Product
1. Log in as `demo@orivanta.local` (`OrivantaDemo2026!`).
2. Navigate to **AI Assistant** in the sidebar.
3. Select `AeroLight Carbon Trekking Backpack` (`prod_aerolight_pack`).

### Step 2: Run Completeness Audit
1. Choose **Completeness Audit** and click **Execute Agentic Reasoning**.
2. Observe findings:
   - Identifies short description (&lt; 20 characters).
   - Identifies missing media assets.
   - Highlights that product is blocked from sync.
3. Click **Inspect Tool Execution Traces** to verify the real tool invocations:
   - `get_product({"productId": "prod_aerolight_pack"})`
   - `get_attribute_definitions({})`
   - `validate_product({"productId": "prod_aerolight_pack"})`

### Step 3: Run AI-Assisted Enrichment
1. Select **AI Enrichment** tab.
2. Enter operator notes:
   `Dyneema composite 40L ultralight pack with taped waterproof seams, ergonomic hip belt, and dual ice axe loops.`
3. Click **Execute Agentic Reasoning**.
4. Observe the field-level diff preview comparing before and proposed after states for:
   - `name`
   - `shortDescription`
   - `description`
5. Uncheck any field you wish to discard.
6. Click **Apply Selected Changes (Commit)**.
7. Verify in the **Products** editor that the product was updated through the authenticated application endpoint.

### Step 4: Run Channel Diagnosis
1. Select **Sync Diagnosis** tab with `prod_aerolight_pack`.
2. Click **Execute Agentic Reasoning**.
3. Verify that the agent inspects the previous failed sync job (`job_004`), explains the validation error in human terms, and recommends remediation steps without retrying autonomously.

### Step 5: Test Without Gemini API Key
1. In `.env`, ensure `AI_ENABLED=false` or leave `GEMINI_API_KEY=` blank.
2. Run the assistant.
3. Observe that all 4 workflows function smoothly using the offline `MockGeminiProvider`, demonstrating true agentic evaluation readiness with zero required credentials.
