import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { runMigrations } from '../src/db/migrate.js';
import { runSeed } from '../src/db/seed.js';
import { WooMapper } from '../src/integrations/woocommerce/woo-mapper.js';
import { agentToolRegistry } from '../src/modules/ai/agent-tools.js';

let demoCookie: string;
let otherTenantCookie: string;

beforeAll(async () => {
  runMigrations();
  await runSeed();

  // Login as Demo Admin (ws_default)
  const resDemo = await request(app)
    .post('/api/auth/login')
    .send({ email: 'demo@orivanta.local', password: 'OrivantaDemo2026!' });
  expect(resDemo.status).toBe(200);
  demoCookie = resDemo.headers['set-cookie'][0];

  // Login as Other Tenant User (ws_isolated)
  const resOther = await request(app)
    .post('/api/auth/login')
    .send({ email: 'other@tenant2.local', password: 'OrivantaDemo2026!' });
  expect(resOther.status).toBe(200);
  otherTenantCookie = resOther.headers['set-cookie'][0];
});

describe('1. Authentication & Tenant Isolation (Application Layer)', () => {
  it('rejects unauthenticated requests to protected routes', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects cross-tenant access to another workspace products', async () => {
    // Tenant B attempts to read Tenant A's seeded product 'prod_probook_15x'
    const res = await request(app)
      .get('/api/products/prod_probook_15x')
      .set('Cookie', otherTenantCookie);
    expect(res.status).toBe(404);
  });

  it('rejects cross-tenant header spoofing when user is not a member', async () => {
    // Demo admin attempts to spoof x-workspace-id header to 'ws_isolated'
    const res = await request(app)
      .get('/api/products')
      .set('Cookie', demoCookie)
      .set('x-workspace-id', 'ws_isolated');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CROSS_TENANT_ACCESS_DENIED');
  });
});

describe('2. Dynamic Attribute Engine & Schema Validation', () => {
  it('lists workspace dynamic attribute definitions', async () => {
    const res = await request(app)
      .get('/api/attributes')
      .set('Cookie', demoCookie);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(5);
  });

  it('creates a custom attribute definition and enforces unique code within workspace', async () => {
    const code = 'screen_refresh_rate_hz';
    const res = await request(app)
      .post('/api/attributes')
      .set('Cookie', demoCookie)
      .send({
        code,
        name: 'Screen Refresh Rate (Hz)',
        dataType: 'number',
        isRequired: false,
        isFilterable: true,
        validationRules: { min: 60, max: 360 },
      });
    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe(code);

    // Collision check
    const dupRes = await request(app)
      .post('/api/attributes')
      .set('Cookie', demoCookie)
      .send({
        code,
        name: 'Duplicate Test',
        dataType: 'number',
      });
    expect(dupRes.status).toBe(409);
  });
});

describe('3. Product Catalogue Management', () => {
  let createdProductId: string;

  it('creates a new simple product with dynamic attributes and categories', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', demoCookie)
      .send({
        name: 'Precision Mechanical Keyboard',
        sku: 'KEY-PREC-01',
        price: 159.00,
        stockQuantity: 40,
        status: 'draft',
        attributes: {
          wireless: true,
          color: 'Midnight Black',
        },
        categoryIds: ['cat_electronics'],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.syncStatus).toBe('not_synced');
    createdProductId = res.body.data.id;
  });

  it('enforces SKU uniqueness within workspace', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', demoCookie)
      .send({
        name: 'Another Keyboard',
        sku: 'KEY-PREC-01', // Duplicate SKU
        price: 199.00,
      });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_SKU');
  });

  it('duplicates a product with a unique copy SKU and not_synced status', async () => {
    const res = await request(app)
      .post(`/api/products/${createdProductId}/duplicate`)
      .set('Cookie', demoCookie);
    expect(res.status).toBe(201);
    expect(res.body.data.sku).toContain('KEY-PREC-01-COPY');
    expect(res.body.data.syncStatus).toBe('not_synced');
  });
});

describe('4. Product Variants & Matrix', () => {
  it('creates variants and prevents duplicate attribute combinations', async () => {
    const res = await request(app)
      .post('/api/products/prod_pima_tee/variants')
      .set('Cookie', demoCookie)
      .send({
        sku: 'APP-PIMA-WHT-S',
        attributeCombination: { color: 'Arctic White', size: 'S' },
        priceOverride: 38.00,
        stockQuantity: 15,
      });
    expect(res.status).toBe(201);

    // Duplicate combination test
    const dupRes = await request(app)
      .post('/api/products/prod_pima_tee/variants')
      .set('Cookie', demoCookie)
      .send({
        sku: 'APP-PIMA-WHT-S-DUP',
        attributeCombination: { color: 'Arctic White', size: 'S' },
      });
    expect(dupRes.status).toBe(409);
    expect(dupRes.body.error.code).toBe('DUPLICATE_COMBINATION');
  });
});

