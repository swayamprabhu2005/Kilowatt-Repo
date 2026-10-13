import { runMigrations } from './migrate.js';
import { runSeed } from './seed.js';

async function reset() {
  console.log('[Reset] Performing safe local database reset (re-migrating and re-seeding)...');
  runMigrations();
  await runSeed();
  console.log('[Reset] Database reset complete.');
}

reset().catch((err) => {
  console.error('[Reset Error]', err);
  process.exit(1);
});
