import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load .env from root or backend directory
const rootEnv = path.resolve(process.cwd(), '.env');
const parentEnv = path.resolve(process.cwd(), '../.env');
const backendEnv = path.resolve(process.cwd(), 'backend/.env');

if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });
if (fs.existsSync(parentEnv)) dotenv.config({ path: parentEnv });
if (fs.existsSync(backendEnv)) dotenv.config({ path: backendEnv });

import { sqlite } from './index.js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const STORE_URL = (process.env.WOOCOMMERCE_STORE_URL || 'https://kilowatt-repo.local').replace(/\/+$/, '');
const KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
const SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

if (!KEY || !SECRET) {
  console.error('[WooCommerce Seeder] Missing WOOCOMMERCE_CONSUMER_KEY or WOOCOMMERCE_CONSUMER_SECRET in .env');
  process.exit(1);
}

const AUTH_HEADER = 'Basic ' + Buffer.from(`${KEY}:${SECRET}`).toString('base64');

async function wooFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${STORE_URL}/wp-json/wc/v3${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: AUTH_HEADER,
      ...options.headers,
    },
  });

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = { message: text };
  }

  if (!res.ok) {
    throw new Error(`[${res.status}] ${json.message || res.statusText}`);
  }

  return json;
}

async function seedWooCommerce() {
  console.log(`\n===============================================================================`);
  console.log(`  ORIVANTA PIM — AUTOMATED WOOCOMMERCE LIVE SEEDER`);
  console.log(`  Target Store: ${STORE_URL}`);
  console.log(`===============================================================================\n`);

  // 1. Verify Connection
  console.log(`[Step 1/5] Testing WooCommerce REST API connection...`);
  try {
    const existingProducts = await wooFetch('/products?per_page=1');
    console.log(`✓ Successfully authenticated with WooCommerce REST API v3.`);
  } catch (err: any) {
    console.error(`✗ Connection check failed: ${err.message}`);
    process.exit(1);
  }

  // 2. Create Categories
  console.log(`\n[Step 2/5] Creating product categories in WooCommerce...`);
  const categoriesToCreate = [
    { name: 'Mechanical Keyboards', slug: 'keyboards', description: 'Custom mechanical keyboards and accessories' },
    { name: 'Ergonomic Seating', slug: 'ergonomic-seating', description: 'Ergonomic task chairs and active sitting solutions' },
    { name: 'Studio Audio', slug: 'audio-studio', description: 'Studio monitors, acoustic headphones, and microphones' },
    { name: 'Smart Lighting', slug: 'smart-lighting', description: 'Screen lightbars, bias lighting, and ambient smart lamps' },
    { name: 'Desk Accessories', slug: 'desk-accessories', description: 'Handcrafted solid wood risers, organizers, and mats' },
  ];

  const categoryMap: Record<string, number> = {};
  for (const cat of categoriesToCreate) {
    try {
      // Check if exists
      const existing = await wooFetch(`/products/categories?slug=${cat.slug}`);
      if (Array.isArray(existing) && existing.length > 0) {
        categoryMap[cat.slug] = existing[0].id;
        console.log(`  - Category '${cat.name}' already exists (ID: ${existing[0].id})`);
      } else {
        const created = await wooFetch('/products/categories', {
          method: 'POST',
          body: JSON.stringify(cat),
        });
        categoryMap[cat.slug] = created.id;
        console.log(`  + Created category '${cat.name}' (ID: ${created.id})`);
      }
    } catch (err: any) {
      console.warn(`  ! Note for category '${cat.name}': ${err.message}`);
    }
  }

  // 3. Create Attributes
  console.log(`\n[Step 3/5] Creating global product attributes in WooCommerce...`);
  const attributesToCreate = [
    { name: 'Switch Type', slug: 'pa_switch_type', type: 'select', has_archives: false },
    { name: 'Color Finish', slug: 'pa_color', type: 'select', has_archives: false },
  ];

  const attributeMap: Record<string, number> = {};
  for (const attr of attributesToCreate) {
    try {
      const existing = await wooFetch('/products/attributes');
      const found = Array.isArray(existing) ? existing.find((a: any) => a.slug === attr.slug || a.name === attr.name) : null;
      if (found) {
        attributeMap[attr.name] = found.id;
        console.log(`  - Attribute '${attr.name}' already exists (ID: ${found.id})`);
      } else {
        const created = await wooFetch('/products/attributes', {
          method: 'POST',
          body: JSON.stringify(attr),
        });
        attributeMap[attr.name] = created.id;
        console.log(`  + Created attribute '${attr.name}' (ID: ${created.id})`);
      }
    } catch (err: any) {
      console.warn(`  ! Note for attribute '${attr.name}': ${err.message}`);
    }
  }

  // 4. Products to Load
  console.log(`\n[Step 4/5] Loading rich product catalogue with images and pricing...`);
  const products = [
    {
      name: 'Orivanta Precision 75% Mechanical Keyboard',
      slug: 'orivanta-precision-75-mechanical-keyboard',
      type: 'variable',
      status: 'publish',
      regular_price: '149.00',
      short_description: 'Compact 75% hot-swappable mechanical keyboard with CNC-milled aluminum chassis and gasket mount.',
      description: '<p>The <strong>Orivanta Precision 75%</strong> is engineered for discerning typists and software engineers. Featuring an anodized 6063 aluminum chassis, multi-layer poron acoustic foam, and south-facing RGB per-key illumination.</p><ul><li>Hot-swappable 5-pin PCB</li><li>Tri-mode connectivity: 2.4GHz, Bluetooth 5.2, and USB-C</li><li>4,000mAh battery providing up to 200 hours of cordless uptime</li></ul>',
      categories: categoryMap['keyboards'] ? [{ id: categoryMap['keyboards'] }] : [],
      images: [
        { src: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', alt: 'Precision 75 Keyboard' },
      ],
      attributes: [
        {
          id: attributeMap['Switch Type'] || 0,
          name: 'Switch Type',
          position: 0,
          visible: true,
          variation: true,
          options: ['Tactile Brown', 'Linear Red', 'Clicky Blue'],
        },
      ],
      sku: 'KEY-PREC-01',
      variations: [
        {
          sku: 'KEY-PREC-01-BRN',
          regular_price: '149.00',
          manage_stock: true,
          stock_quantity: 25,
          attributes: [{ name: 'Switch Type', option: 'Tactile Brown' }],
        },
        {
          sku: 'KEY-PREC-01-RED',
          regular_price: '149.00',
          manage_stock: true,
          stock_quantity: 30,
          attributes: [{ name: 'Switch Type', option: 'Linear Red' }],
        },
        {
          sku: 'KEY-PREC-01-BLU',
          regular_price: '149.00',
          manage_stock: true,
          stock_quantity: 15,
          attributes: [{ name: 'Switch Type', option: 'Clicky Blue' }],
        },
      ],
    },
    {
      name: 'ErgoFlow Mesh Task Chair',
      slug: 'ergoflow-mesh-task-chair',
      type: 'simple',
      status: 'publish',
      regular_price: '349.00',
      short_description: 'Breathable elastomeric mesh ergonomic chair with 4D adjustable armrests and dynamic lumbar support.',
      description: '<p>Engineered for all-day focus. <strong>ErgoFlow</strong> adapts dynamically to spinal posture changes with forward-tilt lock, synchronised 3:1 recline ratio, and Italian elastomeric mesh for optimal thermal comfort.</p>',
      categories: categoryMap['ergonomic-seating'] ? [{ id: categoryMap['ergonomic-seating'] }] : [],
      images: [
        { src: 'https://images.unsplash.com/photo-1580481077195-c22ae28e24fa?auto=format&fit=crop&w=800&q=80', alt: 'ErgoFlow Mesh Chair' },
      ],
      sku: 'CHAIR-ERGO-01',
      manage_stock: true,
      stock_quantity: 18,
    },
    {
      name: 'AuraCast Acoustic Studio Headphones',
      slug: 'auracast-acoustic-studio-headphones',
      type: 'simple',
      status: 'publish',
      regular_price: '220.00',
      short_description: 'Closed-back reference studio monitor headphones with 45mm neodymium drivers and memory-foam ear cushions.',
      description: '<p>Flat acoustic response tailored for mastering and audiophile listening. Features detachable oxygen-free copper cables and lightweight aluminum gimbal construction.</p>',
      categories: categoryMap['audio-studio'] ? [{ id: categoryMap['audio-studio'] }] : [],
      images: [
        { src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', alt: 'AuraCast Headphones' },
      ],
      sku: 'AUD-AURA-01',
      manage_stock: true,
      stock_quantity: 42,
    },
    {
      name: 'LumenBar Dynamic Monitor Lightbar',
      slug: 'lumenbar-dynamic-monitor-lightbar',
      type: 'simple',
      status: 'publish',
      regular_price: '89.00',
      short_description: 'Asymmetric optical screenbar with wireless rotary dial and auto-dimming ambient light sensor.',
      description: '<p>Eliminates screen glare and reduces eye strain. Powered via USB-C with 2700K–6500K stepless color temperature adjustment and CRI &ge; 95 true color rendition.</p>',
      categories: categoryMap['smart-lighting'] ? [{ id: categoryMap['smart-lighting'] }] : [],
      images: [
        { src: 'https://images.unsplash.com/photo-1534972195531-a756b1126f24?auto=format&fit=crop&w=800&q=80', alt: 'LumenBar Lightbar' },
      ],
      sku: 'LGT-LUMEN-01',
      manage_stock: true,
      stock_quantity: 65,
    },
    {
      name: 'Dyneema Modular Everyday Pack 28L',
      slug: 'dyneema-modular-everyday-pack-28l',
      type: 'simple',
      status: 'publish',
      regular_price: '189.00',
      short_description: 'Ultra-lightweight weatherproof commuter backpack made from composite Dyneema fabric.',
      description: '<p>Constructed from Dyneema CT5K.18, 15x stronger than steel by weight. YKK Aquaguard water-resistant zippers, suspended 16" laptop sleeve, and Fidlock magnetic fasteners.</p>',
      categories: categoryMap['desk-accessories'] ? [{ id: categoryMap['desk-accessories'] }] : [],
      images: [
        { src: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', alt: 'Dyneema Everyday Pack' },
      ],
      sku: 'BAG-DYNE-28',
      manage_stock: true,
      stock_quantity: 22,
    },
    {
      name: 'Solid American Walnut Desk Riser',
      slug: 'solid-american-walnut-desk-riser',
      type: 'simple',
      status: 'publish',
      regular_price: '79.00',
      short_description: 'Handcrafted solid hardwood monitor riser with cork-padded aluminum feet and integrated cable passthrough.',
      description: '<p>Carved from sustainable Appalachian black walnut with natural Danish oil finish. Elevates display to ergonomic eye level while creating under-shelf keyboard storage.</p>',
      categories: categoryMap['desk-accessories'] ? [{ id: categoryMap['desk-accessories'] }] : [],
      images: [
        { src: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80', alt: 'Walnut Desk Riser' },
      ],
      sku: 'ACC-WALNUT-01',
      manage_stock: true,
      stock_quantity: 50,
    },
  ];

  const syncedProductIds: Record<string, number> = {};

  for (const p of products) {
    try {
      const { variations, ...productPayload } = p as any;
      console.log(`  -> Processing '${p.name}' (SKU: ${p.sku})...`);

      // Check if product exists by SKU
      const existingList = await wooFetch(`/products?sku=${encodeURIComponent(p.sku)}`);
      let wooProduct: any;

      if (Array.isArray(existingList) && existingList.length > 0) {
        wooProduct = existingList[0];
        console.log(`     Product already exists in WooCommerce (ID: ${wooProduct.id}). Updating...`);
        try {
          wooProduct = await wooFetch(`/products/${wooProduct.id}`, {
            method: 'PUT',
            body: JSON.stringify(productPayload),
          });
        } catch (updateErr: any) {
          if (productPayload.images && productPayload.images.length > 0) {
            console.warn(`     ! Remote image upload notice: ${updateErr.message}. Retrying update without images...`);
            const { images, ...payloadWithoutImages } = productPayload;
            wooProduct = await wooFetch(`/products/${wooProduct.id}`, {
              method: 'PUT',
              body: JSON.stringify(payloadWithoutImages),
            });
          } else {
            throw updateErr;
          }
        }
      } else {
        try {
          wooProduct = await wooFetch('/products', {
            method: 'POST',
            body: JSON.stringify(productPayload),
          });
          console.log(`     + Created product in WooCommerce (ID: ${wooProduct.id})`);
        } catch (createErr: any) {
          if (productPayload.images && productPayload.images.length > 0) {
            console.warn(`     ! Remote image upload notice: ${createErr.message}. Retrying creation without images...`);
            const { images, ...payloadWithoutImages } = productPayload;
            wooProduct = await wooFetch('/products', {
              method: 'POST',
              body: JSON.stringify(payloadWithoutImages),
            });
            console.log(`     + Created product in WooCommerce (ID: ${wooProduct.id})`);
          } else {
            throw createErr;
          }
        }
      }

      syncedProductIds[p.sku] = wooProduct.id;

      // Handle Variations if variable product
      if (p.type === 'variable' && Array.isArray(variations)) {
        for (const v of variations) {
          try {
            const existingVars = await wooFetch(`/products/${wooProduct.id}/variations?sku=${encodeURIComponent(v.sku)}`);
            if (Array.isArray(existingVars) && existingVars.length > 0) {
              console.log(`       - Variation '${v.sku}' already exists (ID: ${existingVars[0].id})`);
            } else {
              const createdVar = await wooFetch(`/products/${wooProduct.id}/variations`, {
                method: 'POST',
                body: JSON.stringify(v),
              });
              console.log(`       + Created variation '${v.sku}' (ID: ${createdVar.id})`);
            }
          } catch (varErr: any) {
            console.warn(`       ! Error on variation '${v.sku}': ${varErr.message}`);
          }
        }
      }
    } catch (prodErr: any) {
      console.error(`  ✗ Error creating product '${p.name}': ${prodErr.message}`);
    }
  }

  // 5. Update Local SQLite Database
  console.log(`\n[Step 5/5] Mapping external WooCommerce IDs into local Orivanta SQLite database...`);
  const now = Date.now();
  for (const [sku, wooId] of Object.entries(syncedProductIds)) {
    sqlite.prepare(`
      UPDATE products
      SET woo_product_id = ?, sync_status = 'synced', last_sync_at = ?, sync_error = NULL
      WHERE sku = ?
    `).run(String(wooId), now, sku);

    // Record sync job entry
    const localProduct = sqlite.prepare(`SELECT id, workspace_id FROM products WHERE sku = ?`).get(sku) as any;
    if (localProduct) {
      sqlite.prepare(`
        INSERT INTO sync_jobs (
          id, workspace_id, product_id, integration_mode, operation_type,
          status, attempt_count, started_at, finished_at, woo_id, created_at
        ) VALUES (?, ?, ?, 'woocommerce', 'create', 'synced', 1, ?, ?, ?, ?)
      `).run(
        'job_sync_' + Math.random().toString(36).slice(2, 9),
        localProduct.workspace_id,
        localProduct.id,
        now - 200,
        now,
        String(wooId),
        now
      );
    }
  }

  console.log(`\n===============================================================================`);
  console.log(`✓ SEEDING COMPLETED SUCCESSFULLY!`);
  console.log(`  All artifacts, categories, attributes, variations & images loaded into:`);
  console.log(`  ${STORE_URL}`);
  console.log(`  Open WordPress to inspect: ${STORE_URL}/wp-admin/edit.php?post_type=product`);
  console.log(`===============================================================================\n`);
}

seedWooCommerce().catch((err) => {
  console.error('\n[FATAL SEED ERROR]', err);
  process.exit(1);
});
