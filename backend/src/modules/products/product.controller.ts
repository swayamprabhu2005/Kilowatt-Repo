import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { ProductService } from './product.service.js';
import type { AuthenticatedRequest } from '../../types/index.js';

const productSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().optional(),
  sku: z.string().min(1).max(100),
  productType: z.enum(['simple', 'variable']).default('simple'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  brand: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative().optional().nullable(),
  stockQuantity: z.number().int().nonnegative().optional().nullable(),
  attributes: z.record(z.any()).optional().default({}),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().optional() })).optional().default([]),
  categoryIds: z.array(z.string()).optional().default([]),
});

const bulkActionSchema = z.object({
  action: z.enum(['delete', 'status']),
  productIds: z.array(z.string()).min(1),
  payload: z.record(z.any()).optional(),
});

export class ProductController {
  static list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const syncStatus = req.query.syncStatus as string | undefined;
      const categoryId = req.query.categoryId as string | undefined;
      const sortBy = req.query.sortBy as any;
      const sortOrder = req.query.sortOrder as any;

      const result = ProductService.list(req.workspaceCtx!, {
        page,
        limit,
        search,
        status,
        syncStatus,
        categoryId,
        sortBy,
        sortOrder,
      });

      res.json({
        success: true,
        data: result.items,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = ProductService.getById(req.workspaceCtx!, req.params.id);
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  static create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = productSchema.parse(req.body);
      const created = ProductService.create(req.workspaceCtx!, data);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  static update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = productSchema.partial().parse(req.body);
      const updated = ProductService.update(req.workspaceCtx!, req.params.id, data);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      ProductService.delete(req.workspaceCtx!, req.params.id);
      res.json({ success: true, data: { message: 'Product deleted successfully.' } });
    } catch (err) {
      next(err);
    }
  }

  static duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const duplicated = ProductService.duplicate(req.workspaceCtx!, req.params.id);
      res.status(201).json({ success: true, data: duplicated });
    } catch (err) {
      next(err);
    }
  }

  static bulkAction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { action, productIds, payload } = bulkActionSchema.parse(req.body);
      const result = ProductService.bulkAction(req.workspaceCtx!, action, productIds, payload);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static validate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const product = ProductService.getById(req.workspaceCtx!, req.params.id);
      const report = ProductService.validateProduct(req.workspaceCtx!, product);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  static exportCsv(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const csv = ProductService.exportCsv(req.workspaceCtx!);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="orivanta-catalogue.csv"');
      res.send(csv);
    } catch (err) {
      next(err);
    }
  }

  static importCsv(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const csvText = req.body?.csvText || (typeof req.body === 'string' ? req.body : '');
      const result = ProductService.importCsv(req.workspaceCtx!, csvText);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
