import crypto from 'crypto';
import { sqlite } from '../../db/index.js';
import type { WorkspaceContext, AttributeDefinitionDTO, AttributeDataType } from '../../types/index.js';

export class AttributeRepository {
  static list(ctx: WorkspaceContext): AttributeDefinitionDTO[] {
    const rows = sqlite.prepare(`
      SELECT * FROM attribute_definitions
      WHERE workspace_id = ?
      ORDER BY name ASC
    `).all(ctx.workspaceId) as any[];

    return rows.map(this.mapRowToDTO);
  }

  static getById(ctx: WorkspaceContext, id: string): AttributeDefinitionDTO | null {
    const row = sqlite.prepare(`
      SELECT * FROM attribute_definitions
      WHERE id = ? AND workspace_id = ?
    `).get(id, ctx.workspaceId) as any;

    return row ? this.mapRowToDTO(row) : null;
  }

  static getByCode(ctx: WorkspaceContext, code: string): AttributeDefinitionDTO | null {
    const row = sqlite.prepare(`
      SELECT * FROM attribute_definitions
      WHERE code = ? AND workspace_id = ?
    `).get(code, ctx.workspaceId) as any;

    return row ? this.mapRowToDTO(row) : null;
  }

  static create(
    ctx: WorkspaceContext,
    data: {
      code: string;
      name: string;
      description?: string | null;
      dataType: AttributeDataType;
      isRequired: boolean;
      isFilterable: boolean;
      isVariantParam: boolean;
      applicableProductTypes?: string[];
      options?: string[];
      validationRules?: Record<string, any>;
    }
  ): AttributeDefinitionDTO {
    const id = `attr_${crypto.randomUUID().slice(0, 8)}`;
    const now = Date.now();
    const appTypes = data.applicableProductTypes?.join(',') || 'simple,variable';
    const optionsJson = JSON.stringify(data.options || []);
    const rulesJson = JSON.stringify(data.validationRules || {});

    sqlite.prepare(`
      INSERT INTO attribute_definitions (
        id, workspace_id, code, name, description, data_type, is_required,
        is_filterable, is_variant_param, applicable_product_types,
        options_json, validation_rules_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      ctx.workspaceId,
      data.code.toLowerCase().trim(),
      data.name.trim(),
      data.description || null,
      data.dataType,
      data.isRequired ? 1 : 0,
      data.isFilterable ? 1 : 0,
      data.isVariantParam ? 1 : 0,
      appTypes,
      optionsJson,
      rulesJson,
      now,
      now
    );

    return this.getById(ctx, id)!;
  }

  static update(
    ctx: WorkspaceContext,
    id: string,
    data: {
      name?: string;
      description?: string | null;
      isRequired?: boolean;
      isFilterable?: boolean;
      isVariantParam?: boolean;
      applicableProductTypes?: string[];
      options?: string[];
      validationRules?: Record<string, any>;
    }
  ): AttributeDefinitionDTO {
    const existing = this.getById(ctx, id);
    if (!existing) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Attribute definition not found.' };
    }

    const now = Date.now();
    const name = data.name !== undefined ? data.name.trim() : existing.name;
    const desc = data.description !== undefined ? data.description : existing.description;
    const req = data.isRequired !== undefined ? (data.isRequired ? 1 : 0) : (existing.isRequired ? 1 : 0);
    const filt = data.isFilterable !== undefined ? (data.isFilterable ? 1 : 0) : (existing.isFilterable ? 1 : 0);
    const varParam = data.isVariantParam !== undefined ? (data.isVariantParam ? 1 : 0) : (existing.isVariantParam ? 1 : 0);
    const appTypes = data.applicableProductTypes ? data.applicableProductTypes.join(',') : existing.applicableProductTypes.join(',');
    const optionsJson = data.options ? JSON.stringify(data.options) : JSON.stringify(existing.options);
    const rulesJson = data.validationRules ? JSON.stringify(data.validationRules) : JSON.stringify(existing.validationRules);

    sqlite.prepare(`
      UPDATE attribute_definitions
      SET name = ?, description = ?, is_required = ?, is_filterable = ?, is_variant_param = ?,
          applicable_product_types = ?, options_json = ?, validation_rules_json = ?, updated_at = ?
      WHERE id = ? AND workspace_id = ?
    `).run(name, desc, req, filt, varParam, appTypes, optionsJson, rulesJson, now, id, ctx.workspaceId);

    return this.getById(ctx, id)!;
  }

  static delete(ctx: WorkspaceContext, id: string): boolean {
    const existing = this.getById(ctx, id);
    if (!existing) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Attribute definition not found.' };
    }

    const info = sqlite.prepare('DELETE FROM attribute_definitions WHERE id = ? AND workspace_id = ?').run(id, ctx.workspaceId);
    return info.changes > 0;
  }

  private static mapRowToDTO(row: any): AttributeDefinitionDTO {
    let options: string[] = [];
    let validationRules: Record<string, any> = {};
    try {
      options = JSON.parse(row.options_json || '[]');
    } catch {}
    try {
      validationRules = JSON.parse(row.validation_rules_json || '{}');
    } catch {}

    return {
      id: row.id,
      workspaceId: row.workspace_id,
      code: row.code,
      name: row.name,
      description: row.description,
      dataType: row.data_type as AttributeDataType,
      isRequired: Boolean(row.is_required),
      isFilterable: Boolean(row.is_filterable),
      isVariantParam: Boolean(row.is_variant_param),
      applicableProductTypes: (row.applicable_product_types || '').split(',').filter(Boolean),
      options,
      validationRules,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
