import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend or root .env
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import { app } from './app.js';
import { runMigrations } from './db/migrate.js';

const PORT = parseInt(process.env.PORT || '5000', 10);

// Ensure migrations are in place upon server startup
runMigrations();

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`  ORIVANTA PIM — Backend API Server Online                     `);
  console.log(`  Port:               ${PORT}                                    `);
  console.log(`  Database:           SQLite (${process.env.DATABASE_PATH || './data/orivanta.sqlite'})`);
  console.log(`  Integration Mode:   ${process.env.INTEGRATION_MODE || 'mock'}  `);
  console.log(`  Gemini Agentic AI:  ${process.env.AI_ENABLED === 'true' ? 'Enabled' : 'Disabled (Mock Fallback Active)'}`);
  console.log(`================================================================`);
});
