import type { Response, NextFunction } from 'express';
import { sqlite } from '../../db/index.js';
import type { AuthenticatedRequest } from '../../types/index.js';

export class DashboardController {
  static getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const wsId = req.workspaceCtx!.workspaceId;

      const counts = sqlite.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
          SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived,
          SUM(CASE WHEN sync_status = 'synced' THEN 1 ELSE 0 END) as synced,
          SUM(CASE WHEN sync_status = 'failed' THEN 1 ELSE 0 END) as sync_failed,
          SUM(CASE WHEN sync_status = 'pending' OR sync_status = 'syncing' THEN 1 ELSE 0 END) as sync_pending,
          SUM(CASE WHEN (price IS NULL OR price = 0) OR sync_status = 'failed' THEN 1 ELSE 0 END) as needs_attention
        FROM products
        WHERE workspace_id = ?
      `).get(wsId) as any;

      const recentProducts = sqlite.prepare(`
        SELECT id, name, sku, status, sync_status, price, updated_at
        FROM products
        WHERE workspace_id = ?
        ORDER BY updated_at DESC
        LIMIT 5
      `).all(wsId);

      const recentSyncs = sqlite.prepare(`
        SELECT j.id, j.operation_type, j.status, j.finished_at, j.created_at, j.error_message,
               p.name as product_name, p.sku as product_sku
        FROM sync_jobs j
        LEFT JOIN products p ON p.id = j.product_id
        WHERE j.workspace_id = ?
        ORDER BY j.created_at DESC
        LIMIT 5
      `).all(wsId);

      res.json({
        success: true,
        data: {
          metrics: {
            totalProducts: counts.total || 0,
            publishedProducts: counts.published || 0,
            draftProducts: counts.draft || 0,
            archivedProducts: counts.archived || 0,
            syncedProducts: counts.synced || 0,
            syncFailedProducts: counts.sync_failed || 0,
            syncPendingProducts: counts.sync_pending || 0,
            needsAttentionProducts: counts.needs_attention || 0,
          },
          recentProducts,
          recentSyncs,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
