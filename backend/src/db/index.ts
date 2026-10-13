import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'fs';
import path from 'path';
import * as schema from './schema.js';

const dbPath = process.env.DATABASE_PATH || path.resolve(process.cwd(), '../data/orivanta.sqlite');

// Ensure parent directory exists safely
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const sqlite = new Database(dbPath);

// Enforce foreign keys and WAL mode on every connection
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
export { schema };
