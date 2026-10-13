import crypto from 'crypto';
import { sqlite } from '../../db/index.js';
import { ProductRepository } from '../products/product.repository.js';
import { ProductService } from '../products/product.service.js';
import { AttributeRepository } from '../attributes/attribute.repository.js';
import { CategoryRepository } from '../categories/category.repository.js';
import { VariantRepository } from '../variants/variant.repository.js';
import { WooService } from '../../integrations/woocommerce/woo-service.js';
import { WooMapper } from '../../integrations/woocommerce/woo-mapper.js';
import type { WorkspaceContext, ProductDTO, SyncStatus } from '../../types/index.js';

export interface SyncJobDTO {
  id: string;
  workspaceId: string;
  productId?: string | null;
  productName?: string;
  productSku?: string;
  integrationMode: 'mock' | 'woocommerce';
  operationType: 'create' | 'update' | 'delete' | 'bulk';
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  attemptCount: number;
  startedAt?: number | null;
  finishedAt?: number | null;
  wooId?: number | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt: number;
}

export class SyncService {
  static listJobs(ctx: WorkspaceContext, limit = 50): SyncJobDTO[] {
    const rows = sqlite.prepare(`
      SELECT j.*, p.name as product_name, p.sku as product_sku
      FROM sync_jobs j
      LEFT JOIN products p ON p.id = j.product_id
      WHERE j.workspace_id = ?
      ORDER BY j.created_at DESC
      LIMIT ?
    `).all(ctx.workspaceId, limit) as any[];

    return rows.map(this.mapJob);
  }

  static getJobById(ctx: WorkspaceContext, id: string): SyncJobDTO | null {
    const row = sqlite.prepare(`
      SELECT j.*, p.name as product_name, p.sku as product_sku
      FROM sync_jobs j
      LEFT JOIN products p ON p.id = j.product_id
      WHERE j.id = ? AND j.workspace_id = ?
    `).get(id, ctx.workspaceId) as any;

    return row ? this.mapJob(row) : null;
  }

  /**
   * Syncs a single product to WooCommerce idempotently.
   */
  static async syncProduct(ctx: WorkspaceContext, productId: string): Promise<SyncJobDTO> {
    const product = ProductRepository.getById(ctx, productId);
    if (!product) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Product to sync not found.' };

    // 1. Pre-sync Validation
    const validation = ProductService.validateProduct(ctx, product);
    if (!validation.isReadyForSync) {
      const issues = validation.errors.concat(validation.warnings);
      throw {
        statusCode: 422,
        code: 'VALIDATION_FAILED',
        message: `Product failed pre-sync validation: ${issues.join('; ')}`,
        details: issues,
      };
    }

    const mode = (process.env.INTEGRATION_MODE || 'mock').toLowerCase() as 'mock' | 'woocommerce';
    const isUpdate = Boolean(product.wooProductId);
    const operationType = isUpdate ? 'update' : 'create';
    const jobId = `job_${crypto.randomUUID().slice(0, 8)}`;
    const now = Date.now();

    // 2. Record intent to sync in database
    sqlite.prepare(`
      INSERT INTO sync_jobs (
        id, workspace_id, product_id, integration_mode, operation_type,
        status, attempt_count, started_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(jobId, ctx.workspaceId, productId, mode, operationType, 'syncing', 1, now, now);

    ProductRepository.update(ctx, productId, { syncStatus: 'syncing', syncError: null });

    try {
      const adapter = WooService.getAdapter();
      const defs = AttributeRepository.list(ctx);
      const catMappings = CategoryRepository.list(ctx)
        .filter((c) => typeof c.wooCategoryId === 'number')
        .map((c) => ({ pimId: c.id, wooCategoryId: c.wooCategoryId! }));

      const payload = WooMapper.toWooProductPayload(product, defs, catMappings);
      let wooId: number;

      if (isUpdate && product.wooProductId) {
        const res = await adapter.updateProduct(product.wooProductId, payload);
        wooId = res.id;
      } else {
        const res = await adapter.createProduct(payload);
        wooId = res.id;
      }

      // Handle variants for variable products
      if (product.productType === 'variable') {
        const variants = VariantRepository.listByProduct(ctx, product.id);
        for (const v of variants) {
          const varPayload = WooMapper.toWooVariationPayload(v, defs);
          if (v.wooVariationId) {
            await adapter.updateVariation(wooId, v.wooVariationId, varPayload);
          } else {
            const varRes = await adapter.createVariation(wooId, varPayload);
            VariantRepository.update(ctx, v.id, { wooVariationId: varRes.id, syncStatus: 'synced' });
          }
        }
      }

      const finished = Date.now();
      // 3. Mark success
      sqlite.prepare(`
        UPDATE sync_jobs
        SET status = 'synced', finished_at = ?, woo_id = ?, response_payload_sanitized = ?
        WHERE id = ? AND workspace_id = ?
      `).run(finished, wooId, JSON.stringify({ id: wooId, status: 'synced' }), jobId, ctx.workspaceId);

      ProductRepository.update(ctx, productId, {
        wooProductId: wooId,
        syncStatus: 'synced',
        lastSyncAt: finished,
        syncError: null,
      });

      return this.getJobById(ctx, jobId)!;
    } catch (err: any) {
      const finished = Date.now();
      const errMsg = err?.message || 'External sync failed.';

      sqlite.prepare(`
        UPDATE sync_jobs
        SET status = 'failed', finished_at = ?, error_code = 'SYNC_ERROR', error_message = ?
        WHERE id = ? AND workspace_id = ?
      `).run(finished, errMsg, jobId, ctx.workspaceId);

      ProductRepository.update(ctx, productId, {
        syncStatus: 'failed',
        syncError: errMsg,
      });

      return this.getJobById(ctx, jobId)!;
    }
  }

  /**
   * Bulk synchronisation of multiple products.
   */
  static async syncBulk(ctx: WorkspaceContext, productIds: string[]) {
    const results: SyncJobDTO[] = [];
    for (const id of productIds) {
      try {
        const job = await this.syncProduct(ctx, id);
        results.push(job);
      } catch (err: any) {
        results.push({
          id: `job_err_${id.slice(0, 6)}`,
          workspaceId: ctx.workspaceId,
          productId: id,
          integrationMode: 'mock',
          operationType: 'create',
          status: 'failed',
          attemptCount: 1,
          errorMessage: err.message || 'Validation or sync failed',
          createdAt: Date.now(),
        });
      }
    }
    return results;
  }

  /**
   * Retries a failed sync job idempotently.
   */
  static async retryJob(ctx: WorkspaceContext, jobId: string): Promise<SyncJobDTO> {
    const job = this.getJobById(ctx, jobId);
    if (!job) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Sync job not found.' };
    if (!job.productId) throw { statusCode: 400, code: 'NO_PRODUCT', message: 'Sync job has no associated product.' };

    // Increment attempt count
    sqlite.prepare('UPDATE sync_jobs SET attempt_count = attempt_count + 1 WHERE id = ?').run(jobId);

    // Re-execute sync
    return this.syncProduct(ctx, job.productId);
  }

  private static mapJob(row: any): SyncJobDTO {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      productId: row.product_id,
      productName: row.product_name,
      productSku: row.product_sku,
      integrationMode: row.integration_mode,
      operationType: row.operation_type,
      status: row.status,
      attemptCount: row.attempt_count,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      wooId: row.woo_id,
      errorCode: row.error_code,
      errorMessage: row.error_message,
      createdAt: row.created_at,
    };
  }
}
