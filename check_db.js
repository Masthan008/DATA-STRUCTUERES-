import sql from './server/db.js';

async function check() {
  const settings = await sql\`SELECT * FROM exam_settings\`;
  console.log(settings);
  process.exit(0);
}

check();
