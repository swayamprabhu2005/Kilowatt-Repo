import { WooMockAdapter } from './woo-mock-adapter.js';
import { WooClient } from './woo-client.js';
import type { WooAdapterInterface, WooConnectionTestResult } from './woo-types.js';

export class WooService {
  private static mockAdapter = new WooMockAdapter();
  private static liveClient = new WooClient();

  static getAdapter(): WooAdapterInterface {
    const mode = (process.env.INTEGRATION_MODE || 'mock').toLowerCase();
    if (mode === 'woocommerce') {
      return this.liveClient;
    }
    return this.mockAdapter;
  }

  static getMockAdapter(): WooMockAdapter {
    return this.mockAdapter;
  }

  static async testConnection(): Promise<WooConnectionTestResult> {
    const adapter = this.getAdapter();
    return adapter.verifyConnection();
  }

  static getIntegrationStatus() {
    const mode = (process.env.INTEGRATION_MODE || 'mock').toLowerCase();
    const isMock = mode !== 'woocommerce';
    const storeUrl = process.env.WOOCOMMERCE_STORE_URL || 'https://mock.orivanta.local';
    const hasKey = Boolean(process.env.WOOCOMMERCE_CONSUMER_KEY);
    const hasSecret = Boolean(process.env.WOOCOMMERCE_CONSUMER_SECRET);

    return {
      mode: isMock ? 'mock' : 'woocommerce',
      isMock,
      storeUrl,
      isConfigured: isMock ? true : (hasKey && hasSecret),
      lastChecked: Date.now(),
    };
  }
}
