# Video Presentation Scripts — Orivanta PIM

This document contains two complete, production-ready video presentation scripts designed for hackathon evaluation, investor pitching, and technical demonstrations.

---

# VIDEO 1: EXECUTIVE PITCH & PRODUCT OVERVIEW
- **Duration**: Exactly 2:00 minutes (120 seconds)
- **Format**: Direct-to-camera, energetic, clear, professional tone
- **Visuals**: Split between camera presenter and B-roll/screen recordings of Orivanta PIM UI
- **Goal**: Clearly explain the core concept, technology stack, features, and real-world commercial impact.

---

### [0:00 – 0:25] The Problem & Core Concept

**[Visual: Speaker directly to camera. Confident, crisp delivery. Lower third title: *[Your Name] — Creator of Orivanta PIM*]**

> "If you’ve ever managed an e-commerce business, you know the nightmare: messy spreadsheets, inconsistent attributes across supplier files, accidental publishing of incomplete drafts, and dreaded synchronization failures with your online storefront.
>
> That is why we built **Orivanta PIM** — a production-grade, zero-cost Product Information Management platform designed from the ground up to unify your entire product catalogue, validate dynamic specifications, and reliably synchronize with WooCommerce."

---

### [0:25 – 0:50] The Technical Stack & Architecture

**[Visual: Cut to screen demo showing the warm terracotta UI, fluid navigation, and system architecture overlay]**

> "Under the hood, Orivanta PIM is engineered for zero-latency performance and complete operational self-sufficiency:
> - On the frontend, we use **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Framer Motion**, built strictly according to **Emil Kowalski’s design-engineering principles** — featuring sub-250ms responsive micro-interactions, fluid animated page transitions, and an elegant warm terracotta editorial theme.
> - On the backend, we run **Node.js** and **Express** with **SQLite in WAL mode** via **Drizzle ORM**. That means full local file persistence, zero database hosting bills, and strict application-layer multi-tenant isolation."

---

### [0:50 – 1:30] Flagship Features & Gemini Agentic AI

**[Visual: Screen recording showing dynamic attribute builder, variant matrix generator, and live Gemini Agent panel]**

> "Orivanta PIM delivers three critical capabilities:
> 1. **Dynamic Attribute Engine**: Type-safe definitions — text, numbers, dropdowns, and multi-selects — validated on the fly against product schemas.
> 2. **Variant Matrix Management**: Automated SKU permutation generation with zero collision risk.
> 3. **Gemini-Powered Agentic AI**: Integrated with Google’s Gemini 2.5 Flash model, our assistant runs a bounded server-side tool loop. It audits catalogue completeness, translates raw supplier notes into enriched descriptions, and diagnoses channel errors.
>
> Crucially, we enforce a strict **Human Approval Boundary**: the AI reasons and proposes field-level diffs, but never executes unapproved writes to your store."

---

### [1:30 – 2:00] Potential Impact & Closing

**[Visual: Screen recording showing one-click WooCommerce synchronization transitioning to 'Synced', then speaker to camera]**

> "Whether you're testing offline with our built-in deterministic mock adapter or connecting live WooCommerce credentials, Orivanta PIM guarantees idempotent synchronization and error recovery.
>
> The impact? We eliminate costly catalogue errors, cut product publishing time from hours to minutes, and remove the barrier of expensive enterprise PIM subscriptions for mid-market merchants.
>
> Orivanta PIM turns catalogue chaos into seamless commerce. Thank you!"

---

---

# VIDEO 2: HACKATHON BUILD JOURNEY, ARCHITECTURE & OVERCOMING CHALLENGES
- **Duration**: 3:30 – 4:30 minutes
- **Format**: Technical retrospective, engineering walkthrough, authentic hackathon storytelling
- **Goal**: Detail how the solution was built, the architectural solutions devised, key test results, challenges faced with local WordPress, and how we persevered to deliver a bulletproof platform.

---

### [0:00 – 0:45] The Hackathon Mission & Day Zero Strategy

**[Visual: Speaker introducing the sprint, showing the GitHub repository, clean commit history, and project structure]**

> "Welcome! In this video, I want to take you behind the scenes of how we engineered Orivanta PIM during the hackathon.
>
> Our challenge was clear: build a robust Product Information Management platform integrated with WooCommerce, backed by AI, with a strict budget of zero rupees and zero tolerance for fragile prototypes.
>
> From hour one, we made a strategic architectural decision: rather than assembling a throwaway prototype, we committed to production-grade engineering — end-to-end TypeScript, an idempotent database migration system, 16 automated test suites, and strict tenant isolation."

