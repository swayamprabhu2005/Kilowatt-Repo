# ADR 0001: Use React and Express in a Monorepo

## Status
Accepted

## Date
2026-10-13

## Context and Problem
Orivanta PIM requires a robust, responsive web interface for managing complex product hierarchies, dynamic attributes, media, and synchronisation workflows, coupled with a secure backend API that owns external integrations, database queries, and AI agent execution. We need an architecture that promotes high developer velocity, clear separation of concerns, and full type safety across boundaries without operational complexity.

## Decision
We adopt a full-stack TypeScript monorepo using:
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, and TanStack Query.
- **Backend**: Node.js, Express, Zod for validation, and Drizzle ORM.
- **Workspaces**: npm workspaces to coordinate `frontend` and `backend` under a unified root repository.

The backend strictly owns all database access, tenant authorization, external WooCommerce API communication, and Gemini AI agent calls. The frontend communicates exclusively via authenticated REST API endpoints.

## Options Considered
1. **Next.js Full-Stack App Router**: High complexity with SQLite file locking in serverless/SSR environments; mixing client components with background sync workers causes subtle concurrency issues.
2. **React + Express Monorepo (Chosen)**: Clean architectural boundary, decoupled deployment, long-lived Node.js process ideal for SQLite connection pools and in-process background sync workers.
3. **Single Express App Serving Static HTML/Templates**: Poor user experience for interactive attribute builders, multi-variant matrices, and real-time AI tool-calling traces.

## Rationale and Trade-offs
A decoupled Vite/React client and Express API offers clear delineation of responsibilities:
- Frontend bundles contain zero secrets (no database credentials, WooCommerce API keys, or Gemini keys).
- Express provides familiar middleware primitives for authentication, CORS, security headers, and request-scoped tenant isolation.
- Vite provides instant HMR and lightweight static production builds.

## Positive Consequences
- End-to-end TypeScript types shared or aligned via schema definitions.
- Clean API contract that can support mobile apps or headless consumers in the future.
- Predictable execution environment for SQLite and async job processing.

## Negative Consequences and Risks
- Requires coordinating two dev servers (handled cleanly via root npm scripts and Vite dev proxy).

## Security and Operational Implications
- Frontend never communicates directly with WooCommerce or Gemini; all external tokens remain secure on the backend server.
- Express employs `helmet`, strict CORS, and session cookie validation.

## References
- [Michael Nygard ADR Template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
