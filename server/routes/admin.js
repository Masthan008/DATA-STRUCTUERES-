import { Router } from 'express';
import sql from '../db.js';

const router = Router();

// POST /api/admin/signup
router.post('/admin/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });
    if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    const existing = await sql`SELECT id FROM admins WHERE username = ${username}`;
    if (existing.length > 0) return res.status(409).json({ error: 'Username already exists.' });
    const admin = await sql`
      INSERT INTO admins (username, password_hash)
      VALUES (${username}, crypt(${password}, gen_salt('bf')))
      RETURNING id, username, created_at
    `;
    res.status(201).json({ success: true, admin: admin[0] });
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });
    const admin = await sql`
      SELECT id, username, created_at FROM admins
      WHERE username = ${username} AND password_hash = crypt(${password}, password_hash)
    `;
    if (admin.length === 0) return res.status(401).json({ error: 'Invalid username or password.' });
    res.json({ success: true, admin: admin[0] });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/admin/start-exam
router.post('/admin/start-exam', async (req, res) => {
  try {
    const { admin_id } = req.body;
    if (admin_id) {
      const settings = await sql`SELECT id FROM exam_settings WHERE admin_id = ${admin_id} LIMIT 1`;
      if (settings.length === 0) {
        await sql`INSERT INTO exam_settings (admin_id, exam_active, exam_start_time) VALUES (${admin_id}, true, NOW())`;
      } else {
        await sql`UPDATE exam_settings SET exam_active = true, exam_start_time = NOW() WHERE admin_id = ${admin_id}`;
      }
    } else {
      const settings = await sql`SELECT id FROM exam_settings LIMIT 1`;
      if (settings.length === 0) {
        await sql`INSERT INTO exam_settings (exam_active, exam_start_time) VALUES (true, NOW())`;
      } else {
        await sql`UPDATE exam_settings SET exam_active = true, exam_start_time = NOW()`;
      }
    }
    res.json({ success: true, message: 'Exam started.' });
  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/admin/end-exam
router.post('/admin/end-exam', async (req, res) => {
  try {
    const { admin_id } = req.body;
    if (admin_id) {
      await sql`UPDATE exam_settings SET exam_active = false WHERE admin_id = ${admin_id}`;
    } else {
      await sql`UPDATE exam_settings SET exam_active = false`;
    }
    res.json({ success: true, message: 'Exam ended.' });
  } catch (error) {
    console.error('End exam error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/admin/add-question
router.post('/admin/add-question', async (req, res) => {
  try {
    const { admin_id, title, description, sample_input, sample_output, question_score, difficulty, category, time_limit_seconds } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Title and description are required.' });
    const question = await sql`
      INSERT INTO questions (admin_id, title, description, sample_input, sample_output, question_score, difficulty, category, time_limit_seconds)
      VALUES (${admin_id || null}, ${title}, ${description}, ${sample_input || ''}, ${sample_output || ''}, ${question_score || 10}, ${difficulty || 'easy'}, ${category || 'General'}, ${time_limit_seconds || 120})
      RETURNING *
    `;
    res.status(201).json({ question: question[0] });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/admin/bulk-import-questions  (CSV rows sent as JSON array)
router.post('/admin/bulk-import-questions', async (req, res) => {
  try {
    const { admin_id, questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0)
      return res.status(400).json({ error: 'questions array is required.' });
    const inserted = [];
    for (const q of questions) {
      if (!q.title || !q.description) continue;
      const result = await sql`
        INSERT INTO questions (admin_id, title, description, sample_input, sample_output, question_score, difficulty, category, time_limit_seconds)
        VALUES (${admin_id || null}, ${q.title}, ${q.description}, ${q.sample_input || ''}, ${q.sample_output || ''}, ${parseInt(q.question_score) || 10}, ${q.difficulty || 'easy'}, ${q.category || 'General'}, ${parseInt(q.time_limit_seconds) || 120})
        RETURNING *
      `;
      inserted.push(result[0]);
    }
    res.status(201).json({ inserted, count: inserted.length });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/admin/delete-question/:id
router.delete('/admin/delete-question/:id', async (req, res) => {
  try {
    await sql`DELETE FROM questions WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/admin/add-testcase
router.post('/admin/add-testcase', async (req, res) => {
  try {
    const { question_id, input, expected_output, is_hidden } = req.body;
    if (!question_id || input === undefined || expected_output === undefined) {
      return res.status(400).json({ error: 'question_id, input, and expected_output required.' });
    }
    const testcase = await sql`
      INSERT INTO test_cases (question_id, input, expected_output, is_hidden)
      VALUES (${question_id}, ${input}, ${expected_output}, ${is_hidden ?? true})
      RETURNING *
    `;
    res.status(201).json({ testcase: testcase[0] });
  } catch (err) {
    console.error('Add testcase error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/admin/update-settings
router.post('/admin/update-settings', async (req, res) => {
  try {
    const { admin_id, exam_duration, allowed_device, evaluation_mode } = req.body;

    // Try to find row by admin_id first (if column exists), else fall back to any row
    let existing = [];
    if (admin_id) {
      try {
        existing = await sql`SELECT id FROM exam_settings WHERE admin_id = ${admin_id} LIMIT 1`;
      } catch {
        // admin_id column may not exist yet — fall back
        existing = await sql`SELECT id FROM exam_settings LIMIT 1`;
      }
    } else {
      existing = await sql`SELECT id FROM exam_settings LIMIT 1`;
    }

    if (existing.length > 0) {
      await sql`
        UPDATE exam_settings
        SET exam_duration = ${exam_duration},
            allowed_device = ${allowed_device},
            evaluation_mode = ${evaluation_mode || 'auto'}
        WHERE id = ${existing[0].id}
      `;
    } else {
      // No row at all — insert one (without admin_id to be safe)
      await sql`
        INSERT INTO exam_settings (exam_duration, allowed_device, evaluation_mode)
        VALUES (${exam_duration}, ${allowed_device}, ${evaluation_mode || 'auto'})
      `;
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/admin/blacklist-student
router.post('/admin/blacklist-student', async (req, res) => {
  try {
    const { student_id, blacklisted } = req.body;
    if (!student_id) return res.status(400).json({ error: 'student_id required' });
    await sql`UPDATE students SET blacklisted = ${blacklisted ?? true} WHERE id = ${student_id}`;
    res.json({ success: true });
  } catch (err) {
    console.error('Blacklist error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/admin/force-submit
router.post('/admin/force-submit', async (req, res) => {
  try {
    const { student_id } = req.body;
    if (!student_id) return res.status(400).json({ error: 'student_id required' });
    await sql`UPDATE students SET exam_started = false WHERE id = ${student_id}`;
    res.json({ success: true });
  } catch (err) {
    console.error('Force submit error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/admin/update-submission
router.post('/admin/update-submission', async (req, res) => {
  try {
    const { id, status, score_awarded } = req.body;
    if (!id || !status) return res.status(400).json({ error: 'id and status required' });
    await sql`UPDATE submissions SET status = ${status}, score_awarded = ${score_awarded || 0} WHERE id = ${id}`;
    res.json({ success: true });
  } catch (err) {
    console.error('Update submission error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/admin/students
router.get('/admin/students', async (req, res) => {
  try {
    const students = await sql`SELECT * FROM students ORDER BY created_at DESC`;
    res.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/admin/violations
router.get('/admin/violations', async (req, res) => {
  try {
    const violations = await sql`
      SELECT v.*, s.name as student_name
      FROM violations v
      LEFT JOIN students s ON v.student_id = s.id
      ORDER BY v.timestamp DESC
    `;
    res.json({ violations });
  } catch (error) {
    console.error('Get violations error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/admin/submissions
router.get('/admin/submissions', async (req, res) => {
  try {
    const submissions = await sql`
      SELECT sub.*, s.name as student_name, s.regd_no, q.title as question_title, q.question_score as question_max_score
      FROM submissions sub
      LEFT JOIN students s ON sub.student_id = s.id
      LEFT JOIN questions q ON sub.question_id = q.id
      ORDER BY sub.created_at DESC
    `;
    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/admin/questions
router.get('/admin/questions', async (req, res) => {
  try {
    const questions = await sql`SELECT * FROM questions ORDER BY created_at ASC`;
    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;