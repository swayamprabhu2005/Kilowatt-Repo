# Orivanta PIM — Video Presentation Scripts

This document contains word-for-word spoken scripts for both hackathon submission videos. Each script is tailored for a natural, confident speaking pace (130–140 words per minute) to land precisely within the **1.5 to 2-minute mark** (combined total under 4 minutes).

**Submission Video Drive Link:** [https://drive.google.com/drive/folders/1e5OQ_1K1PopnYWMXpCh0hcZe_ZailKoH](https://drive.google.com/drive/folders/1e5OQ_1K1PopnYWMXpCh0hcZe_ZailKoH)

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
**Target Duration:** ~1:55 to 2:00 (approx. 265 words)  
**Tone:** Results-driven, energetic, technically articulate, conversational  
**Format:** Direct-to-camera presentation (talking head / personal video of yourself, NO screen recording required)  
**Focus:** What was built during the hackathon, how the solution works, key results/benefits, challenges faced with local WordPress, and overall impact  

---

### [0:00 – 0:25] Opening: What We Built During the Hackathon
*(Direct eye contact with camera, warm welcoming smile, confident posture)*

> "Welcome back. In this video, I want to walk you through what we were able to build and achieve during this hackathon with **Orivanta PIM**.
> 
> From a clean slate, we engineered a complete, production-ready Product Information Management platform: a responsive, beautifully styled web interface with tactile micro-animations, multi-tenant workspace isolation, a dynamic attribute and variant engine, and live, bi-directional integration with WooCommerce."

---

### [0:25 – 0:55] How the Solution Works in Practice
*(Conversational, using natural hand gestures to explain the flow)*

> "To understand how the solution operates: A merchant begins by defining dynamic, typed attributes—such as materials, dimensions, or switch types. When creating a variable product, Orivanta automatically computes the entire variant matrix, generating unique SKUs, pricing overrides, and inventory levels.
> 
> Before publishing, our integrated **Google Gemini 2.5 Flash agent** conducts a bounded completeness audit, flagging missing descriptions or SEO gaps. Once validated, our idempotent synchronisation engine pushes the catalogue directly to the WooCommerce REST API v3 and permanently maps the returned IDs in our local database."

---

### [0:55 – 1:30] Engineering Challenges Faced with Local WordPress
*(Thoughtful, authentic engineering breakdown, leaning slightly in)*

> "Building this live during the hackathon under a strict ₹0 budget presented very real challenges:
> 
> - First, integrating with a local WordPress instance over self-signed SSL triggered strict TLS rejection. We resolved this by engineering custom local certificate handling and secure authentication handshakes in Node.js.
> - Second, WordPress's media sideloading frequently rejected remote image URLs without file extensions. We built a resilient fallback pipeline ensuring product hierarchies, variations, and pricing sync with 100% reliability even if external asset endpoints fail.
> - Third, because SQLite lacks native database-level multi-tenancy, we enforced rigorous application-layer tenant isolation across every single repository query."

---

### [1:30 – 1:55] Key Results, Benefits, and Overall Impact
*(Confident, high-energy closing statement into camera)*

> "Despite these hurdles, the project achieved its core mission and delivered tangible results:
> 
> We have **16 automated test suites** passing with a 100% success rate, a live WooCommerce store populated with real multi-variant products, and zero cloud hosting overhead.
> 
> Orivanta PIM proves that with smart architecture, local SQLite persistence, and bounded AI assistance, independent merchants can operate an enterprise-grade product information engine completely offline, eliminating expensive SaaS lock-in. 
> 
> Thank you!"

---

## Direct-to-Camera Presentation Tips

- **Eye Line**: Look directly at the camera lens (not at your preview screen or monitor) so the evaluators feel immediate personal engagement.
- **Body Language**: Keep your shoulders open, sit or stand tall, and use natural hand gestures when explaining the 3-step workflow and the 3 challenges.
- **Pacing**: Speak deliberately at ~130–135 words per minute. Take a micro-pause (1 breath) between each challenge and result bullet so key achievements register clearly.
- **Lighting**: Face a window or soft desk lamp to ensure your face is evenly lit with clear audio.

