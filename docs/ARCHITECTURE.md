# System Architecture — Orivanta PIM

## 1. High-Level Architecture Overview

Orivanta PIM follows a decoupled, layered full-stack TypeScript architecture with zero external database dependencies.

```mermaid
graph TB
    subgraph Client ["Frontend (React 18 + Vite)"]
        UI[UI Shell & Pages]
        Query[TanStack Query Cache]
        Form[React Hook Form + Zod]
    end

    subgraph Server ["Backend (Node.js + Express)"]
        Router[Express Router]
        Middleware[Auth & Tenant Middleware]
        Modules[PIM Domain Services]
        SyncEngine[Sync Queue & State Machine]
        AIAgent[Gemini Agent Loop & Tool Registry]
    end

    subgraph Data ["Persistence Layer (SQLite)"]
        DB[(orivanta.sqlite)]
        WAL[WAL Journal]
    end

    subgraph External ["External Channels"]
        MockAdapter[Deterministic Mock Adapter]
        LiveWoo[WooCommerce REST API v3]
        GeminiAPI[Google Gemini API]
    end

    UI --> Query
    Query --> Router
    Router --> Middleware
    Middleware --> Modules
    Modules --> DB
    Modules --> SyncEngine
    Modules --> AIAgent

    SyncEngine --> MockAdapter
    SyncEngine --> LiveWoo
    AIAgent --> GeminiAPI
```

---

## 2. Component Layers

### 2.1 Presentation Layer (Frontend)
- **Framework**: React 18, TypeScript, Vite.
- **Routing**: React Router DOM with protected route guards.
- **State Management**: TanStack Query for remote state caching, optimistic updates, and background sync job polling.
- **Styling**: Tailwind CSS with custom **Terracotta & Warm Ivory** tokens.
- **Design Engineering**: Emil Kowalski principles — active press scale(0.97), entering scale(0.95)+opacity, custom ease-out transitions (`cubic-bezier(0.23, 1, 0.32, 1)`), origin-aware popovers, and no animations on keyboard-heavy actions.

### 2.2 API & Application Layer (Backend)
- **Framework**: Express on Node.js 22.
- **Security Middleware**: `helmet`, `cookie-parser`, strict CORS, secret masking in logs, request ID generation.
- **Tenant Context**: `tenant.ts` middleware verifies session validity and workspace membership, creating an immutable `req.workspaceCtx`.
- **Validation**: Strict Zod schemas on all incoming request bodies and query parameters.

### 2.3 Domain Services & Repositories
- **Context-Enforced Repositories**: Every database query injects `and(eq(table.workspaceId, ctx.workspaceId), ...)`.
- **Product Service**: Enforces SKU uniqueness, category validation, and dynamic attribute schema conformance.
- **Sync Engine**: Manages asynchronous sync jobs, state transitions (`not_synced` -> `pending` -> `syncing` -> `synced` / `failed`), and idempotent retry loops.

### 2.4 WooCommerce Integration Layer
- **Adapter Interface**: Defined by `WooAdapterInterface`.
- **Mock Adapter**: Emulates WooCommerce REST v3 endpoints with deterministic in-memory/SQLite state for offline demonstrations.
- **Live Client**: Connects via HTTPS to WooCommerce REST v3 with request timeouts, HTTP error translation, and secret redaction.
- **Bidirectional Mapper**: Maps between PIM product representations and WooCommerce product/variation payloads.

### 2.5 Gemini Agentic AI Service
- **SDK**: Official `@google/genai` client.
- **Bounded Tool Loop**: Server-side loop calling up to `AI_MAX_TOOL_STEPS=6` registered tools.
- **Safety Boundary**: Zero mutation tools in the registry. Output produces structured diffs and audits. Committing changes requires an independent, authenticated human request in the UI.
- **Mock Provider**: `MockGeminiProvider` executes full agent loops offline for automated Vitest suites and zero-key local runs.

---

## 3. Data Flow Diagrams

### 3.1 Product Synchronization Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Merchant / Admin
    participant Frontend as React Client
    participant API as Express Sync Service
    participant DB as SQLite Database
    participant Woo as WooCommerce Adapter

    Admin->>Frontend: Clicks "Sync to WooCommerce"
    Frontend->>API: POST /api/sync/products/:id
    API->>DB: Validate product completeness & mandatory attributes
    alt Validation Fails
        API-->>Frontend: 422 Unprocessable Entity (missing attributes)
    else Validation Passes
        API->>DB: Insert sync_jobs record (status: 'pending')
        API->>DB: Update product sync_status = 'syncing'
        API-->>Frontend: 202 Accepted (jobId)
        API->>Woo: Check if woo_product_id exists
        alt woo_product_id is null (New Product)
            Woo->>Woo: POST /wp-json/wc/v3/products
        else woo_product_id exists (Existing Product)
            Woo->>Woo: PUT /wp-json/wc/v3/products/:woo_id
        end
        Woo-->>API: 200/201 Success (woo_id)
        API->>DB: Update sync_jobs (status: 'synced', woo_id)
        API->>DB: Update products (sync_status: 'synced', last_sync_at)
        Frontend->>API: Poll GET /api/sync/jobs/:jobId
        API-->>Frontend: 200 OK (status: 'synced')
    end
```

### 3.2 Gemini Agentic Completeness Audit Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Merchant / Admin
    participant UI as AI Assistant Panel
    participant Agent as Agent Execution Loop
    participant Gemini as Google Gemini 2.5 Flash
    participant Tools as Registered Tool Registry
    participant DB as SQLite Database

    Admin->>UI: Request "Audit Product Completeness"
    UI->>Agent: POST /api/ai/agent/run (task: 'audit', productId)
    Agent->>Gemini: User goal + System Instructions + Tool Definitions
    Gemini-->>Agent: Function Call: get_product(productId)
    Agent->>Tools: Validate arguments with Zod
    Tools->>DB: Query product by ID & workspace
    DB-->>Tools: Product record
    Tools-->>Agent: Product JSON (sanitized)
    Agent->>Gemini: Function Result: get_product output
    Gemini-->>Agent: Function Call: get_attribute_definitions(productType)
    Agent->>Tools: Execute get_attribute_definitions
    Tools->>DB: Query attribute definitions for workspace
    DB-->>Tools: Attribute definitions
    Tools-->>Agent: Definitions JSON
    Agent->>Gemini: Function Result: get_attribute_definitions output
    Gemini-->>Agent: Structured Synthesis (Audit Checklist & Findings)
    Agent->>DB: Persist ai_agent_runs record with tool traces
    Agent-->>UI: Structured Response (Findings, Tool Execution Trace)
    UI-->>Admin: Renders Audit Checklist & View Trace Modal
```
