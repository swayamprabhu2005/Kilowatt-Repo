import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { VariantRepository } from './variant.repository.js';
import { ProductRepository } from '../products/product.repository.js';
import type { AuthenticatedRequest } from '../../types/index.js';

const variantSchema = z.object({
  sku: z.string().min(1).max(100),
  attributeCombination: z.record(z.string()).default({}),
  priceOverride: z.number().nonnegative().optional().nullable(),
  stockQuantity: z.number().int().nonnegative().optional().nullable(),
  isActive: z.boolean().default(true),
});

export class VariantController {
  static listByProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const product = ProductRepository.getById(req.workspaceCtx!, req.params.productId);
      if (!product) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Parent product not found.' } });
        return;
      }
      const items = VariantRepository.listByProduct(req.workspaceCtx!, req.params.productId);
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  static create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const product = ProductRepository.getById(req.workspaceCtx!, req.params.productId);
      if (!product) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Parent product not found.' } });
        return;
      }
      const data = variantSchema.parse(req.body);
      const created = VariantRepository.create(req.workspaceCtx!, req.params.productId, data);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  static update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = variantSchema.partial().parse(req.body);
      const updated = VariantRepository.update(req.workspaceCtx!, req.params.id, data);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      VariantRepository.delete(req.workspaceCtx!, req.params.id);
      res.json({ success: true, data: { message: 'Variant deleted successfully.' } });
    } catch (err) {
      next(err);
    }
  }
}
