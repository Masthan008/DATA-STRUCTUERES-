import sql from './db.js';

async function migrate() {
  try {
    console.log('Adding evaluation_details to submissions...');
    await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS evaluation_details JSONB DEFAULT '[]'::jsonb`;
    console.log('Adding evaluation_mode to exam_settings...');
    await sql`ALTER TABLE exam_settings ADD COLUMN IF NOT EXISTS evaluation_mode VARCHAR(20) DEFAULT 'auto'`;
    console.log('Adding score to submissions...');
    await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0`;
    console.log('Adding score_awarded to submissions...');
    await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS score_awarded INTEGER`;
    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
