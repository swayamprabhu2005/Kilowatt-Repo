import crypto from 'crypto';
import { sqlite } from '../../db/index.js';
import type { WorkspaceContext, ProductDTO, ProductStatus, SyncStatus, ProductType } from '../../types/index.js';

export interface ProductListFilter {
  search?: string;
  status?: string;
  syncStatus?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'sku' | 'updatedAt' | 'createdAt' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export class ProductRepository {
  static list(ctx: WorkspaceContext, filter: ProductListFilter = {}) {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['p.workspace_id = ?'];
    const params: any[] = [ctx.workspaceId];

    if (filter.search) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR p.brand LIKE ?)');
      const term = `%${filter.search}%`;
      params.push(term, term, term);
    }

    if (filter.status && filter.status !== 'all') {
      conditions.push('p.status = ?');
      params.push(filter.status);
    }

    if (filter.syncStatus && filter.syncStatus !== 'all') {
      conditions.push('p.sync_status = ?');
      params.push(filter.syncStatus);
    }

    if (filter.categoryId && filter.categoryId !== 'all') {
      conditions.push('EXISTS (SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id = ?)');
      params.push(filter.categoryId);
    }

    const whereClause = conditions.join(' AND ');

    // Total count
    const countRow = sqlite.prepare(`
      SELECT COUNT(*) as count FROM products p WHERE ${whereClause}
    `).get(...params) as { count: number };
    const total = countRow.count;

    const sortCol = filter.sortBy === 'sku' ? 'p.sku'
      : filter.sortBy === 'name' ? 'p.name'
      : filter.sortBy === 'price' ? 'p.price'
      : filter.sortBy === 'createdAt' ? 'p.created_at'
      : 'p.updated_at';
    const sortDir = filter.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const rows = sqlite.prepare(`
      SELECT p.* FROM products p
      WHERE ${whereClause}
      ORDER BY ${sortCol} ${sortDir}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as any[];

    const items = rows.map((r) => this.mapRow(ctx, r));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static getById(ctx: WorkspaceContext, id: string): ProductDTO | null {
    const row = sqlite.prepare(`
      SELECT * FROM products
      WHERE id = ? AND workspace_id = ?
    `).get(id, ctx.workspaceId) as any;

    return row ? this.mapRow(ctx, row) : null;
  }

  static getBySku(ctx: WorkspaceContext, sku: string): ProductDTO | null {
    const row = sqlite.prepare(`
      SELECT * FROM products
      WHERE sku = ? AND workspace_id = ?
    `).get(sku, ctx.workspaceId) as any;

    return row ? this.mapRow(ctx, row) : null;
  }

  static create(ctx: WorkspaceContext, data: any): ProductDTO {
    const id = `prod_${crypto.randomUUID().slice(0, 8)}`;
    const now = Date.now();
    const slug = (data.slug || data.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const attrJson = JSON.stringify(data.attributes || {});
    const imgJson = JSON.stringify(data.images || []);

    sqlite.prepare(`
      INSERT INTO products (
        id, workspace_id, name, slug, sku, product_type, status, brand,
        short_description, description, price, stock_quantity, attributes_json, images_json,
        woo_product_id, sync_status, last_sync_at, sync_error, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      ctx.workspaceId,
      data.name.trim(),
      slug,
      data.sku.trim(),
      data.productType || 'simple',
      data.status || 'draft',
      data.brand || null,
      data.shortDescription || null,
      data.description || null,
      data.price !== undefined ? data.price : null,
      data.stockQuantity !== undefined ? data.stockQuantity : null,
      attrJson,
      imgJson,
      null,
      'not_synced',
      null,
      null,
      now,
      now
    );

    // Save categories
    if (Array.isArray(data.categoryIds)) {
      this.setProductCategories(ctx, id, data.categoryIds);
    }

    return this.getById(ctx, id)!;
  }

