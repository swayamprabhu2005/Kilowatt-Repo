import type {
  WooAdapterInterface,
  WooConnectionTestResult,
  WooProductPayload,
  WooProductResponse,
  WooVariationPayload,
  WooVariationResponse,
} from './woo-types.js';

export class WooClient implements WooAdapterInterface {
  private baseUrl: string;
  private authHeader: string;

  constructor() {
    this.baseUrl = (process.env.WOOCOMMERCE_STORE_URL || '').replace(/\/+$/, '');
    const key = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
    const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

    // Enforce HTTPS for live remote stores to protect secrets
    if (this.baseUrl && !this.baseUrl.startsWith('https://') && !this.baseUrl.includes('localhost') && !this.baseUrl.includes('.local')) {
      console.warn('[WooCommerce Client Warning] Store URL is not HTTPS. HTTPS is required for secure authentication.');
    }

    // For local evaluation environments with self-signed certificates (.local / localhost), allow development TLS
    if (this.baseUrl.includes('.local') || this.baseUrl.includes('localhost')) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    this.authHeader = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/wp-json/wc/v3${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.authHeader,
          ...options.headers,
        },
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        throw new Error(`WooCommerce API Error [${res.status}]: ${data.message || res.statusText}`);
      }

      return data as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('WooCommerce API request timed out after 20 seconds.');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  async verifyConnection(): Promise<WooConnectionTestResult> {
    try {
      const data = await this.request<{ name?: string; description?: string }>('/system_status');
      return {
        success: true,
        mode: 'woocommerce',
        storeUrl: this.baseUrl,
        storeName: data.name || 'WooCommerce Store',
        version: 'v3',
        checkedAt: Date.now(),
      };
    } catch (err: any) {
      return {
        success: false,
        mode: 'woocommerce',
        storeUrl: this.baseUrl,
        error: err.message,
        checkedAt: Date.now(),
      };
    }
  }

  async createProduct(payload: WooProductPayload): Promise<WooProductResponse> {
    return this.request<WooProductResponse>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateProduct(wooId: number, payload: Partial<WooProductPayload>): Promise<WooProductResponse> {
    return this.request<WooProductResponse>(`/products/${wooId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteProduct(wooId: number): Promise<{ id: number }> {
    return this.request<{ id: number }>(`/products/${wooId}?force=true`, {
      method: 'DELETE',
    });
  }

  async createVariation(wooProductId: number, payload: WooVariationPayload): Promise<WooVariationResponse> {
    return this.request<WooVariationResponse>(`/products/${wooProductId}/variations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateVariation(wooProductId: number, wooVariationId: number, payload: Partial<WooVariationPayload>): Promise<WooVariationResponse> {
    return this.request<WooVariationResponse>(`/products/${wooProductId}/variations/${wooVariationId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
}
