import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || 'unknown';

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request input data.',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      meta: { requestId },
    });
    return;
  }

  // Handle SQLite constraint violations safely
  if (err?.code?.startsWith('SQLITE_CONSTRAINT')) {
    let message = 'Database constraint violation.';
    let code = 'DATABASE_CONSTRAINT_ERROR';

    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      message = 'A record with this identifier or unique attribute already exists.';
      code = 'DUPLICATE_ENTRY';
    } else if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      message = 'Referenced related record does not exist or has been deleted.';
      code = 'FOREIGN_KEY_VIOLATION';
    }

    res.status(409).json({
      success: false,
      error: { code, message },
      meta: { requestId },
    });
    return;
  }

  // Structured logging of unhandled errors
  console.error(`[Error] Request ${requestId} failed:`, err?.message || err);

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error occurred.'
    : err.message || 'An unexpected error occurred.';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
    },
    meta: { requestId },
  });
}
