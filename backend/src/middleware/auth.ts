import type { Response, NextFunction } from 'express';
import { sqlite } from '../db/index.js';
import type { AuthenticatedRequest, WorkspaceContext } from '../types/index.js';

export function authenticateSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Extract token from cookie or Authorization header
  let token = req.cookies?.orivanta_session;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7);
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication session cookie or Bearer token is required.',
      },
    });
    return;
  }

  const now = Date.now();
  const sessionRow = sqlite.prepare(`
    SELECT s.id, s.user_id, s.active_workspace_id, s.expires_at,
           u.email, u.name,
           m.role
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    JOIN workspace_members m ON m.workspace_id = s.active_workspace_id AND m.user_id = u.id
    WHERE s.id = ? AND s.expires_at > ?
  `).get(token, now) as {
    id: string;
    user_id: string;
    active_workspace_id: string;
    expires_at: number;
    email: string;
    name: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
  } | undefined;

  if (!sessionRow) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_SESSION',
        message: 'Session has expired or is invalid. Please log in again.',
      },
    });
    return;
  }

  req.sessionToken = token;
  req.workspaceCtx = {
    userId: sessionRow.user_id,
    workspaceId: sessionRow.active_workspace_id,
    role: sessionRow.role,
    userEmail: sessionRow.email,
    userName: sessionRow.name,
  };

  next();
}

export function requireRole(allowedRoles: Array<'owner' | 'admin' | 'editor' | 'viewer'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.workspaceCtx) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'User context is missing.' },
      });
      return;
    }

    if (!allowedRoles.includes(req.workspaceCtx.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Insufficient permissions. Requires one of: ${allowedRoles.join(', ')}.`,
        },
      });
      return;
    }

    next();
  };
}
