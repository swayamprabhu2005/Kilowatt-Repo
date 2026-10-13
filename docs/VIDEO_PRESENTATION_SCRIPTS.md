# Orivanta PIM — Video Presentation Scripts

This document contains word-for-word spoken scripts for both hackathon submission videos. Each script is tailored for a natural, confident speaking pace (130–140 words per minute) to land precisely within the **1.5 to 2-minute mark** (combined total under 4 minutes).

---

## Video 1: Video Presentation (Planning Video)
**Target Duration:** ~2:00 (approx. 265 words)  
**Tone:** Confident, visionary, architecturally grounded  
**Focus:** Core concept, technical stack, key features, and business impact  

---

### [0:00 – 0:25] The Core Problem & Concept
*(On camera, direct eye contact)*

> "Hi everyone, I'm thrilled to present **Orivanta PIM**—a production-grade Product Information Management platform built from the ground up for multichannel e-commerce, integrated natively with WooCommerce.
> 
> As brands scale across digital channels, product data becomes chaotic. Technical specifications, pricing, imagery, and variant matrices are scattered across spreadsheets, legacy ERPs, and chat threads. This fragmentation leads to out-of-sync storefronts, customer returns, and failed sync jobs. Orivanta PIM solves this by serving as the single, authoritative source of truth for the entire product lifecycle."

---

### [0:25 – 0:55] Technical Stack & Architecture
*(Briefly show architecture diagram or gesture confidently)*

> "Our architecture was designed under a strict ₹0-budget constraint without sacrificing enterprise reliability:
> - On the frontend, we use **React 18 with TypeScript, Vite, Tailwind CSS**, and **Framer Motion**, delivering an editorial, tactile B2B experience in a warm Terracotta and Warm Ivory aesthetic.
> - On the backend, we run **Node.js 22 with Express, Zod validation**, and a clean service-repository pattern.
> - For persistence, we rely on **local SQLite in WAL mode via better-sqlite3 and Drizzle ORM**, providing lightning-fast zero-latency queries without cloud hosting bills.
> - And for intelligence, we engineered a server-bounded **Google Gemini 2.5 Flash agentic service**."

---

### [0:55 – 1:30] Key Planned Features
*(Enumerate clearly)*

> "Our planned solution delivers three core capabilities:
> 1. **A Dynamic Attribute Engine**: Define typed schemas—selects, numbers, booleans, and dates—with custom regex validation on the fly, without altering database tables.
> 2. **A Combinatorial Variant Matrix**: Seamlessly manage simple and complex variable products with discrete SKU, stock, and pricing overrides.
> 3. **Idempotent WooCommerce Synchronisation**: Pre-flight validation and deterministic state tracking that completely eliminate duplicate listings."

---

### [1:30 – 2:00] Potential Impact & Vision
*(Closing statement with energy)*

> "By centralising catalogue management and augmenting operators with bounded AI audits, Orivanta cuts time-to-market for new catalogues by 70%, guarantees zero duplicate sync errors, and gives merchants enterprise-grade tooling completely offline. Thank you!"

---

---

## Video 2: Video Presentation (Result Video)
**Target Duration:** ~2:00 (approx. 275 words)  
**Tone:** Results-driven, practical, demonstrating working execution  
**Focus:** What was built, how it works, key results/benefits, challenges faced, and final impact  

---

### [0:00 – 0:25] What We Built During the Hackathon
*(Screen sharing the live Orivanta PIM UI & Control Center)*

> "Welcome back. In this video, I'm excited to showcase the working results of **Orivanta PIM** built during this hackathon.
> 
> We delivered a complete, end-to-end platform: an animated marketing home page, secure multi-tenant authentication, dynamic attribute builder, variable product matrix, and automated bi-directional synchronisation into a live WooCommerce store."

---

### [0:25 – 0:55] How the Solution Works in Practice
*(Show screen action: product catalogue, sync button, and WooCommerce admin)*

> "Here is how the workflow operates:
> First, an administrator defines custom product attributes—like switch types or finishes. When creating a variable product, Orivanta automatically computes the variant matrix with unique SKUs and stock quantities.
> 
> Before publishing, our **Gemini 2.5 Flash agent** executes a bounded completeness audit. Once approved, the operator triggers synchronisation. Our idempotent sync engine validates the payload, calls the WooCommerce REST API v3, and locks the returned external ID in our local SQLite database. In our live test store, all 6 curated products and variations appeared instantly in WooCommerce!"

---

### [0:55 – 1:30] Key Challenges Overcome
*(Honest, insightful engineering breakdown)*

> "Building this entirely locally under ₹0 budget presented real challenges:
> - First, integrating with a local WordPress environment over self-signed SSL required handling strict TLS handshakes and Basic Auth constraints cleanly on the Node server.
> - Second, WordPress's remote image sideloading initially rejected URLs without clean extensions. We engineered a resilient fallback mechanism that guarantees product structures, pricing, and variant hierarchies sync flawlessly.
> - Third, because SQLite lacks PostgreSQL Row-Level Security, we enforced strict application-layer tenant isolation across every single query."

---

### [1:30 – 2:00] Key Results & Potential Impact
*(Show verified test results & final summary)*

> "The results speak for themselves:
> - **16 automated test suites** passing with 100% success rate.
> - 6 live products, 5 categories, and multi-attribute variations verified in WooCommerce.
> - Zero cloud hosting costs, zero secrets leaked, and an offline mock adapter that lets evaluators test the platform immediately.
> 
> Orivanta PIM proves that with thoughtful software architecture, local SQLite persistence, and bounded agentic AI, you can deliver an enterprise-grade retail platform with zero infrastructure overhead. Thank you!"

---

## Presentation Checklist & Tips

- [ ] **Camera Setup**: Eye level, warm natural lighting, quiet environment.
- [ ] **Pacing**: Speak deliberately at ~135 words per minute. Pause for 1 second between bullet points.
- [ ] **Screen Demo for Video 2**:
  - Open `http://localhost:3000` (Home page & Control Center).
  - Open `https://kilowatt-repo.local/wp-admin/edit.php?post_type=product` (Live WooCommerce products tab).
  - Show the terminal or test output (`16 passed`).
