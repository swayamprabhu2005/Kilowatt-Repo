export interface WooAttributeItem {
  id?: number;
  name: string;
  position?: number;
  visible?: boolean;
  variation?: boolean;
  options: string[];
}

export interface WooImageItem {
  id?: number;
  src: string;
  name?: string;
  alt?: string;
}

export interface WooCategoryItem {
  id: number;
  name?: string;
  slug?: string;
}

export interface WooProductPayload {
  name: string;
  type: 'simple' | 'variable';
  status: 'publish' | 'draft' | 'private' | 'pending';
  sku: string;
  regular_price?: string;
  description?: string;
  short_description?: string;
  categories?: Array<{ id: number }>;
  images?: WooImageItem[];
  attributes?: WooAttributeItem[];
  manage_stock?: boolean;
  stock_quantity?: number;
}

export interface WooProductResponse {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: string;
  status: string;
  sku: string;
  price: string;
  regular_price: string;
  description: string;
  short_description: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  images: Array<{ id: number; src: string; name: string; alt: string }>;
  attributes: WooAttributeItem[];
  variations: number[];
  date_created: string;
  date_modified: string;
}

export interface WooVariationPayload {
  sku: string;
  regular_price?: string;
  manage_stock?: boolean;
  stock_quantity?: number;
  attributes: Array<{
    id?: number;
    name: string;
    option: string;
  }>;
}

export interface WooVariationResponse {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  stock_quantity: number;
  attributes: Array<{
    id: number;
    name: string;
    option: string;
  }>;
}

export interface WooConnectionTestResult {
  success: boolean;
  mode: 'mock' | 'woocommerce';
  storeUrl: string;
  storeName?: string;
  version?: string;
  error?: string;
  checkedAt: number;
}

export interface WooAdapterInterface {
  verifyConnection(): Promise<WooConnectionTestResult>;
  createProduct(payload: WooProductPayload): Promise<WooProductResponse>;
  updateProduct(wooId: number, payload: Partial<WooProductPayload>): Promise<WooProductResponse>;
  deleteProduct(wooId: number): Promise<{ id: number }>;
  createVariation(wooProductId: number, payload: WooVariationPayload): Promise<WooVariationResponse>;
  updateVariation(wooProductId: number, wooVariationId: number, payload: Partial<WooVariationPayload>): Promise<WooVariationResponse>;
}
