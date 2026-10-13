import type { Response, NextFunction } from 'express';
import { sqlite } from '../db/index.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Tenant Isolation Guard:
 * If caller specifies an explicit workspace via header 'x-workspace-id',
 * verifies user has active membership before allowing the request to proceed.
 * If caller is not authorized for that workspace, returns 403 immediately.
 */
export function enforceWorkspaceContext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.workspaceCtx) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHENTICATED', message: 'Workspace context resolution requires authenticated user.' },
    });
    return;
  }

  const requestedWorkspaceId = req.headers['x-workspace-id'] as string | undefined;

  if (requestedWorkspaceId && requestedWorkspaceId !== req.workspaceCtx.workspaceId) {
    // Check if user is a member of the requested workspace
    const memberRow = sqlite.prepare(`
      SELECT role FROM workspace_members
      WHERE workspace_id = ? AND user_id = ?
    `).get(requestedWorkspaceId, req.workspaceCtx.userId) as { role: 'owner' | 'admin' | 'editor' | 'viewer' } | undefined;

    if (!memberRow) {
      res.status(403).json({
        success: false,
        error: {
          code: 'CROSS_TENANT_ACCESS_DENIED',
          message: 'Access denied: You do not have permission to access the requested workspace.',
        },
      });
      return;
    }

    // Switch active workspace context for this request
    req.workspaceCtx.workspaceId = requestedWorkspaceId;
    req.workspaceCtx.role = memberRow.role;
  }

  next();
}
