import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { SyncService } from './sync.service.js';
import { WooService } from '../../integrations/woocommerce/woo-service.js';
import type { AuthenticatedRequest } from '../../types/index.js';

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
    const status = WooService.getIntegrationStatus();
    res.json({ success: true, data: status });
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
