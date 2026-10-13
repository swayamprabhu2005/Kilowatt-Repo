import { ProductRepository, type ProductListFilter } from './product.repository.js';
import { AttributeRepository } from '../attributes/attribute.repository.js';
import { AttributeService } from '../attributes/attribute.service.js';
import { CategoryRepository } from '../categories/category.repository.js';
import type { WorkspaceContext, ProductDTO } from '../../types/index.js';

export interface ProductValidationResult {
  isValid: boolean;
  isReadyForSync: boolean;
  errors: string[];
  warnings: string[];
}

export class ProductService {
  static list(ctx: WorkspaceContext, filter: ProductListFilter) {
    return ProductRepository.list(ctx, filter);
  }

  static getById(ctx: WorkspaceContext, id: string) {
    const p = ProductRepository.getById(ctx, id);
    if (!p) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Product not found.' };
    return p;
  }

  static create(ctx: WorkspaceContext, data: any) {
    // 1. SKU uniqueness within workspace
    const existingSku = ProductRepository.getBySku(ctx, data.sku);
    if (existingSku) {
      throw { statusCode: 409, code: 'DUPLICATE_SKU', message: `Product with SKU '${data.sku}' already exists in this workspace.` };
    }

    // 2. Validate dynamic attributes if provided
    if (data.attributes) {
      const defs = AttributeRepository.list(ctx);
      const validator = AttributeService.buildAttributeValidator(defs);
      data.attributes = validator.parse(data.attributes);
    }

    return ProductRepository.create(ctx, data);
  }

  static update(ctx: WorkspaceContext, id: string, data: any) {
    const existing = ProductRepository.getById(ctx, id);
    if (!existing) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Product not found.' };

    // Check SKU collision if changing SKU
    if (data.sku && data.sku !== existing.sku) {
      const coll = ProductRepository.getBySku(ctx, data.sku);
      if (coll && coll.id !== id) {
        throw { statusCode: 409, code: 'DUPLICATE_SKU', message: `Product with SKU '${data.sku}' already exists in this workspace.` };
      }
    }

    // Validate dynamic attributes if updated
    if (data.attributes !== undefined) {
      const defs = AttributeRepository.list(ctx);
      const validator = AttributeService.buildAttributeValidator(defs);
      data.attributes = validator.parse(data.attributes);
    }

    return ProductRepository.update(ctx, id, data);
  }

  static delete(ctx: WorkspaceContext, id: string) {
    return ProductRepository.delete(ctx, id);
  }

  static duplicate(ctx: WorkspaceContext, id: string) {
    return ProductRepository.duplicate(ctx, id);
  }

  static bulkAction(ctx: WorkspaceContext, action: string, productIds: string[], payload?: any) {
    let affected = 0;
    for (const id of productIds) {
      if (action === 'delete') {
        if (ProductRepository.delete(ctx, id)) affected++;
      } else if (action === 'status') {
        if (payload?.status) {
          ProductRepository.update(ctx, id, { status: payload.status });
          affected++;
        }
      }
    }
    return { success: true, affectedCount: affected };
  }

  /**
   * Evaluates product completeness and readiness to publish or sync to WooCommerce.
   */
  static validateProduct(ctx: WorkspaceContext, product: ProductDTO): ProductValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!product.name || product.name.trim().length === 0) {
      errors.push('Product name is required.');
    }
    if (!product.sku || product.sku.trim().length === 0) {
      errors.push('Product SKU is required.');
    }
    if (product.price === undefined || product.price === null || product.price < 0) {
      warnings.push('Product price is missing or zero.');
    }
    if (!product.description || product.description.trim().length < 20) {
      warnings.push('Product full description is short or missing (recommended >= 20 characters).');
    }
    if (!product.images || product.images.length === 0) {
      warnings.push('Product has no images attached.');
    }
    if (!product.categoryIds || product.categoryIds.length === 0) {
      warnings.push('Product is not assigned to any category.');
    }

    // Check mandatory attribute definitions
    const defs = AttributeRepository.list(ctx);
    for (const def of defs) {
      if (def.isRequired) {
        const val = product.attributes?.[def.code];
        if (val === undefined || val === null || val === '') {
          errors.push(`Mandatory attribute '${def.name}' (${def.code}) is missing.`);
        }
      }
    }

    const isValid = errors.length === 0;
    const isReadyForSync = isValid && (product.price !== undefined && product.price !== null);

    return {
      isValid,
      isReadyForSync,
      errors,
      warnings,
    };
  }

  /**
   * Generates CSV string of the workspace's product catalog.
   */
  static exportCsv(ctx: WorkspaceContext): string {
    const { items } = ProductRepository.list(ctx, { limit: 1000 });
    const headers = ['ID', 'Name', 'SKU', 'Type', 'Status', 'Price', 'Stock', 'Brand', 'Sync Status', 'Woo ID'];
    const rows = items.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${p.productType}"`,
      `"${p.status}"`,
      p.price ?? '',
      p.stockQuantity ?? '',
      `"${(p.brand || '').replace(/"/g, '""')}"`,
      `"${p.syncStatus}"`,
      p.wooProductId ?? '',
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Parses and imports CSV rows into the catalog.
   */
  static importCsv(ctx: WorkspaceContext, csvText: string) {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) throw { statusCode: 400, code: 'INVALID_CSV', message: 'CSV file is empty or missing data rows.' };

    let imported = 0;
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 3) {
        const [id, name, sku, type, status, price, stock, brand] = cols;
        if (name && sku) {
          const existing = ProductRepository.getBySku(ctx, sku);
          if (!existing) {
            ProductRepository.create(ctx, {
              name,
              sku,
              productType: type || 'simple',
              status: status || 'draft',
              price: price ? parseFloat(price) : null,
              stockQuantity: stock ? parseInt(stock, 10) : null,
              brand: brand || null,
            });
            imported++;
          }
        }
      }
    }
    return { success: true, importedCount: imported };
  }
}
