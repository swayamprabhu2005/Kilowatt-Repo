import crypto from 'crypto';
import * as argon2 from '@node-rs/argon2';
import { sqlite } from '../../db/index.js';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export class AuthService {
  static async login(email: string, passwordPlain: string) {
    const user = sqlite.prepare(`
      SELECT id, email, password_hash, name FROM users WHERE email = ?
    `).get(email.toLowerCase().trim()) as { id: string; email: string; password_hash: string; name: string } | undefined;

    if (!user) {
      // Use constant-time dummy verification to mitigate user enumeration timing attacks
      await argon2.verify('$argon2id$v=19$m=65536,t=3,p=4$dummyhashdummyhash$dummyhashdummyhashdummyhash', passwordPlain).catch(() => {});
      throw { statusCode: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' };
    }

    const isValid = await argon2.verify(user.password_hash, passwordPlain);
    if (!isValid) {
      throw { statusCode: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' };
    }

    // Get user's primary/first workspace
    const memberRow = sqlite.prepare(`
      SELECT m.workspace_id, m.role, w.name as workspace_name, w.slug as workspace_slug
      FROM workspace_members m
      JOIN workspaces w ON w.id = m.workspace_id
      WHERE m.user_id = ?
      ORDER BY m.created_at ASC
      LIMIT 1
    `).get(user.id) as { workspace_id: string; role: string; workspace_name: string; workspace_slug: string } | undefined;

    if (!memberRow) {
      throw { statusCode: 403, code: 'NO_WORKSPACE', message: 'User is not assigned to any workspace.' };
    }

    // =========================================================================
    // OPTIONAL: JSON Web Token (JWT) Live Login Pattern
    // (Commented out in favor of SQLite database-persisted sessions; only 1 entry
    // per active session is stored in the database for instant revocation safety)
    // =========================================================================
    // const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_key_for_optional_stateless_tokens_32_characters_minimum';
    // const jwtPayload = { userId: user.id, email: user.email, workspaceId: memberRow.workspace_id };
    // const jwtToken = jwt.sign(jwtPayload, jwtSecret, { expiresIn: '7d' });
    // =========================================================================

    // Generate secure session token and persist directly to database
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const expiresAt = now + SESSION_TTL_MS;

    sqlite.prepare(`
      INSERT INTO sessions (id, user_id, active_workspace_id, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionToken, user.id, memberRow.workspace_id, expiresAt, now);

    return {
      token: sessionToken,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      activeWorkspace: {
        id: memberRow.workspace_id,
        name: memberRow.workspace_name,
        slug: memberRow.workspace_slug,
        role: memberRow.role,
      },
    };
  }

  static logout(sessionToken?: string) {
    if (sessionToken) {
      sqlite.prepare('DELETE FROM sessions WHERE id = ?').run(sessionToken);
    }
  }

  static getProfile(userId: string, activeWorkspaceId: string) {
    const user = sqlite.prepare('SELECT id, email, name FROM users WHERE id = ?').get(userId) as any;
    if (!user) throw { statusCode: 404, code: 'USER_NOT_FOUND', message: 'User not found.' };

    const workspaces = sqlite.prepare(`
      SELECT w.id, w.name, w.slug, m.role
      FROM workspace_members m
      JOIN workspaces w ON w.id = m.workspace_id
      WHERE m.user_id = ?
    `).all(userId) as any[];

    const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

    return {
      user,
      activeWorkspace,
      workspaces,
    };
  }

  static switchWorkspace(sessionToken: string, userId: string, targetWorkspaceId: string) {
    const membership = sqlite.prepare(`
      SELECT m.role, w.id, w.name, w.slug
      FROM workspace_members m
      JOIN workspaces w ON w.id = m.workspace_id
      WHERE m.user_id = ? AND m.workspace_id = ?
    `).get(userId, targetWorkspaceId) as any;

    if (!membership) {
      throw { statusCode: 403, code: 'FORBIDDEN_WORKSPACE', message: 'You are not a member of this workspace.' };
    }

    sqlite.prepare('UPDATE sessions SET active_workspace_id = ? WHERE id = ?').run(targetWorkspaceId, sessionToken);

    return {
      activeWorkspace: membership,
    };
  }
}
