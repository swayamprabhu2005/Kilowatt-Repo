import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { CategoryRepository } from './category.repository.js';
import type { AuthenticatedRequest } from '../../types/index.js';

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  wooCategoryId: z.number().int().optional().nullable(),
});

export class CategoryController {
  static list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const items = CategoryRepository.list(req.workspaceCtx!);
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  static getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = CategoryRepository.getById(req.workspaceCtx!, req.params.id);
      if (!item) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found.' } });
        return;
      }
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  static create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = categorySchema.parse(req.body);
      const created = CategoryRepository.create(req.workspaceCtx!, data);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  static update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = categorySchema.partial().parse(req.body);
      const updated = CategoryRepository.update(req.workspaceCtx!, req.params.id, data);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      CategoryRepository.delete(req.workspaceCtx!, req.params.id);
      res.json({ success: true, data: { message: 'Category deleted successfully.' } });
    } catch (err) {
      next(err);
    }
  }
}
