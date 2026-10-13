import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AttributeService } from './attribute.service.js';
import type { AuthenticatedRequest } from '../../types/index.js';

const createAttributeSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/, 'Code must be lowercase alphanumeric and underscores only'),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  dataType: z.enum(['text', 'number', 'boolean', 'select', 'multiselect', 'date']),
  isRequired: z.boolean().default(false),
  isFilterable: z.boolean().default(true),
  isVariantParam: z.boolean().default(false),
  applicableProductTypes: z.array(z.string()).optional(),
  options: z.array(z.string()).optional(),
  validationRules: z.record(z.any()).optional(),
});

const updateAttributeSchema = createAttributeSchema.partial().omit({ code: true, dataType: true });

export class AttributeController {
  static list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const items = AttributeService.list(req.workspaceCtx!);
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  static getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = AttributeService.getById(req.workspaceCtx!, req.params.id);
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  static create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = createAttributeSchema.parse(req.body);
      const created = AttributeService.create(req.workspaceCtx!, data);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  static update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = updateAttributeSchema.parse(req.body);
      const updated = AttributeService.update(req.workspaceCtx!, req.params.id, data);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      AttributeService.delete(req.workspaceCtx!, req.params.id);
      res.json({ success: true, data: { message: 'Attribute definition deleted successfully.' } });
    } catch (err) {
      next(err);
    }
  }
}
