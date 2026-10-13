import { sqlite } from './index.js';

export function runMigrations() {
  console.log('[Migration] Starting SQLite database migration...');

  sqlite.exec(`
    PRAGMA foreign_keys = ON;

    -- WORKSPACES
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- USERS
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- WORKSPACE MEMBERS
    CREATE TABLE IF NOT EXISTS workspace_members (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'editor',
      created_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_member_unq ON workspace_members(workspace_id, user_id);
    CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);

    -- SESSIONS
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      active_workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    -- CATEGORIES
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      parent_id TEXT,
      woo_category_id INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_categories_workspace ON categories(workspace_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug_unq ON categories(workspace_id, slug);

    -- DYNAMIC ATTRIBUTE DEFINITIONS
    CREATE TABLE IF NOT EXISTS attribute_definitions (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      data_type TEXT NOT NULL,
      is_required INTEGER NOT NULL DEFAULT 0,
      is_filterable INTEGER NOT NULL DEFAULT 1,
      is_variant_param INTEGER NOT NULL DEFAULT 0,
      applicable_product_types TEXT NOT NULL DEFAULT 'simple,variable',
      options_json TEXT NOT NULL DEFAULT '[]',
      validation_rules_json TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_attr_def_workspace ON attribute_definitions(workspace_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_attr_def_code_unq ON attribute_definitions(workspace_id, code);

    -- PRODUCTS
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      sku TEXT NOT NULL,
      product_type TEXT NOT NULL DEFAULT 'simple',
      status TEXT NOT NULL DEFAULT 'draft',
      brand TEXT,
      short_description TEXT,
      description TEXT,
      price REAL,
      stock_quantity INTEGER,
      attributes_json TEXT NOT NULL DEFAULT '{}',
      images_json TEXT NOT NULL DEFAULT '[]',
      woo_product_id INTEGER,
      sync_status TEXT NOT NULL DEFAULT 'not_synced',
      last_sync_at INTEGER,
      sync_error TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_products_workspace ON products(workspace_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku_unq ON products(workspace_id, sku);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(workspace_id, status);
    CREATE INDEX IF NOT EXISTS idx_products_sync_status ON products(workspace_id, sync_status);

    -- PRODUCT CATEGORIES
    CREATE TABLE IF NOT EXISTS product_categories (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_prod_cat_unq ON product_categories(product_id, category_id);
    CREATE INDEX IF NOT EXISTS idx_prod_cat_prod ON product_categories(product_id);
    CREATE INDEX IF NOT EXISTS idx_prod_cat_cat ON product_categories(category_id);

    -- PRODUCT VARIANTS
    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      sku TEXT NOT NULL,
      attribute_combination_json TEXT NOT NULL,
      price_override REAL,
      stock_quantity INTEGER,
      is_active INTEGER NOT NULL DEFAULT 1,
      woo_variation_id INTEGER,
      sync_status TEXT NOT NULL DEFAULT 'not_synced',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_variants_workspace ON product_variants(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_variants_sku_unq ON product_variants(workspace_id, sku);

    -- SYNCHRONIZATION JOBS
    CREATE TABLE IF NOT EXISTS sync_jobs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
      integration_mode TEXT NOT NULL,
      operation_type TEXT NOT NULL,
      status TEXT NOT NULL,
      attempt_count INTEGER NOT NULL DEFAULT 1,
      started_at INTEGER,
      finished_at INTEGER,
      woo_id INTEGER,
      error_code TEXT,
      error_message TEXT,
      request_payload_sanitized TEXT,
      response_payload_sanitized TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sync_jobs_workspace ON sync_jobs(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_sync_jobs_product ON sync_jobs(product_id);
    CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(workspace_id, status);

    -- ACTIVITY LOGS
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      action TEXT NOT NULL,
      details_json TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_activity_workspace ON activity_logs(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(workspace_id, created_at);

    -- AI AGENT RUNS
    CREATE TABLE IF NOT EXISTS ai_agent_runs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      task_type TEXT NOT NULL,
      model TEXT NOT NULL,
      status TEXT NOT NULL,
      tool_trace_json TEXT NOT NULL DEFAULT '[]',
      summary TEXT,
      structured_result_json TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ai_runs_workspace ON ai_agent_runs(workspace_id);
  `);

  console.log('[Migration] Database tables and indexes created successfully.');
}

if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  runMigrations();
}
