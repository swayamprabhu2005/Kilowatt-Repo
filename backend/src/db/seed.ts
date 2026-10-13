import { sqlite } from './index.js';
import * as argon2 from '@node-rs/argon2';

export async function runSeed() {
  console.log('[Seed] Seeding Orivanta PIM database...');

  const now = Date.now();
  const passwordHash = await argon2.hash('OrivantaDemo2026!');

  // Clear existing data safely for idempotent reset
  sqlite.exec(`
    DELETE FROM ai_agent_runs;
    DELETE FROM activity_logs;
    DELETE FROM sync_jobs;
    DELETE FROM product_variants;
    DELETE FROM product_categories;
    DELETE FROM products;
    DELETE FROM attribute_definitions;
    DELETE FROM categories;
    DELETE FROM sessions;
    DELETE FROM workspace_members;
    DELETE FROM users;
    DELETE FROM workspaces;
  `);

  // 1. Workspaces
  const insertWorkspace = sqlite.prepare(`
    INSERT INTO workspaces (id, name, slug, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertWorkspace.run('ws_default', 'Orivanta Demo Workspace', 'orivanta-demo', now, now);
  insertWorkspace.run('ws_isolated', 'Isolated Workspace (Tenant B)', 'tenant-b-isolated', now, now);

  // 2. Users
  const insertUser = sqlite.prepare(`
    INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertUser.run('usr_demo_admin', 'demo@orivanta.local', passwordHash, 'Demo Administrator', now, now);
  insertUser.run('usr_tenant_b', 'other@tenant2.local', passwordHash, 'Isolated Tenant User', now, now);

  // 3. Workspace Memberships
  const insertMember = sqlite.prepare(`
    INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertMember.run('mem_demo_admin', 'ws_default', 'usr_demo_admin', 'owner', now);
  insertMember.run('mem_tenant_b', 'ws_isolated', 'usr_tenant_b', 'owner', now);

  // 4. Categories
  const insertCategory = sqlite.prepare(`
    INSERT INTO categories (id, workspace_id, name, slug, description, parent_id, woo_category_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertCategory.run('cat_electronics', 'ws_default', 'Electronics & Audio', 'electronics', 'Consumer electronics, audio gear, and computing devices', null, 101, now, now);
  insertCategory.run('cat_laptops', 'ws_default', 'Laptops & Computers', 'laptops', 'High-performance laptops and mobile workstations', 'cat_electronics', 102, now, now);
  insertCategory.run('cat_audio', 'ws_default', 'Audio & Headphones', 'audio', 'Wireless headphones, IEMs, and studio monitors', 'cat_electronics', 103, now, now);
  insertCategory.run('cat_apparel', 'ws_default', 'Apparel & Textiles', 'apparel', 'Sustainable clothing and essentials', null, 201, now, now);
  insertCategory.run('cat_tshirts', 'ws_default', 'T-Shirts & Tops', 't-shirts', 'Organic cotton tops and tees', 'cat_apparel', 202, now, now);
  insertCategory.run('cat_home', 'ws_default', 'Home & Living', 'home-living', 'Modern home accessories and ceramics', null, 301, now, now);

  // Isolated workspace category (for tenant isolation verification)
  insertCategory.run('cat_isolated_1', 'ws_isolated', 'Confidential Projects', 'confidential', 'Tenant B isolated category', null, 999, now, now);

  // 5. Dynamic Attribute Definitions
  const insertAttr = sqlite.prepare(`
    INSERT INTO attribute_definitions (
      id, workspace_id, code, name, description, data_type, is_required, is_filterable, is_variant_param,
      applicable_product_types, options_json, validation_rules_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAttr.run(
    'attr_ram_gb', 'ws_default', 'ram_gb', 'RAM Capacity (GB)', 'System memory in gigabytes',
    'number', 0, 1, 0, 'simple,variable', '[]', JSON.stringify({ min: 4, max: 128 }), now, now
  );
  insertAttr.run(
    'attr_storage_gb', 'ws_default', 'storage_gb', 'Storage Capacity (GB)', 'Solid-state drive capacity',
    'number', 0, 1, 0, 'simple,variable', '[]', JSON.stringify({ min: 64, max: 8192 }), now, now
  );
  insertAttr.run(
    'attr_processor', 'ws_default', 'processor', 'Processor Model', 'Chip architecture and brand',
    'text', 0, 1, 0, 'simple,variable', '[]', JSON.stringify({ minLength: 2, maxLength: 50 }), now, now
  );
  insertAttr.run(
    'attr_color', 'ws_default', 'color', 'Color', 'Commercial finish color',
    'select', 0, 1, 1, 'simple,variable',
    JSON.stringify(['Midnight Black', 'Arctic White', 'Terracotta Red', 'Warm Sand', 'Navy Ink']),
    '{}', now, now
  );
  insertAttr.run(
    'attr_size', 'ws_default', 'size', 'Garment Size', 'Standard sizing option',
    'select', 0, 1, 1, 'simple,variable',
    JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
    '{}', now, now
  );
  insertAttr.run(
    'attr_material', 'ws_default', 'material', 'Material Composition', 'Primary fabrication material',
    'text', 0, 1, 0, 'simple,variable', '[]', JSON.stringify({ maxLength: 100 }), now, now
  );
  insertAttr.run(
    'attr_wireless', 'ws_default', 'wireless', 'Wireless Connectivity', 'Supports Bluetooth / Wi-Fi',
    'boolean', 0, 1, 0, 'simple,variable', '[]', '{}', now, now
  );
  insertAttr.run(
    'attr_battery_life', 'ws_default', 'battery_life_hours', 'Battery Life (Hours)', 'Continuous runtime on battery',
    'number', 0, 1, 0, 'simple,variable', '[]', JSON.stringify({ min: 1, max: 150 }), now, now
  );
  insertAttr.run(
    'attr_fit', 'ws_default', 'fit', 'Garment Fit', 'Silhoutte fit classification',
    'select', 0, 1, 0, 'simple,variable',
    JSON.stringify(['Regular Fit', 'Slim Fit', 'Oversized Fit']),
    '{}', now, now
  );

  // 6. Products
  const insertProduct = sqlite.prepare(`
    INSERT INTO products (
      id, workspace_id, name, slug, sku, product_type, status, brand,
      short_description, description, price, stock_quantity, attributes_json, images_json,
      woo_product_id, sync_status, last_sync_at, sync_error, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Product 1: ProBook 15X (Simple, Synced)
  insertProduct.run(
    'prod_probook_15x', 'ws_default', 'Orivanta ProBook 15X', 'orivanta-probook-15x', 'LAP-PRO-15X',
    'simple', 'published', 'Orivanta Tech',
    'Professional workstation laptop engineered for creators and engineers.',
    'Designed for uncompromising performance, the Orivanta ProBook 15X features precision CNC aluminium chassis, vivid color-calibrated display, and advanced thermal architecture.',
    1499.00, 32,
    JSON.stringify({
      ram_gb: 32,
      storage_gb: 1024,
      processor: 'Apple M3 Pro / AMD Ryzen 9',
      wireless: true,
      battery_life_hours: 18,
      color: 'Midnight Black'
    }),
    JSON.stringify([
      { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop', alt: 'Orivanta ProBook 15X Angled View' }
    ]),
    1001, 'synced', now - 3600000, null, now - 86400000, now - 3600000
  );

  // Product 2: StudioWave ANC (Simple, Synced)
  insertProduct.run(
    'prod_studiowave_anc', 'ws_default', 'StudioWave ANC Wireless Headphones', 'studiowave-anc-headphones', 'AUD-SW-ANC',
    'simple', 'published', 'Acoustica Labs',
    'Active noise-canceling headphones with studio-grade spatial acoustic drivers.',
    'Experience pristine sound reproduction with 40mm beryllium drivers, hybrid active noise cancellation, and up to 45 hours of continuous wireless playback.',
    289.00, 75,
    JSON.stringify({
      wireless: true,
      battery_life_hours: 45,
      color: 'Midnight Black',
      material: 'Anodized Aluminum & Memory Foam'
    }),
    JSON.stringify([
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop', alt: 'StudioWave Headphones' }
    ]),
    1002, 'synced', now - 7200000, null, now - 172800000, now - 7200000
  );

  // Product 3: Organic Pima T-Shirt (Variable, Synced)
  insertProduct.run(
    'prod_pima_tee', 'ws_default', 'Organic Pima Cotton T-Shirt', 'organic-pima-cotton-tee', 'APP-PIMA-TEE',
    'variable', 'published', 'Atelier Orivanta',
    'Responsibly sourced 100% organic long-staple cotton everyday tee.',
    'Crafted with single-origin combed organic Pima cotton for exceptional softness, breathability, and structural durability across countless washes.',
    38.00, 108,
    JSON.stringify({
      material: '100% Organic Pima Cotton',
      fit: 'Regular Fit'
    }),
    JSON.stringify([
      { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop', alt: 'Organic Pima Cotton T-Shirt' }
    ]),
    1003, 'synced', now - 1800000, null, now - 259200000, now - 1800000
  );

  // Product 4: Ceramic Pour-Over (Simple, Draft, Not Synced)
  insertProduct.run(
    'prod_ceramic_pourover', 'ws_default', 'Artisan Ceramic Pour-Over Dripper', 'artisan-ceramic-pour-over', 'HOM-POUR-DRP',
    'simple', 'draft', 'Kanso Living',
    'Hand-glazed artisanal ceramic coffee dripper designed for precision extraction.',
    'Each dripper is hand-turned by master ceramicists using natural stoneware clay. Calibrated internal spiral ribs ensure an optimal flow rate and uniform saturation.',
    42.00, 50,
    JSON.stringify({
      material: 'Stoneware Ceramic',
      color: 'Warm Sand'
    }),
    JSON.stringify([
      { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop', alt: 'Artisan Ceramic Pour-Over' }
    ]),
    null, 'not_synced', null, null, now - 43200000, now - 43200000
  );

  // Product 5: AeroLight Carbon Backpack (Draft, Incomplete, Failed Sync — Perfect for AI Audit & Enrichment)
  insertProduct.run(
    'prod_aerolight_pack', 'ws_default', 'AeroLight Carbon Trekking Backpack', 'aerolight-carbon-backpack', 'BAG-AERO-40L',
    'simple', 'draft', 'Summit Gear',
    'Ultralight technical alpine pack.', // Needs enrichment
    'Technical backpack for alpine expeditions.', // Needs enrichment
    185.00, 14,
    JSON.stringify({
      // Intentionally missing processor/ram/etc. or relevant attributes to show Completeness Audit finding
      color: 'Terracotta Red'
    }),
    JSON.stringify([]),
    null, 'failed', now - 600000, 'WooCommerce validation error: Description must be at least 80 characters, and product image is required for catalog publishing.',
    now - 86400000, now - 600000
  );

  // Isolated workspace product
  insertProduct.run(
    'prod_isolated_secret', 'ws_isolated', 'Confidential Prototype Device', 'confidential-prototype', 'SEC-PROTO-01',
    'simple', 'draft', 'Tenant B Corp',
    'Top secret product belonging to Tenant B.', 'Never disclose to Tenant A.', 9999.00, 1,
    '{}', '[]', null, 'not_synced', null, null, now, now
  );

  // 7. Product Category Bindings
  const insertProdCat = sqlite.prepare(`
    INSERT INTO product_categories (id, product_id, category_id, workspace_id)
    VALUES (?, ?, ?, ?)
  `);
  insertProdCat.run('pc_1', 'prod_probook_15x', 'cat_laptops', 'ws_default');
  insertProdCat.run('pc_2', 'prod_studiowave_anc', 'cat_audio', 'ws_default');
  insertProdCat.run('pc_3', 'prod_pima_tee', 'cat_tshirts', 'ws_default');
  insertProdCat.run('pc_4', 'prod_ceramic_pourover', 'cat_home', 'ws_default');
  insertProdCat.run('pc_5', 'prod_isolated_secret', 'cat_isolated_1', 'ws_isolated');

  // 8. Product Variants for Variable Product (Organic Pima Cotton T-Shirt)
  const insertVariant = sqlite.prepare(`
    INSERT INTO product_variants (
      id, product_id, workspace_id, sku, attribute_combination_json,
      price_override, stock_quantity, is_active, woo_variation_id, sync_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertVariant.run('var_1', 'prod_pima_tee', 'ws_default', 'APP-PIMA-BLK-M', JSON.stringify({ color: 'Midnight Black', size: 'M' }), 38.00, 24, 1, 5001, 'synced', now, now);
  insertVariant.run('var_2', 'prod_pima_tee', 'ws_default', 'APP-PIMA-BLK-L', JSON.stringify({ color: 'Midnight Black', size: 'L' }), 38.00, 30, 1, 5002, 'synced', now, now);
  insertVariant.run('var_3', 'prod_pima_tee', 'ws_default', 'APP-PIMA-TER-M', JSON.stringify({ color: 'Terracotta Red', size: 'M' }), 38.00, 18, 1, 5003, 'synced', now, now);
  insertVariant.run('var_4', 'prod_pima_tee', 'ws_default', 'APP-PIMA-TER-L', JSON.stringify({ color: 'Terracotta Red', size: 'L' }), 38.00, 22, 1, 5004, 'synced', now, now);
  insertVariant.run('var_5', 'prod_pima_tee', 'ws_default', 'APP-PIMA-SND-M', JSON.stringify({ color: 'Warm Sand', size: 'M' }), 38.00, 14, 1, 5005, 'synced', now, now);

  // 9. Sync Jobs History
  const insertSyncJob = sqlite.prepare(`
    INSERT INTO sync_jobs (
      id, workspace_id, product_id, integration_mode, operation_type, status,
      attempt_count, started_at, finished_at, woo_id, error_code, error_message,
      request_payload_sanitized, response_payload_sanitized, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertSyncJob.run(
    'job_001', 'ws_default', 'prod_probook_15x', 'mock', 'update', 'synced',
    1, now - 3610000, now - 3600000, 1001, null, null,
    JSON.stringify({ name: 'Orivanta ProBook 15X', sku: 'LAP-PRO-15X', price: 1499.00 }),
    JSON.stringify({ id: 1001, status: 'publish', date_modified: new Date(now - 3600000).toISOString() }),
    now - 3610000
  );
  insertSyncJob.run(
    'job_002', 'ws_default', 'prod_studiowave_anc', 'mock', 'create', 'synced',
    1, now - 7210000, now - 7200000, 1002, null, null,
    JSON.stringify({ name: 'StudioWave ANC Wireless Headphones', sku: 'AUD-SW-ANC', price: 289.00 }),
    JSON.stringify({ id: 1002, status: 'publish' }),
    now - 7210000
  );
  insertSyncJob.run(
    'job_003', 'ws_default', 'prod_pima_tee', 'mock', 'update', 'synced',
    1, now - 1810000, now - 1800000, 1003, null, null,
    JSON.stringify({ name: 'Organic Pima Cotton T-Shirt', sku: 'APP-PIMA-TEE', variations_count: 5 }),
    JSON.stringify({ id: 1003, status: 'publish' }),
    now - 1810000
  );
  insertSyncJob.run(
    'job_004', 'ws_default', 'prod_aerolight_pack', 'mock', 'create', 'failed',
    1, now - 605000, now - 600000, null, 'VALIDATION_INCOMPLETE',
    'Product description must be at least 80 characters, and at least one high-resolution product media asset is required.',
    JSON.stringify({ name: 'AeroLight Carbon Trekking Backpack', sku: 'BAG-AERO-40L' }),
    JSON.stringify({ error: 'VALIDATION_INCOMPLETE', code: 422 }),
    now - 605000
  );

  // 10. Activity Logs
  const insertActivity = sqlite.prepare(`
    INSERT INTO activity_logs (
      id, workspace_id, user_id, entity_type, entity_id, action, details_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertActivity.run('act_1', 'ws_default', 'usr_demo_admin', 'product', 'prod_probook_15x', 'sync', JSON.stringify({ status: 'synced', wooId: 1001 }), now - 3600000);
  insertActivity.run('act_2', 'ws_default', 'usr_demo_admin', 'product', 'prod_pima_tee', 'update', JSON.stringify({ changes: ['price', 'stockQuantity'] }), now - 1800000);
  insertActivity.run('act_3', 'ws_default', 'usr_demo_admin', 'sync', 'job_004', 'sync_failed', JSON.stringify({ error: 'VALIDATION_INCOMPLETE' }), now - 600000);

  console.log('[Seed] Database successfully populated with realistic demo catalogue, attributes, variants, and sync history.');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeed().catch((err) => {
    console.error('[Seed Error]', err);
    process.exit(1);
  });
}
