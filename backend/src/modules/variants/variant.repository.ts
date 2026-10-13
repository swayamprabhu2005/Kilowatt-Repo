import crypto from 'crypto';
import { sqlite } from '../../db/index.js';
import type { WorkspaceContext, ProductVariantDTO, SyncStatus } from '../../types/index.js';

export class VariantRepository {
  static listByProduct(ctx: WorkspaceContext, productId: string): ProductVariantDTO[] {
    const rows = sqlite.prepare(`
      SELECT * FROM product_variants
      WHERE product_id = ? AND workspace_id = ?
      ORDER BY sku ASC
    `).all(productId, ctx.workspaceId) as any[];

    return rows.map(this.mapRow);
  }

  static getById(ctx: WorkspaceContext, id: string): ProductVariantDTO | null {
    const row = sqlite.prepare(`
      SELECT * FROM product_variants
      WHERE id = ? AND workspace_id = ?
    `).get(id, ctx.workspaceId) as any;

    return row ? this.mapRow(row) : null;
  }

  static getBySku(ctx: WorkspaceContext, sku: string): ProductVariantDTO | null {
    const row = sqlite.prepare(`
      SELECT * FROM product_variants
      WHERE sku = ? AND workspace_id = ?
    `).get(sku, ctx.workspaceId) as any;

    return row ? this.mapRow(row) : null;
  }

  static create(ctx: WorkspaceContext, productId: string, data: any): ProductVariantDTO {
    // 1. SKU uniqueness within workspace
    if (this.getBySku(ctx, data.sku)) {
      throw { statusCode: 409, code: 'DUPLICATE_SKU', message: `Variant SKU '${data.sku}' already exists.` };
    }

    // 2. Prevent duplicate attribute combinations on the same product
    const existing = this.listByProduct(ctx, productId);
    const newCombinationStr = JSON.stringify(data.attributeCombination || {});
    for (const v of existing) {
      if (JSON.stringify(v.attributeCombination) === newCombinationStr) {
        throw { statusCode: 409, code: 'DUPLICATE_COMBINATION', message: 'A variant with this exact attribute combination already exists for this product.' };
      }
    }

    const id = `var_${crypto.randomUUID().slice(0, 8)}`;
    const now = Date.now();

    sqlite.prepare(`
      INSERT INTO product_variants (
        id, product_id, workspace_id, sku, attribute_combination_json,
        price_override, stock_quantity, is_active, woo_variation_id, sync_status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      productId,
      ctx.workspaceId,
      data.sku.trim(),
      newCombinationStr,
      data.priceOverride !== undefined ? data.priceOverride : null,
      data.stockQuantity !== undefined ? data.stockQuantity : null,
      data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
      null,
      'not_synced',
      now,
      now
    );

    return this.getById(ctx, id)!;
  }

  static update(ctx: WorkspaceContext, id: string, data: any): ProductVariantDTO {
    const existing = this.getById(ctx, id);
    if (!existing) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Variant not found.' };

    if (data.sku && data.sku !== existing.sku) {
      const coll = this.getBySku(ctx, data.sku);
      if (coll && coll.id !== id) {
        throw { statusCode: 409, code: 'DUPLICATE_SKU', message: `Variant SKU '${data.sku}' already exists.` };
      }
    }

    const now = Date.now();
    const sku = data.sku !== undefined ? data.sku.trim() : existing.sku;
    const combJson = data.attributeCombination !== undefined ? JSON.stringify(data.attributeCombination) : JSON.stringify(existing.attributeCombination);
    const price = data.priceOverride !== undefined ? data.priceOverride : existing.priceOverride;
    const stock = data.stockQuantity !== undefined ? data.stockQuantity : existing.stockQuantity;
    const isActive = data.isActive !== undefined ? (data.isActive ? 1 : 0) : (existing.isActive ? 1 : 0);
    const wooId = data.wooVariationId !== undefined ? data.wooVariationId : existing.wooVariationId;
    const syncStatus = data.syncStatus !== undefined ? data.syncStatus : existing.syncStatus;

    sqlite.prepare(`
      UPDATE product_variants
      SET sku = ?, attribute_combination_json = ?, price_override = ?, stock_quantity = ?,
          is_active = ?, woo_variation_id = ?, sync_status = ?, updated_at = ?
      WHERE id = ? AND workspace_id = ?
    `).run(sku, combJson, price, stock, isActive, wooId, syncStatus, now, id, ctx.workspaceId);

    return this.getById(ctx, id)!;
  }

  static delete(ctx: WorkspaceContext, id: string): boolean {
    const existing = this.getById(ctx, id);
    if (!existing) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Variant not found.' };

    const info = sqlite.prepare('DELETE FROM product_variants WHERE id = ? AND workspace_id = ?').run(id, ctx.workspaceId);
    return info.changes > 0;
  }

  private static mapRow(row: any): ProductVariantDTO {
    let attributeCombination = {};
    try {
      attributeCombination = JSON.parse(row.attribute_combination_json || '{}');
    } catch {}

    return {
      id: row.id,
      productId: row.product_id,
      workspaceId: row.workspace_id,
      sku: row.sku,
      attributeCombination,
      priceOverride: row.price_override,
      stockQuantity: row.stock_quantity,
      isActive: Boolean(row.is_active),
      wooVariationId: row.woo_variation_id,
      syncStatus: row.sync_status as SyncStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
