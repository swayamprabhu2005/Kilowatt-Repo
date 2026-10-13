import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service.js';
import type { AuthenticatedRequest } from '../../types/index.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  workspaceName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const switchWorkspaceSchema = z.object({
  workspaceId: z.string().min(1),
});

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, workspaceName } = registerSchema.parse(req.body);
      const result = await AuthService.register(name, email, password, workspaceName);

      const isSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
      res.cookie('orivanta_session', result.token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await AuthService.login(email, password);

      const isSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
      res.cookie('orivanta_session', result.token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static logout(req: AuthenticatedRequest, res: Response) {
    const token = req.cookies?.orivanta_session || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);
    AuthService.logout(token);
    res.clearCookie('orivanta_session', { path: '/' });
    res.json({
      success: true,
      data: { message: 'Logged out successfully.' },
    });
  }

  static me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.workspaceCtx) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Not logged in.' } });
        return;
      }
      const profile = AuthService.getProfile(req.workspaceCtx.userId, req.workspaceCtx.workspaceId);
      res.json({
        success: true,
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }

  static switchWorkspace(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.workspaceCtx || !req.sessionToken) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Not logged in.' } });
        return;
      }
      const { workspaceId } = switchWorkspaceSchema.parse(req.body);
      const result = AuthService.switchWorkspace(req.sessionToken, req.workspaceCtx.userId, workspaceId);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
