import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

// -----------------------------------------------------------------------------
// WORKSPACES & TENANCY
// -----------------------------------------------------------------------------
export const workspaces = sqliteTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const workspaceMembers = sqliteTable(
  'workspace_members',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('editor'), // 'owner', 'admin', 'editor', 'viewer'
    createdAt: integer('created_at').notNull(),
  },
  (table) => ({
    memberUnq: uniqueIndex('idx_workspace_member_unq').on(table.workspaceId, table.userId),
    workspaceIdx: index('idx_workspace_members_workspace').on(table.workspaceId),
    userIdx: index('idx_workspace_members_user').on(table.userId),
  })
);

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(), // Session token
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  activeWorkspaceId: text('active_workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(),
  createdAt: integer('created_at').notNull(),
});

// -----------------------------------------------------------------------------
// CATEGORIES
// -----------------------------------------------------------------------------
export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    parentId: text('parent_id'),
    wooCategoryId: integer('woo_category_id'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => ({
    wsIdx: index('idx_categories_workspace').on(table.workspaceId),
    slugUnq: uniqueIndex('idx_categories_slug_unq').on(table.workspaceId, table.slug),
  })
);

// -----------------------------------------------------------------------------
// DYNAMIC ATTRIBUTE DEFINITIONS
// -----------------------------------------------------------------------------
export const attributeDefinitions = sqliteTable(
  'attribute_definitions',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    code: text('code').notNull(), // Unique machine-readable code, e.g., 'ram_gb', 'tshirt_size'
    name: text('name').notNull(),
    description: text('description'),
    dataType: text('data_type').notNull(), // 'text', 'number', 'boolean', 'select', 'multiselect', 'date'
    isRequired: integer('is_required').notNull().default(0),
    isFilterable: integer('is_filterable').notNull().default(1),
    isVariantParam: integer('is_variant_param').notNull().default(0),
    applicableProductTypes: text('applicable_product_types').notNull().default('simple,variable'),
    optionsJson: text('options_json').notNull().default('[]'), // Array of allowed values for select/multiselect
    validationRulesJson: text('validation_rules_json').notNull().default('{}'), // min, max, pattern
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => ({
    wsIdx: index('idx_attr_def_workspace').on(table.workspaceId),
    codeUnq: uniqueIndex('idx_attr_def_code_unq').on(table.workspaceId, table.code),
  })
);

// -----------------------------------------------------------------------------
// PRODUCTS & VARIANTS
// -----------------------------------------------------------------------------
export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    sku: text('sku').notNull(),
    productType: text('product_type').notNull().default('simple'), // 'simple', 'variable'
    status: text('status').notNull().default('draft'), // 'draft', 'published', 'archived'
    brand: text('brand'),
    shortDescription: text('short_description'),
    description: text('description'),
    price: real('price'),
    stockQuantity: integer('stock_quantity'),
    // Hybrid Relational + Validated JSON model for dynamic attribute values
    attributesJson: text('attributes_json').notNull().default('{}'),
    imagesJson: text('images_json').notNull().default('[]'),
    wooProductId: integer('woo_product_id'),
    syncStatus: text('sync_status').notNull().default('not_synced'), // 'not_synced', 'pending', 'syncing', 'synced', 'failed'
    lastSyncAt: integer('last_sync_at'),
    syncError: text('sync_error'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => ({
    wsIdx: index('idx_products_workspace').on(table.workspaceId),
    skuUnq: uniqueIndex('idx_products_sku_unq').on(table.workspaceId, table.sku),
    statusIdx: index('idx_products_status').on(table.workspaceId, table.status),
    syncStatusIdx: index('idx_products_sync_status').on(table.workspaceId, table.syncStatus),
  })
);

export const productCategories = sqliteTable(
  'product_categories',
  {
    id: text('id').primaryKey(),
    productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    unqProdCat: uniqueIndex('idx_prod_cat_unq').on(table.productId, table.categoryId),
    prodIdx: index('idx_prod_cat_prod').on(table.productId),
    catIdx: index('idx_prod_cat_cat').on(table.categoryId),
  })
);

export const productVariants = sqliteTable(
  'product_variants',
  {
    id: text('id').primaryKey(),
    productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    sku: text('sku').notNull(),
    attributeCombinationJson: text('attribute_combination_json').notNull(), // e.g. {"size": "M", "color": "Blue"}
    priceOverride: real('price_override'),
    stockQuantity: integer('stock_quantity'),
    isActive: integer('is_active').notNull().default(1),
    wooVariationId: integer('woo_variation_id'),
    syncStatus: text('sync_status').notNull().default('not_synced'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => ({
    wsIdx: index('idx_variants_workspace').on(table.workspaceId),
    prodIdx: index('idx_variants_product').on(table.productId),
    skuUnq: uniqueIndex('idx_variants_sku_unq').on(table.workspaceId, table.sku),
  })
);

// -----------------------------------------------------------------------------
// SYNCHRONIZATION JOBS & HISTORY
// -----------------------------------------------------------------------------
export const syncJobs = sqliteTable(
  'sync_jobs',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
    integrationMode: text('integration_mode').notNull(), // 'mock', 'woocommerce'
    operationType: text('operation_type').notNull(), // 'create', 'update', 'delete', 'bulk'
    status: text('status').notNull(), // 'pending', 'syncing', 'synced', 'failed'
    attemptCount: integer('attempt_count').notNull().default(1),
    startedAt: integer('started_at'),
    finishedAt: integer('finished_at'),
    wooId: integer('woo_id'),
    errorCode: text('error_code'),
    errorMessage: text('error_message'),
    requestPayloadSanitized: text('request_payload_sanitized'),
    responsePayloadSanitized: text('response_payload_sanitized'),
    createdAt: integer('created_at').notNull(),
  },
  (table) => ({
    wsIdx: index('idx_sync_jobs_workspace').on(table.workspaceId),
    prodIdx: index('idx_sync_jobs_product').on(table.productId),
    statusIdx: index('idx_sync_jobs_status').on(table.workspaceId, table.status),
  })
);

// -----------------------------------------------------------------------------
// ACTIVITY AUDIT LOG
// -----------------------------------------------------------------------------
export const activityLogs = sqliteTable(
  'activity_logs',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    entityType: text('entity_type').notNull(), // 'product', 'attribute', 'category', 'variant', 'sync', 'ai'
    entityId: text('entity_id'),
    action: text('action').notNull(), // 'create', 'update', 'delete', 'sync', 'audit', 'enrich'
    detailsJson: text('details_json').notNull().default('{}'),
    createdAt: integer('created_at').notNull(),
  },
  (table) => ({
    wsIdx: index('idx_activity_workspace').on(table.workspaceId),
    createdIdx: index('idx_activity_created').on(table.workspaceId, table.createdAt),
  })
);

// -----------------------------------------------------------------------------
// AI AGENT RUNS & TOOL AUDIT TRACE
// -----------------------------------------------------------------------------
export const aiAgentRuns = sqliteTable(
  'ai_agent_runs',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    taskType: text('task_type').notNull(), // 'audit', 'enrichment', 'diagnosis', 'catalogue_query'
    model: text('model').notNull(),
    status: text('status').notNull(), // 'running', 'completed', 'failed', 'step_limit_reached'
    toolTraceJson: text('tool_trace_json').notNull().default('[]'),
    summary: text('summary'),
    structuredResultJson: text('structured_result_json'),
    createdAt: integer('created_at').notNull(),
  },
  (table) => ({
    wsIdx: index('idx_ai_runs_workspace').on(table.workspaceId),
  })
);
