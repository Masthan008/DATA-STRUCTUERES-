import { Router } from 'express';
import sql from '../db.js';

const router = Router();

// ─── POST /api/admin/signup ────────────────────────────────────────────
router.post('/admin/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    // Check if username already exists
    const existing = await sql`SELECT id FROM admins WHERE username = ${username}`;
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username already exists.' });
    }

    // Hash password with pgcrypto and insert
    const admin = await sql`
      INSERT INTO admins (username, password_hash)
      VALUES (${username}, crypt(${password}, gen_salt('bf')))
      RETURNING id, username, created_at
    `;

    res.status(201).json({ success: true, admin: admin[0], message: 'Admin account created.' });
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/admin/login ─────────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const admin = await sql`
      SELECT id, username, created_at
      FROM admins
      WHERE username = ${username}
        AND password_hash = crypt(${password}, password_hash)
    `;

    if (admin.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    res.json({ success: true, admin: admin[0], message: 'Admin authenticated.' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/admin/start-exam ────────────────────────────────────────
router.post('/admin/start-exam', async (req, res) => {
  try {
    const settings = await sql`SELECT id FROM exam_settings LIMIT 1`;

    if (settings.length === 0) {
      // Create settings row if none exists
      await sql`
        INSERT INTO exam_settings (exam_active, exam_start_time)
        VALUES (true, NOW())
      `;
    } else {
      await sql`
        UPDATE exam_settings
        SET exam_active = true, exam_start_time = NOW()
        WHERE id = ${settings[0].id}
      `;
    }

    res.json({ success: true, message: 'Exam started.' });
  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/admin/end-exam ──────────────────────────────────────────
router.post('/admin/end-exam', async (req, res) => {
  try {
    const settings = await sql`SELECT id FROM exam_settings LIMIT 1`;

    if (settings.length > 0) {
      await sql`
        UPDATE exam_settings
        SET exam_active = false
        WHERE id = ${settings[0].id}
      `;
    }

    res.json({ success: true, message: 'Exam ended.' });
  } catch (error) {
    console.error('End exam error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/admin/add-question ──────────────────────────────────────
router.post('/admin/add-question', async (req, res) => {
  try {
    const { title, description, sample_input, sample_output } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const question = await sql`
      INSERT INTO questions (title, description, sample_input, sample_output)
      VALUES (${title}, ${description}, ${sample_input || ''}, ${sample_output || ''})
      RETURNING *
    `;

    res.status(201).json({ question: question[0] });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── DELETE /api/admin/delete-question/:id ──────────────────────────────
router.delete('/admin/delete-question/:id', async (req, res) => {
  try {
    await sql`DELETE FROM questions WHERE id = ${req.params.id}`;
    res.json({ success: true, message: 'Question deleted.' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/admin/update-settings ───────────────────────────────────
router.post('/admin/update-settings', async (req, res) => {
  try {
    const { exam_duration, allowed_device } = req.body;
    const settings = await sql`SELECT id FROM exam_settings LIMIT 1`;

    if (settings.length > 0) {
      await sql`
        UPDATE exam_settings
        SET exam_duration = ${exam_duration}, allowed_device = ${allowed_device}
        WHERE id = ${settings[0].id}
      `;
    } else {
      await sql`
        INSERT INTO exam_settings (exam_duration, allowed_device)
        VALUES (${exam_duration}, ${allowed_device})
      `;
    }

    res.json({ success: true, message: 'Settings updated.' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/admin/students ───────────────────────────────────────────
router.get('/admin/students', async (req, res) => {
  try {
    const students = await sql`SELECT * FROM students ORDER BY created_at DESC`;
    res.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/admin/violations ─────────────────────────────────────────
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

// ─── GET /api/admin/submissions ────────────────────────────────────────
router.get('/admin/submissions', async (req, res) => {
  try {
    const submissions = await sql`
      SELECT sub.*, s.name as student_name, s.regd_no, q.title as question_title
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

// ─── GET /api/admin/questions ──────────────────────────────────────────
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