describe('5. WooCommerce Integration & Idempotent Synchronization', () => {
  it('tests connection in mock mode successfully', async () => {
    const res = await request(app)
      .post('/api/integrations/woocommerce/test')
      .set('Cookie', demoCookie);
    expect(res.status).toBe(200);
    expect(res.body.data.success).toBe(true);
    expect(res.body.data.mode).toBe('mock');
  });

  it('synchronizes a validated product to WooCommerce mock store', async () => {
    const res = await request(app)
      .post('/api/sync/products/prod_probook_15x')
      .set('Cookie', demoCookie);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('synced');
    expect(res.body.data.wooId).toBeDefined();
  });

  it('blocks synchronisation when mandatory validation fails', async () => {
    // Create product missing required specifications
    const pRes = await request(app)
      .post('/api/products')
      .set('Cookie', demoCookie)
      .send({
        name: 'Incomplete Test Device',
        sku: 'DEV-INCOMP-01',
        // Missing mandatory RAM / Storage attributes
      });
    const pId = pRes.body.data.id;

    const syncRes = await request(app)
      .post(`/api/sync/products/${pId}`)
      .set('Cookie', demoCookie);
    expect(syncRes.status).toBe(422);
    expect(syncRes.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('simulates a sync failure and successfully retries idempotently', async () => {
    // Enable failure simulation
    await request(app)
      .post('/api/sync/simulate-failure')
      .set('Cookie', demoCookie)
      .send({ fail: true });

    // Sync product (should fail)
    const failRes = await request(app)
      .post('/api/sync/products/prod_ceramic_pourover')
      .set('Cookie', demoCookie);
    expect(failRes.status).toBe(200);
    expect(failRes.body.data.status).toBe('failed');
    const failedJobId = failRes.body.data.id;

    // Retry the failed job (failure simulation is one-shot, so retry succeeds)
    const retryRes = await request(app)
      .post(`/api/sync/jobs/${failedJobId}/retry`)
      .set('Cookie', demoCookie);
    expect(retryRes.status).toBe(200);
    expect(retryRes.body.data.status).toBe('synced');
    expect(retryRes.body.data.wooId).toBeDefined();
  });
});

describe('6. Gemini Agentic AI Assistant & Tool Registry', () => {
  it('executes server-controlled agent tools with Zod validation', async () => {
    const tool = agentToolRegistry.get_product;
    const ctx = {
      userId: 'usr_demo_admin',
      workspaceId: 'ws_default',
      role: 'owner' as const,
      userEmail: 'demo@orivanta.local',
      userName: 'Demo Admin',
    };

    const res = await tool.execute(ctx, { productId: 'prod_probook_15x' });
    expect(res.name).toBe('Orivanta ProBook 15X');
    expect(res.sku).toBe('LAP-PRO-15X');
  });

  it('runs product completeness audit with structured checklist and tool traces', async () => {
    const res = await request(app)
      .post('/api/ai/agent/run')
      .set('Cookie', demoCookie)
      .send({
        taskType: 'audit',
        goal: 'Audit completeness of ProBook 15X',
        productId: 'prod_probook_15x',
      });
    expect(res.status).toBe(200);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.checklist).toBeDefined();
    expect(res.body.data.traces.length).toBeGreaterThan(0);
  });

  it('drafts product enrichment proposal with field diff without mutating DB', async () => {
    const res = await request(app)
      .post('/api/ai/agent/run')
      .set('Cookie', demoCookie)
      .send({
        taskType: 'enrichment',
        goal: 'Enrich product description and highlights',
        productId: 'prod_aerolight_pack',
        notes: 'Ultralight 40L technical pack with Dyneema composite fabric, waterproof zippers, and ergonomic load-lifters.',
      });
    expect(res.status).toBe(200);
    expect(res.body.data.suggestedPatch).toBeDefined();
    expect(res.body.data.suggestedPatch.name).toBeDefined();

    // Verify database record was NOT mutated (Human approval boundary)
    const checkProduct = await request(app)
      .get('/api/products/prod_aerolight_pack')
      .set('Cookie', demoCookie);
    expect(checkProduct.body.data.name).toBe('AeroLight Carbon Trekking Backpack');
  });
});
