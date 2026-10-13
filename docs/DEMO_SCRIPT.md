# Hackathon Evaluation Demo Script — Orivanta PIM

Follow this step-by-step walkthrough to demonstrate all core capabilities of **Orivanta PIM** during hackathon judging or technical evaluation.

---

## Part 1: Quickstart & Authentication (30 seconds)
1. Run `run.bat` in Windows or execute `npm run dev`.
2. Open `http://localhost:3000` in the browser.
3. On the login screen, click the prefilled credentials or enter:
   - **Email**: `demo@orivanta.local`
   - **Password**: `OrivantaDemo2026!`
4. Click **Sign In**. Observe the warm editorial dashboard, real metrics, and zero blue/green theme.

---

## Part 2: Product Catalogue & Dynamic Attributes (2 minutes)
1. Navigate to **Attributes** in the sidebar.
2. Click **New Attribute**:
   - **Name**: `Battery Capacity (mAh)`
   - **Code**: `battery_mah`
   - **Type**: `Number`
   - **Flags**: Check *Mandatory for Catalogue Publishing*.
   - Click **Save Attribute**.
3. Navigate to **Products** and click **New Product**:
   - **Name**: `Rugged Expedition Smartwatch`
   - **SKU**: `WAT-EXP-45`
   - **Price**: `$299.00`
   - Open the **Dynamic Attributes** tab. Observe that `Battery Capacity (mAh)` and other workspace attributes render automatically as typed form controls.
   - Enter `battery_mah`: `500`.
   - Click **Save Product**.

---

## Part 3: WooCommerce Mock Sync & Failure Recovery (2 minutes)
1. Open the created product and click **Sync to Store**.
2. Notice the instant toast notification: `Product synchronized successfully`.
3. Switch to **Sync Center** in the sidebar:
   - Observe the newly recorded job with status `synced` and external WooCommerce ID (e.g. `#2001`).
4. Navigate to **WooCommerce** in the sidebar:
   - Click **Simulate Next Sync Failure (Demo)**.
5. Return to **Sync Center** and sync `Artisan Ceramic Pour-Over Dripper`:
   - Observe that the job state transitions to `failed` with a clear diagnostic error message.
6. Click **Retry** on the failed job:
   - Observe that the retry succeeds, updates timestamps, and assigns an external ID without creating duplicate entities.

---

## Part 4: Gemini Agentic AI Assistant (3 minutes)
1. Navigate to **AI Assistant** in the sidebar.
2. **Workflow 1 — Product Completeness Audit**:
   - Select `AeroLight Carbon Trekking Backpack` (a seeded product with missing specs).
   - Click **Execute Agentic Reasoning**.
   - Review the prioritised audit checklist and click **Inspect Tool Execution Traces** to view the real server-side tool calls (`get_product`, `get_attribute_definitions`, `validate_product`).
3. **Workflow 2 — AI-Assisted Enrichment**:
   - Switch to the **AI Enrichment** tab.
   - Enter operator notes: `Ultralight 40L technical pack with Dyneema composite fabric, waterproof zippers, and ergonomic load-lifters.`
   - Click **Execute Agentic Reasoning**.
   - Review the proposed field diff table.
   - Click **Apply Selected Changes (Commit)** to demonstrate the human approval boundary!
4. **Workflow 4 — Natural Language Catalogue Query**:
   - Switch to **Catalogue Query** tab.
   - Submit: `Which products are in draft status?`
   - Verify that the agent uses `search_products` to answer with real database records.

---

## Part 5: Tenant Isolation Verification (1 minute)
1. Open an incognito browser window and log in as Tenant B:
   - **Email**: `other@tenant2.local`
   - **Password**: `OrivantaDemo2026!`
2. Notice that Tenant B sees only their isolated workspace (`Isolated Workspace B`) and zero products from Demo Workspace A.
