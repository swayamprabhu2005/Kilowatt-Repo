import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'secret',
  'sessionsecret',
  'consumersecret',
  'gemini_api_key',
  'apikey',
  'token',
  'authorization',
  'cookie',
]);

export function redactSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('secret') || lowerKey.includes('key')) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    };
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[HTTP] ${logEntry.method} ${logEntry.url} ${logEntry.status} - ${logEntry.durationMs}ms (req: ${requestId.slice(0, 8)})`);
    }
  });

  next();
}
