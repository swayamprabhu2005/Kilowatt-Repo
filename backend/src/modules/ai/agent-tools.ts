import { z } from 'zod';
import { ProductRepository } from '../products/product.repository.js';
import { ProductService } from '../products/product.service.js';
import { AttributeRepository } from '../attributes/attribute.repository.js';
import { CategoryRepository } from '../categories/category.repository.js';
import { VariantRepository } from '../variants/variant.repository.js';
import { SyncService } from '../sync/sync.service.js';
import type { WorkspaceContext } from '../../types/index.js';

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodObject<any>;
  execute: (ctx: WorkspaceContext, args: any) => Promise<any> | any;
}

export const agentToolRegistry: Record<string, AgentToolDefinition> = {
  get_product: {
    name: 'get_product',
    description: 'Fetches full product details by internal product ID within the active workspace.',
    parameters: z.object({
      productId: z.string().describe('The internal ID of the product to fetch.'),
    }),
    execute: (ctx, { productId }) => {
      const p = ProductRepository.getById(ctx, productId);
      if (!p) return { error: `Product with ID '${productId}' not found in active workspace.` };
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        productType: p.productType,
        status: p.status,
        price: p.price,
        stockQuantity: p.stockQuantity,
        brand: p.brand,
        shortDescription: p.shortDescription,
        description: p.description,
        attributes: p.attributes,
        categoryIds: p.categoryIds,
        syncStatus: p.syncStatus,
        wooProductId: p.wooProductId,
      };
    },
  },

  search_products: {
    name: 'search_products',
    description: 'Searches products by keyword, status, category, or sync status with pagination limit.',
    parameters: z.object({
      query: z.string().optional().describe('Keyword search term matching name, SKU, or brand.'),
      status: z.enum(['all', 'draft', 'published', 'archived']).optional(),
      syncStatus: z.enum(['all', 'not_synced', 'pending', 'syncing', 'synced', 'failed']).optional(),
      limit: z.number().int().min(1).max(20).default(5),
    }),
    execute: (ctx, { query, status, syncStatus, limit }) => {
      const res = ProductRepository.list(ctx, { search: query, status, syncStatus, limit });
      return {
        totalMatches: res.total,
        returnedCount: res.items.length,
        products: res.items.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          status: p.status,
          syncStatus: p.syncStatus,
          price: p.price,
        })),
      };
    },
  },

  get_attribute_definitions: {
    name: 'get_attribute_definitions',
    description: 'Retrieves all dynamic attribute definitions and allowed options for the workspace.',
    parameters: z.object({
      productType: z.string().optional().describe('Filter by applicable product type (e.g. simple, variable)'),
    }),
    execute: (ctx) => {
      const defs = AttributeRepository.list(ctx);
      return defs.map((d) => ({
        code: d.code,
        name: d.name,
        dataType: d.dataType,
        isRequired: d.isRequired,
        isVariantParam: d.isVariantParam,
        options: d.options,
        validationRules: d.validationRules,
      }));
    },
  },

  get_categories: {
    name: 'get_categories',
    description: 'Lists all product categories and WooCommerce mappings in the workspace.',
    parameters: z.object({}),
    execute: (ctx) => {
      const cats = CategoryRepository.list(ctx);
      return cats.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parentId,
        wooCategoryId: c.wooCategoryId,
      }));
    },
  },

  validate_product: {
    name: 'validate_product',
    description: 'Runs backend completeness and sync-readiness validation on a product.',
    parameters: z.object({
      productId: z.string().describe('Internal ID of the product to validate.'),
    }),
    execute: (ctx, { productId }) => {
      const p = ProductRepository.getById(ctx, productId);
      if (!p) return { error: `Product '${productId}' not found.` };
      return ProductService.validateProduct(ctx, p);
    },
  },

  get_product_variants: {
    name: 'get_product_variants',
    description: 'Retrieves all child variants and attribute combinations for a variable product.',
    parameters: z.object({
      productId: z.string().describe('Internal parent product ID.'),
    }),
    execute: (ctx, { productId }) => {
      const variants = VariantRepository.listByProduct(ctx, productId);
      return variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        attributeCombination: v.attributeCombination,
        priceOverride: v.priceOverride,
        stockQuantity: v.stockQuantity,
        syncStatus: v.syncStatus,
      }));
    },
  },

  get_sync_history: {
    name: 'get_sync_history',
    description: 'Fetches recent sync jobs and error diagnostics for a product or workspace.',
    parameters: z.object({
      productId: z.string().optional().describe('Optional product ID filter.'),
      limit: z.number().int().min(1).max(10).default(5),
    }),
    execute: (ctx, { productId, limit }) => {
      const jobs = SyncService.listJobs(ctx, limit);
      const filtered = productId ? jobs.filter((j) => j.productId === productId) : jobs;
      return filtered.map((j) => ({
        id: j.id,
        operationType: j.operationType,
        status: j.status,
        attemptCount: j.attemptCount,
        errorCode: j.errorCode,
        errorMessage: j.errorMessage,
        createdAt: j.createdAt,
      }));
    },
  },

  compare_product_changes: {
    name: 'compare_product_changes',
    description: 'Computes a field-level before/after diff for a proposed product patch without saving.',
    parameters: z.object({
      productId: z.string().describe('Target product ID.'),
      proposedPatch: z.record(z.any()).describe('Dictionary of proposed field changes.'),
    }),
    execute: (ctx, { productId, proposedPatch }) => {
      const p = ProductRepository.getById(ctx, productId);
      if (!p) return { error: `Product '${productId}' not found.` };

      const diff: Record<string, { before: any; after: any }> = {};
      for (const [key, afterVal] of Object.entries(proposedPatch)) {
        const beforeVal = (p as any)[key];
        if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
          diff[key] = { before: beforeVal ?? null, after: afterVal };
        }
      }
      return {
        productId,
        productName: p.name,
        changedFieldsCount: Object.keys(diff).length,
        diff,
      };
    },
  },
};