---

### [0:45 – 1:35] How the Solution Works: Three Core Engineering Pillars

**[Visual: Screen capture demonstrating the application workflow from creation to sync]**

> "We structured the entire platform around three pillars:
>
> **First, the Hybrid Attribute Architecture**: In relational databases, dynamic attributes often cause table bloat or clumsy EAV query nightmares. We devised a hybrid approach: attribute definitions and constraints are strictly modeled in relational SQLite tables, while individual product values are validated via dynamic Zod schemas and stored in a structured JSON column.
>
> **Second, Idempotent State Machine Sync**: Syncing e-commerce catalogues is prone to network dropouts and duplicates. Our sync service tracks every push through a SQLite-backed job queue with distinct states: `not_synced`, `pending`, `syncing`, `synced`, and `failed`. We store bidirectional external IDs so updates never duplicate live products.
>
> **Third, Bounded Agentic AI**: We integrated the `@google/genai` SDK with Gemini 2.5 Flash. Rather than a generic chatbot, our agent runs a bounded tool execution loop with full trace visibility, enabling completeness audits and supplier note enrichment with side-by-side diff previews."

---

### [1:35 – 2:45] The Major Engineering Challenge: Local WordPress & WooCommerce

**[Visual: Diagram showing the Adapter Pattern and Mock vs. Real WooCommerce flows]**

> "Now, let’s talk about our biggest technical hurdle: **Local WordPress and WooCommerce Integration**.
>
> Anyone who has developed with WordPress knows the pain:
> - Running WordPress locally demands heavy background stacks — PHP runtimes, MySQL daemons, web servers like Apache or Nginx.
> - WooCommerce REST API strictly requires pretty permalinks (`/wp-json/wc/v3`), which easily break on default local server configurations.
> - Evaluators and judges reviewing our repository might not have WordPress installed, or might face local self-signed SSL certificate issues and network timeouts.
>
> If we relied solely on a live external server or mandated a local PHP install, judges could be blocked from experiencing the core PIM workflows.
>
> **How We Solved It**:
> We engineered an elegant **Adapter Pattern**:
> 1. We built a high-fidelity **WooCommerce Mock Adapter** that implements the exact official WooCommerce REST API v3 HTTP contract entirely in-memory and SQLite. It assigns deterministic external IDs, tracks latency, handles category mapping, and even features a simulated failure toggle to prove retry mechanisms.
> 2. Alongside it, we built the official **Live WooCommerce Client** with HTTPS enforcement, request timeouts, and secret masking.
>
> By simply toggling `INTEGRATION_MODE` between `mock` and `woocommerce`, the system switches seamlessly. This allowed us to build 16 automated integration tests that run in milliseconds without external dependencies, while guaranteeing that any user can clone the repo, run `run.bat`, and test the complete end-to-end sync workflow immediately."

---

### [2:45 – 3:30] Key Results, Benefits, and Long-Term Impact

**[Visual: Terminal showing 16/16 tests passing, Vite building under 2 seconds, and the live application interface]**

> "Here are our key hackathon milestones:
> - **16/16 Automated Tests Passing** across authentication, cross-tenant isolation, SKU constraints, mock sync, failure recovery, and AI tool bounding.
> - **Zero External Cost**: Runs entirely on a local SQLite file in WAL mode — no cloud database bills, no recurring API fees.
> - **Instant Evaluation**: With our Windows `run.bat` launcher, dependencies, migrations, and servers start up in a single command.
> - **Sub-250ms UI Polish**: A custom warm terracotta editorial interface built on Emil Kowalski’s design-engineering principles.
>
> In summary, Orivanta PIM proves that enterprise-grade e-commerce tooling doesn't require complex infrastructure or huge budgets. It provides merchants with total data ownership, safe AI assistance, and rock-solid store synchronization.
>
> Thank you for watching our hackathon journey!"

---

### Speaker Delivery Tips & Checklist

1. **Pacing**: Speak at approximately 130–140 words per minute. Leave micro-pauses after key technical terms (*"idempotent state machine"*, *"bounded agentic loop"*).
2. **Body Language**: Lean slightly toward the camera when explaining the problem (creates empathy); sit upright and open hands when presenting the architecture.
3. **Lighting & Audio**: Ensure front-facing warm lighting to complement the terracotta interface theme; record in a quiet room with minimal reverb.
4. **B-Roll Timings**: Record screen interactions in advance (e.g. creating a product, editing an attribute, launching the AI audit, triggering the sync) so you can overlay them smoothly during post-production.
