import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { SyncService } from './sync.service.js';
import { WooService } from '../../integrations/woocommerce/woo-service.js';
import type { AuthenticatedRequest } from '../../types/index.js';

import { sqlite } from '../../db/index.js';

const bulkSyncSchema = z.object({
  productIds: z.array(z.string()).min(1),
});

export class SyncController {
  static listJobs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const jobs = SyncService.listJobs(req.workspaceCtx!, limit);
      res.json({ success: true, data: jobs });
    } catch (err) {
      next(err);
    }
  }

  static getJobById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const job = SyncService.getJobById(req.workspaceCtx!, req.params.id);
      if (!job) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sync job not found.' } });
        return;
      }
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  static async syncProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const job = await SyncService.syncProduct(req.workspaceCtx!, req.params.id);
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  static async syncBulk(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { productIds } = bulkSyncSchema.parse(req.body);
      const jobs = await SyncService.syncBulk(req.workspaceCtx!, productIds);
      res.json({ success: true, data: jobs });
    } catch (err) {
      next(err);
    }
  }

  static async retryJob(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const job = await SyncService.retryJob(req.workspaceCtx!, req.params.id);
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  static async testConnection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await WooService.testConnection();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static getStatus(req: AuthenticatedRequest, res: Response) {
    const wsId = req.workspaceCtx?.workspaceId;
    const isDemoWorkspace = wsId === 'ws_default';

    // Check if workspace integration record exists
    const wsIntegration = wsId
      ? (sqlite.prepare('SELECT * FROM workspace_integrations WHERE workspace_id = ?').get(wsId) as any)
      : null;

    if (!isDemoWorkspace || (wsIntegration && wsIntegration.integration_mode === 'woocommerce')) {
      const isLocked = Boolean(wsIntegration?.is_locked);
      const storeUrl = wsIntegration?.store_url || process.env.WOOCOMMERCE_STORE_URL || 'https://kilowatt-repo.local';
      const hasKey = Boolean(wsIntegration?.consumer_key || process.env.WOOCOMMERCE_CONSUMER_KEY);
      const maskedKey = wsIntegration?.consumer_key
        ? wsIntegration.consumer_key.slice(0, 7) + '...' + wsIntegration.consumer_key.slice(-4)
        : (process.env.WOOCOMMERCE_CONSUMER_KEY ? 'ck_live...locked' : '');

      res.json({
        success: true,
        data: {
          mode: 'woocommerce',
          isMock: false,
          isLive: true,
          storeUrl,
          hasCredentials: hasKey,
          maskedKey,
          isLocked,
          isNewWorkspace: !isLocked,
          lastChecked: Date.now(),
        },
      });
      return;
    }

    // Default demo workspace fallback
    const status = WooService.getIntegrationStatus();
    res.json({
      success: true,
      data: {
        ...status,
        isLive: !status.isMock,
        isLocked: true,
        isNewWorkspace: false,
      },
    });
  }

  static lockCredentials(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const lockSchema = z.object({
        storeUrl: z.string().min(1, 'Store URL is required'),
        consumerKey: z.string().min(5, 'Consumer Key is required'),
        consumerSecret: z.string().min(5, 'Consumer Secret is required'),
        lock: z.boolean().default(true),
      });

      const { storeUrl, consumerKey, consumerSecret, lock } = lockSchema.parse(req.body);
      const wsId = req.workspaceCtx!.workspaceId;
      const now = Date.now();

      sqlite.prepare(`
        INSERT INTO workspace_integrations (workspace_id, integration_mode, store_url, consumer_key, consumer_secret, is_locked, created_at, updated_at)
        VALUES (?, 'woocommerce', ?, ?, ?, ?, ?, ?)
        ON CONFLICT(workspace_id) DO UPDATE SET
          store_url = excluded.store_url,
          consumer_key = excluded.consumer_key,
          consumer_secret = excluded.consumer_secret,
          is_locked = excluded.is_locked,
          updated_at = excluded.updated_at
      `).run(wsId, storeUrl, consumerKey, consumerSecret, lock ? 1 : 0, now, now);

      res.json({
        success: true,
        data: {
          message: lock ? 'WooCommerce credentials successfully locked.' : 'WooCommerce credentials saved.',
          storeUrl,
          isLocked: lock,
          mode: 'woocommerce',
          isMock: false,
          isLive: true,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static simulateFailure(req: AuthenticatedRequest, res: Response) {
    const shouldFail = req.body?.fail !== false;
    WooService.getMockAdapter().setSimulateFailure(shouldFail);
    res.json({
      success: true,
      data: { message: shouldFail ? 'Next mock sync operation will simulate a failure.' : 'Mock failure simulation disabled.' },
    });
  }
}
