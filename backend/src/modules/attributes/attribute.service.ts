import { z } from 'zod';
import { AttributeRepository } from './attribute.repository.js';
import type { WorkspaceContext, AttributeDefinitionDTO } from '../../types/index.js';

export class AttributeService {
  static list(ctx: WorkspaceContext) {
    return AttributeRepository.list(ctx);
  }

  static getById(ctx: WorkspaceContext, id: string) {
    const attr = AttributeRepository.getById(ctx, id);
    if (!attr) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Attribute definition not found.' };
    return attr;
  }

  static create(ctx: WorkspaceContext, data: any) {
    // Check code uniqueness within workspace
    const existing = AttributeRepository.getByCode(ctx, data.code);
    if (existing) {
      throw { statusCode: 409, code: 'DUPLICATE_CODE', message: `Attribute code '${data.code}' already exists in this workspace.` };
    }
    return AttributeRepository.create(ctx, data);
  }

  static update(ctx: WorkspaceContext, id: string, data: any) {
    return AttributeRepository.update(ctx, id, data);
  }

  static delete(ctx: WorkspaceContext, id: string) {
    return AttributeRepository.delete(ctx, id);
  }

  /**
   * Builds dynamic Zod validation schema from active attribute definitions
   * for validating product attributes JSON object.
   */
  static buildAttributeValidator(definitions: AttributeDefinitionDTO[], requireMandatory = false) {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const def of definitions) {
      let fieldSchema: z.ZodTypeAny;

      switch (def.dataType) {
        case 'number': {
          let num = z.number();
          if (def.validationRules.min !== undefined) num = num.min(def.validationRules.min);
          if (def.validationRules.max !== undefined) num = num.max(def.validationRules.max);
          fieldSchema = num;
          break;
        }
        case 'boolean':
          fieldSchema = z.boolean();
          break;
        case 'select': {
          if (def.options && def.options.length > 0) {
            fieldSchema = z.enum(def.options as [string, ...string[]]);
          } else {
            fieldSchema = z.string();
          }
          break;
        }
        case 'multiselect': {
          if (def.options && def.options.length > 0) {
            fieldSchema = z.array(z.enum(def.options as [string, ...string[]]));
          } else {
            fieldSchema = z.array(z.string());
          }
          break;
        }
        case 'date':
          fieldSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Expected YYYY-MM-DD date format');
          break;
        case 'text':
        default: {
          let str = z.string();
          if (def.validationRules.minLength !== undefined) str = str.min(def.validationRules.minLength);
          if (def.validationRules.maxLength !== undefined) str = str.max(def.validationRules.maxLength);
          fieldSchema = str;
          break;
        }
      }

      if (!def.isRequired || !requireMandatory) {
        fieldSchema = fieldSchema.optional().nullable();
      }

      shape[def.code] = fieldSchema;
    }

    return z.object(shape).passthrough();
  }
}
