import type { Response, NextFunction } from 'express';
import { sqlite } from '../../db/index.js';
import type { AuthenticatedRequest } from '../../types/index.js';

export class ActivityController {
  static list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const rows = sqlite.prepare(`
        SELECT a.*, u.name as user_name, u.email as user_email
        FROM activity_logs a
        LEFT JOIN users u ON u.id = a.user_id
        WHERE a.workspace_id = ?
        ORDER BY a.created_at DESC
        LIMIT ?
      `).all(req.workspaceCtx!.workspaceId, limit) as any[];

      const items = rows.map((r) => {
        let details = {};
        try {
          details = JSON.parse(r.details_json || '{}');
        } catch {}
        return {
          id: r.id,
          entityType: r.entity_type,
          entityId: r.entity_id,
          action: r.action,
          details,
          userName: r.user_name || 'System',
          createdAt: r.created_at,
        };
      });

      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }
}
