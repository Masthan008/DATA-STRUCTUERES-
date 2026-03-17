import sql from './server/db.js';

async function check() {
  try {
    const settings = await sql`SELECT * FROM exam_settings`;
    console.log('Exam Settings:', settings);
    
    const students = await sql`SELECT id, name, admin_id FROM students ORDER BY created_at DESC LIMIT 5`;
    console.log('Recent Students:', students);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

check();
