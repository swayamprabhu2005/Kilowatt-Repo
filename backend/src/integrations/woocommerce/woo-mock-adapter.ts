import type {
  WooAdapterInterface,
  WooConnectionTestResult,
  WooProductPayload,
  WooProductResponse,
  WooVariationPayload,
  WooVariationResponse,
} from './woo-types.js';

export class WooMockAdapter implements WooAdapterInterface {
  private static nextProductId = 2001;
  private static nextVariationId = 6001;
  private static mockStore = new Map<number, WooProductResponse>();
  private static mockVariations = new Map<number, WooVariationResponse>();
  private simulateFailureNext = false;

  constructor() {}

  setSimulateFailure(shouldFail: boolean) {
    this.simulateFailureNext = shouldFail;
  }

  async verifyConnection(): Promise<WooConnectionTestResult> {
    // Deterministic instant mock connection check
    return {
      success: true,
      mode: 'mock',
      storeUrl: process.env.WOOCOMMERCE_STORE_URL || 'https://mock.orivanta.local',
      storeName: 'Orivanta Demo Store (Mock Integration)',
      version: 'WooCommerce v8.6.0-mock',
      checkedAt: Date.now(),
    };
  }

  async createProduct(payload: WooProductPayload): Promise<WooProductResponse> {
    if (this.simulateFailureNext) {
      this.simulateFailureNext = false;
      throw new Error('MOCK_SIMULATED_FAILURE: WooCommerce API connection timed out during product publish.');
    }

    const id = WooMockAdapter.nextProductId++;
    const now = new Date().toISOString();

    const response: WooProductResponse = {
      id,
      name: payload.name,
      slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      permalink: `https://mock.orivanta.local/product/${id}`,
      type: payload.type,
      status: payload.status,
      sku: payload.sku,
      price: payload.regular_price || '0.00',
      regular_price: payload.regular_price || '0.00',
      description: payload.description || '',
      short_description: payload.short_description || '',
      categories: (payload.categories || []).map((c) => ({ id: c.id, name: `Mock Category ${c.id}`, slug: `mock-cat-${c.id}` })),
      images: (payload.images || []).map((img, idx) => ({ id: 9000 + idx, src: img.src, name: img.name || 'image', alt: img.alt || '' })),
      attributes: payload.attributes || [],
      variations: [],
      date_created: now,
      date_modified: now,
    };

    WooMockAdapter.mockStore.set(id, response);
    return response;
  }

  async updateProduct(wooId: number, payload: Partial<WooProductPayload>): Promise<WooProductResponse> {
    if (this.simulateFailureNext) {
      this.simulateFailureNext = false;
      throw new Error('MOCK_SIMULATED_FAILURE: Remote gateway returned 502 Bad Gateway during update.');
    }

    const existing = WooMockAdapter.mockStore.get(wooId) || {
      id: wooId,
      name: payload.name || 'Mock Product',
      slug: 'mock-product',
      permalink: `https://mock.orivanta.local/product/${wooId}`,
      type: payload.type || 'simple',
      status: payload.status || 'publish',
      sku: payload.sku || 'MOCK-SKU',
      price: payload.regular_price || '0.00',
      regular_price: payload.regular_price || '0.00',
      description: payload.description || '',
      short_description: payload.short_description || '',
      categories: [],
      images: [],
      attributes: payload.attributes || [],
      variations: [],
      date_created: new Date().toISOString(),
      date_modified: new Date().toISOString(),
    };

    const updated: WooProductResponse = {
      ...existing,
      name: payload.name ?? existing.name,
      status: payload.status ?? existing.status,
      sku: payload.sku ?? existing.sku,
      regular_price: payload.regular_price ?? existing.regular_price,
      price: payload.regular_price ?? existing.price,
      description: payload.description ?? existing.description,
      short_description: payload.short_description ?? existing.short_description,
      attributes: payload.attributes ?? existing.attributes,
      date_modified: new Date().toISOString(),
    };

    WooMockAdapter.mockStore.set(wooId, updated);
    return updated;
  }

  async deleteProduct(wooId: number): Promise<{ id: number }> {
    WooMockAdapter.mockStore.delete(wooId);
    return { id: wooId };
  }

  async createVariation(wooProductId: number, payload: WooVariationPayload): Promise<WooVariationResponse> {
    const id = WooMockAdapter.nextVariationId++;
    const response: WooVariationResponse = {
      id,
      sku: payload.sku,
      price: payload.regular_price || '0.00',
      regular_price: payload.regular_price || '0.00',
      stock_quantity: payload.stock_quantity || 0,
      attributes: (payload.attributes || []).map((a, idx) => ({ id: 8000 + idx, name: a.name, option: a.option })),
    };

    WooMockAdapter.mockVariations.set(id, response);
    const parent = WooMockAdapter.mockStore.get(wooProductId);
    if (parent) {
      parent.variations.push(id);
    }
    return response;
  }

  async updateVariation(wooProductId: number, wooVariationId: number, payload: Partial<WooVariationPayload>): Promise<WooVariationResponse> {
    const existing = WooMockAdapter.mockVariations.get(wooVariationId) || {
      id: wooVariationId,
      sku: payload.sku || 'MOCK-VAR-SKU',
      price: payload.regular_price || '0.00',
      regular_price: payload.regular_price || '0.00',
      stock_quantity: payload.stock_quantity || 0,
      attributes: [],
    };

    const updated: WooVariationResponse = {
      ...existing,
      sku: payload.sku ?? existing.sku,
      regular_price: payload.regular_price ?? existing.regular_price,
      price: payload.regular_price ?? existing.price,
      stock_quantity: payload.stock_quantity ?? existing.stock_quantity,
    };

    WooMockAdapter.mockVariations.set(wooVariationId, updated);
    return updated;
  }
}