  static update(ctx: WorkspaceContext, id: string, data: any): ProductDTO {
    const existing = this.getById(ctx, id);
    if (!existing) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Product not found.' };

    const now = Date.now();
    const name = data.name !== undefined ? data.name.trim() : existing.name;
    const slug = data.slug !== undefined ? data.slug.trim() : existing.slug;
    const sku = data.sku !== undefined ? data.sku.trim() : existing.sku;
    const productType = data.productType !== undefined ? data.productType : existing.productType;
    const status = data.status !== undefined ? data.status : existing.status;
    const brand = data.brand !== undefined ? data.brand : existing.brand;
    const shortDesc = data.shortDescription !== undefined ? data.shortDescription : existing.shortDescription;
    const desc = data.description !== undefined ? data.description : existing.description;
    const price = data.price !== undefined ? data.price : existing.price;
    const stock = data.stockQuantity !== undefined ? data.stockQuantity : existing.stockQuantity;
    const attrJson = data.attributes !== undefined ? JSON.stringify(data.attributes) : JSON.stringify(existing.attributes);
    const imgJson = data.images !== undefined ? JSON.stringify(data.images) : JSON.stringify(existing.images);
    const syncStatus = data.syncStatus !== undefined ? data.syncStatus : existing.syncStatus;
    const wooProductId = data.wooProductId !== undefined ? data.wooProductId : existing.wooProductId;
    const lastSyncAt = data.lastSyncAt !== undefined ? data.lastSyncAt : existing.lastSyncAt;
    const syncError = data.syncError !== undefined ? data.syncError : existing.syncError;

    sqlite.prepare(`
      UPDATE products
      SET name = ?, slug = ?, sku = ?, product_type = ?, status = ?, brand = ?,
          short_description = ?, description = ?, price = ?, stock_quantity = ?,
          attributes_json = ?, images_json = ?, sync_status = ?, woo_product_id = ?,
          last_sync_at = ?, sync_error = ?, updated_at = ?
      WHERE id = ? AND workspace_id = ?
    `).run(
      name, slug, sku, productType, status, brand,
      shortDesc, desc, price, stock,
      attrJson, imgJson, syncStatus, wooProductId,
      lastSyncAt, syncError, now,
      id, ctx.workspaceId
    );

    if (Array.isArray(data.categoryIds)) {
      this.setProductCategories(ctx, id, data.categoryIds);
    }

    return this.getById(ctx, id)!;
  }

  static delete(ctx: WorkspaceContext, id: string): boolean {
    const existing = this.getById(ctx, id);
    if (!existing) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Product not found.' };

    const info = sqlite.prepare('DELETE FROM products WHERE id = ? AND workspace_id = ?').run(id, ctx.workspaceId);
    return info.changes > 0;
  }

  static duplicate(ctx: WorkspaceContext, id: string): ProductDTO {
    const existing = this.getById(ctx, id);
    if (!existing) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Product to duplicate not found.' };

    // Find unique copy SKU
    let copySku = `${existing.sku}-COPY`;
    let count = 1;
    while (this.getBySku(ctx, copySku)) {
      count++;
      copySku = `${existing.sku}-COPY-${count}`;
    }

    return this.create(ctx, {
      name: `${existing.name} (Copy)`,
      slug: `${existing.slug}-copy-${count}`,
      sku: copySku,
      productType: existing.productType,
      status: 'draft',
      brand: existing.brand,
      shortDescription: existing.shortDescription,
      description: existing.description,
      price: existing.price,
      stockQuantity: existing.stockQuantity,
      attributes: existing.attributes,
      images: existing.images,
      categoryIds: existing.categoryIds,
    });
  }

  private static setProductCategories(ctx: WorkspaceContext, productId: string, categoryIds: string[]) {
    sqlite.prepare('DELETE FROM product_categories WHERE product_id = ? AND workspace_id = ?').run(productId, ctx.workspaceId);
    const insert = sqlite.prepare('INSERT INTO product_categories (id, product_id, category_id, workspace_id) VALUES (?, ?, ?, ?)');
    for (const catId of categoryIds) {
      insert.run(`pc_${crypto.randomUUID().slice(0, 8)}`, productId, catId, ctx.workspaceId);
    }
  }

  private static mapRow(ctx: WorkspaceContext, row: any): ProductDTO {
    let attributes = {};
    let images = [];
    try {
      attributes = JSON.parse(row.attributes_json || '{}');
    } catch {}
    try {
      images = JSON.parse(row.images_json || '[]');
    } catch {}

    const catRows = sqlite.prepare(`
      SELECT category_id FROM product_categories WHERE product_id = ? AND workspace_id = ?
    `).all(row.id, ctx.workspaceId) as { category_id: string }[];

    return {
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      slug: row.slug,
      sku: row.sku,
      productType: row.product_type as ProductType,
      status: row.status as ProductStatus,
      brand: row.brand,
      shortDescription: row.short_description,
      description: row.description,
      price: row.price,
      stockQuantity: row.stock_quantity,
      attributes,
      images,
      categoryIds: catRows.map((c) => c.category_id),
      wooProductId: row.woo_product_id,
      syncStatus: row.sync_status as SyncStatus,
      lastSyncAt: row.last_sync_at,
      syncError: row.sync_error,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
