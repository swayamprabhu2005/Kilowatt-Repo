import type { Request } from 'express';

export interface WorkspaceContext {
  userId: string;
  workspaceId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  userEmail: string;
  userName: string;
}

export interface AuthenticatedRequest extends Request<Record<string, string>, any, any, any> {
  workspaceCtx?: WorkspaceContext;
  sessionToken?: string;
}

export type ProductType = 'simple' | 'variable';
export type ProductStatus = 'draft' | 'published' | 'archived';
export type SyncStatus = 'not_synced' | 'pending' | 'syncing' | 'synced' | 'failed';

export type AttributeDataType = 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date';

export interface AttributeDefinitionDTO {
  id: string;
  workspaceId: string;
  code: string;
  name: string;
  description?: string | null;
  dataType: AttributeDataType;
  isRequired: boolean;
  isFilterable: boolean;
  isVariantParam: boolean;
  applicableProductTypes: string[];
  options: string[];
  validationRules: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface ProductMediaDTO {
  url: string;
  alt?: string;
}

export interface ProductDTO {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  sku: string;
  productType: ProductType;
  status: ProductStatus;
  brand?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  price?: number | null;
  stockQuantity?: number | null;
  attributes: Record<string, any>;
  images: ProductMediaDTO[];
  categoryIds: string[];
  wooProductId?: number | null;
  syncStatus: SyncStatus;
  lastSyncAt?: number | null;
  syncError?: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ProductVariantDTO {
  id: string;
  productId: string;
  workspaceId: string;
  sku: string;
  attributeCombination: Record<string, string>;
  priceOverride?: number | null;
  stockQuantity?: number | null;
  isActive: boolean;
  wooVariationId?: number | null;
  syncStatus: SyncStatus;
  createdAt: number;
  updatedAt: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    requestId?: string;
  };
}
