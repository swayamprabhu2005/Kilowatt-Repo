# Local Development & Operations Guide — Orivanta PIM

## 1. Prerequisites
- **Node.js**: v20+ (Node v22.18+ recommended)
- **npm**: v10+
- **Git**: v2.40+
- **OS**: Windows, macOS, or Linux. (Zero PHP, zero Docker, zero external database account required).

---

## 2. Quickstart Setup (Under 2 Minutes)

### 2.1 Clone and Environment Setup
```bash
git clone <repo-url>
cd Kilowatt-Repo

# Copy environment template to .env (if not already created)
cp .env.example .env
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Initialize SQLite Database
```bash
# Execute DDL migrations
npm run db:migrate

# Seed with realistic multi-tenant catalogue, attributes, variants, and sync logs
npm run db:seed
```

### 2.4 Run Development Servers
Using Windows batch launcher:
```cmd
run.bat
```
Or directly via npm:
```bash
# In terminal 1: Start Backend API (Port 5000)
npm run dev --workspace=backend

# In terminal 2: Start Frontend UI (Port 3000)
npm run dev --workspace=frontend
```

---

## 3. Demo Login Credentials

The local seed script initializes two isolated test workspaces:

| Email | Password | Workspace | Role | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `demo@orivanta.local` | `OrivantaDemo2026!` | `ws_default` (Orivanta Demo Workspace) | Owner | Primary demo account |
| `other@tenant2.local` | `OrivantaDemo2026!` | `ws_isolated` (Isolated Workspace B) | Owner | Used for verifying tenant isolation |

---

## 4. Useful NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts backend and frontend development servers concurrently. |
| `npm run build` | Compiles backend TypeScript and builds optimized frontend Vite bundle. |
| `npm test` | Runs the full Vitest automated test suite (16 tests across auth, catalogue, sync, AI). |
| `npm run db:migrate` | Runs idempotent SQLite table and index creation migrations. |
| `npm run db:seed` | Populates SQLite database with reproducible demo catalogue records. |
| `npm run db:reset` | Safely resets the local database by re-migrating and re-seeding. |

---

## 5. SQLite Persistence & Backup Guidelines
- **Location**: Database file is stored at `./data/orivanta.sqlite`.
- **Sidecar Files**: SQLite runs in WAL mode (`orivanta.sqlite-wal`, `orivanta.sqlite-shm`), which are automatically managed.
- **Git Safety**: All `data/*.sqlite*` files are strictly excluded from source control via `.gitignore`.
- **Manual Backup**: To back up the local database, stop the server and copy `data/orivanta.sqlite` to a safe location.
- **Safe Reset**: If test data becomes dirty, run `npm run db:reset`.
