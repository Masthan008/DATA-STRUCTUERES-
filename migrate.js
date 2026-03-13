import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const sql = neon(process.env.DATABASE_URL);

async function runMigrate() {
  try {
    console.log('Running database migrations...');
    
    // Add columns to questions table
    await sql`ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_score INTEGER DEFAULT 10`;
    console.log('Added question_score to questions');
    
    // Add columns to submissions table
    await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS run_count INTEGER DEFAULT 0`;
    console.log('Added run_count to submissions');
    
    await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submission_count INTEGER DEFAULT 0`;
    console.log('Added submission_count to submissions');
    
    await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS score_awarded INTEGER`;
    console.log('Added score_awarded to submissions');
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigrate();
