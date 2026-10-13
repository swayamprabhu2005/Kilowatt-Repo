import crypto from 'crypto';
import { sqlite } from '../../db/index.js';
import type { WorkspaceContext } from '../../types/index.js';

export interface CategoryDTO {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  wooCategoryId?: number | null;
  createdAt: number;
  updatedAt: number;
}

export class CategoryRepository {
  static list(ctx: WorkspaceContext): CategoryDTO[] {
    const rows = sqlite.prepare(`
      SELECT * FROM categories
      WHERE workspace_id = ?
      ORDER BY name ASC
    `).all(ctx.workspaceId) as any[];

    return rows.map(this.mapRow);
  }

  static getById(ctx: WorkspaceContext, id: string): CategoryDTO | null {
    const row = sqlite.prepare(`
      SELECT * FROM categories
      WHERE id = ? AND workspace_id = ?
    `).get(id, ctx.workspaceId) as any;

    return row ? this.mapRow(row) : null;
  }

  static create(ctx: WorkspaceContext, data: { name: string; slug?: string; description?: string | null; parentId?: string | null; wooCategoryId?: number | null }): CategoryDTO {
    const id = `cat_${crypto.randomUUID().slice(0, 8)}`;
    const now = Date.now();
    const slug = (data.slug || data.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    sqlite.prepare(`
      INSERT INTO categories (id, workspace_id, name, slug, description, parent_id, woo_category_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, ctx.workspaceId, data.name.trim(), slug, data.description || null, data.parentId || null, data.wooCategoryId || null, now, now);

    return this.getById(ctx, id)!;
  }

  static update(ctx: WorkspaceContext, id: string, data: { name?: string; slug?: string; description?: string | null; parentId?: string | null; wooCategoryId?: number | null }): CategoryDTO {
    const existing = this.getById(ctx, id);
    if (!existing) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Category not found.' };

    const now = Date.now();
    const name = data.name !== undefined ? data.name.trim() : existing.name;
    const slug = data.slug !== undefined ? data.slug.trim() : existing.slug;
    const desc = data.description !== undefined ? data.description : existing.description;
    const parent = data.parentId !== undefined ? data.parentId : existing.parentId;
    const wooCat = data.wooCategoryId !== undefined ? data.wooCategoryId : existing.wooCategoryId;

    sqlite.prepare(`
      UPDATE categories
      SET name = ?, slug = ?, description = ?, parent_id = ?, woo_category_id = ?, updated_at = ?
      WHERE id = ? AND workspace_id = ?
    `).run(name, slug, desc, parent, wooCat, now, id, ctx.workspaceId);

    return this.getById(ctx, id)!;
  }

  static delete(ctx: WorkspaceContext, id: string): boolean {
    const existing = this.getById(ctx, id);
    if (!existing) throw { statusCode: 404, code: 'NOT_FOUND', message: 'Category not found.' };

    const info = sqlite.prepare('DELETE FROM categories WHERE id = ? AND workspace_id = ?').run(id, ctx.workspaceId);
    return info.changes > 0;
  }

  private static mapRow(row: any): CategoryDTO {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      parentId: row.parent_id,
      wooCategoryId: row.woo_category_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
