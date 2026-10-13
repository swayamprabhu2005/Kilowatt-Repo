# ADR 0002: Use SQLite for Local Persistence

## Status
Accepted

## Date
2026-10-13

## Context and Problem
The project has a strict ₹0 budget constraint and must run locally without requiring Docker, hosted cloud database accounts (such as Supabase, Neon, or PlanetScale), or cloud credentials. The database must persist all catalogue entities, dynamic attributes, variants, sync history, and user sessions reliably across server restarts.

## Decision
We select **SQLite** via `better-sqlite3` and **Drizzle ORM** as the sole application database.
- Database file is stored at `./data/orivanta.sqlite`.
- We explicitly enable Write-Ahead Logging (`PRAGMA journal_mode = WAL;`) for high concurrency and performance.
- We explicitly enable foreign key constraints (`PRAGMA foreign_keys = ON;`) on every connection.
- Schema migrations and repeatable seeds are versioned and managed via code (`backend/src/db/migrate.ts` and `seed.ts`).
- Database files and sidecar journals (`*.sqlite`, `*-wal`, `*-shm`) are excluded from Git.

## Options Considered
1. **In-Memory SQLite (`:memory:`)**: Fast for transient unit tests, but fails the persistence requirement because all data disappears on server restart.
2. **Hosted PostgreSQL / MySQL**: Violates the ₹0 offline-first, zero-external-account constraint; introduces latency, network failure modes, and credential burdens.
3. **Lowdb / Raw JSON files**: Lacks relational integrity, index-backed search, ACID transaction guarantees, and standard SQL querying.
4. **SQLite with `better-sqlite3` and Drizzle ORM (Chosen)**: Fast synchronous C++ SQLite binding, zero network latency, rock-solid ACID transactions, full Drizzle type-safety, and zero external infrastructure.

## Rationale and Trade-offs
SQLite provides full relational SQL, indexes, and transactions in a single local file. WAL mode enables concurrent readers while a write transaction is executing. The trade-off is that SQLite lacks native database-level Row Level Security (RLS) and is intended for single-instance or embedded deployments. Application-layer tenant isolation addresses this limitation (see [ADR 0005](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0005-enforce-tenant-isolation-in-the-application-layer.md)).

## Positive Consequences
- Zero external accounts, zero cost, instant setup on any developer machine.
- 100% offline development and evaluation readiness.
- Database backup is as simple as copying the `.sqlite` file (with WAL checkpointing).

## Negative Consequences and Risks
- Not suited for horizontally scaled multi-server deployments without distributed consensus (e.g. LiteFS). For this single-instance B2B PIM platform, this is an intentional, documented design trade-off.

## Security Implications
- The SQLite file must be kept in a protected data directory with restricted filesystem permissions and never placed in a public web root.

## Related ADRs
- [ADR 0005: Enforce Tenant Isolation in the Application Layer](file:///d:/MyFiles/Kilowatt-Repo/docs/adr/0005-enforce-tenant-isolation-in-the-application-layer.md)
