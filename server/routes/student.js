import { Router } from 'express';
import sql from '../db.js';

const router = Router();

// ─── POST /api/student/login ───────────────────────────────────────────
// Register student session. Prevents duplicate regd_no. Enforces device restriction.
router.post('/student/login', async (req, res) => {
  try {
    const { name, regd_no, system_no, device_type } = req.body;

    // Validate input
    if (!name || !regd_no || !system_no || !device_type) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check device restriction from exam_settings
    const settings = await sql`SELECT * FROM exam_settings LIMIT 1`;
    if (settings.length > 0) {
      const allowed = settings[0].allowed_device;
      if (allowed !== 'both' && allowed !== device_type) {
        return res.status(403).json({ error: 'Device not permitted for this exam.' });
      }
    }

    // Check for duplicate regd_no
    const existing = await sql`SELECT * FROM students WHERE regd_no = ${regd_no}`;
    if (existing.length > 0) {
      // Return existing student session
      return res.json({ student: existing[0], message: 'Session restored.' });
    }

    // Create new student record
    const result = await sql`
      INSERT INTO students (name, regd_no, system_no, device_type, exam_started, violations)
      VALUES (${name}, ${regd_no}, ${system_no}, ${device_type}, true, 0)
      RETURNING *
    `;

    res.status(201).json({ student: result[0], message: 'Login successful.' });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/exam/status ──────────────────────────────────────────────
// Check if exam is active. Returns timer info.
router.get('/exam/status', async (req, res) => {
  try {
    const settings = await sql`SELECT * FROM exam_settings LIMIT 1`;
    if (settings.length === 0) {
      return res.json({ exam_active: false });
    }

    const s = settings[0];
    let remaining_time = null;

    if (s.exam_active && s.exam_start_time) {
      const startMs = new Date(s.exam_start_time).getTime();
      const durationMs = s.exam_duration * 60 * 1000;
      const nowMs = Date.now();
      remaining_time = Math.max(0, Math.floor((startMs + durationMs - nowMs) / 1000));
    }

    res.json({
      exam_active: s.exam_active,
      exam_duration: s.exam_duration,
      allowed_device: s.allowed_device,
      exam_start_time: s.exam_start_time,
      evaluation_mode: s.evaluation_mode,
      remaining_time
    });
  } catch (error) {
    console.error('Exam status error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/questions/random ─────────────────────────────────────────
// Return stable random questions for the student.
router.get('/questions/random', async (req, res) => {
  try {
    const studentId = req.query.student_id || 'default';
    const questions = await sql`
      SELECT * FROM questions 
      ORDER BY MD5(id::text || ${studentId}::text) 
      LIMIT 4
    `;
    res.json({ questions });
  } catch (error) {
    console.error('Random questions error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/questions/:id/testcases ──────────────────────────────────
router.get('/questions/:id/testcases', async (req, res) => {
  try {
    const testcases = await sql`
      SELECT id, input, expected_output, is_hidden 
      FROM test_cases 
      WHERE question_id = ${req.params.id}
      ORDER BY created_at ASC
    `;
    res.json({ testcases });
  } catch (error) {
    console.error('Get testcases error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/violations ──────────────────────────────────────────────
// Log cheating attempt. Increment student violation count.
router.post('/violations', async (req, res) => {
  try {
    const { student_id, regd_no, violation_type } = req.body;

    if (!student_id || !violation_type) {
      return res.status(400).json({ error: 'student_id and violation_type are required.' });
    }

    // Insert violation record
    const violation = await sql`
      INSERT INTO violations (student_id, regd_no, violation_type)
      VALUES (${student_id}, ${regd_no || ''}, ${violation_type})
      RETURNING *
    `;

    // Increment student violations counter
    await sql`UPDATE students SET violations = violations + 1 WHERE id = ${student_id}`;

    res.status(201).json({ violation: violation[0] });
  } catch (error) {
    console.error('Violation logging error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/submissions ─────────────────────────────────────────────
// Save student code submission. Also works for saving without grading.
router.post('/submissions', async (req, res) => {
  try {
    const { student_id, question_id, code, output, status, score, evaluation_details } = req.body;

    if (!student_id || !question_id || !code) {
      return res.status(400).json({ error: 'student_id, question_id, and code are required.' });
    }

    const detailsJson = evaluation_details ? JSON.stringify(evaluation_details) : '[]';

    const existing = await sql`
      SELECT * FROM submissions WHERE student_id = ${student_id} AND question_id = ${question_id}
    `;

    if (existing.length > 0) {
      // Upsert
      const submission = await sql`
        UPDATE submissions
        SET code = ${code},
            output = ${output || ''},
            status = ${status || 'Submitted'},
            score = ${score || 0},
            run_count = run_count + 1,
            submission_count = submission_count + 1,
            evaluation_details = ${detailsJson}
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
      return res.json({ submission: submission[0] });
    } else {
      // Insert
      const submission = await sql`
        INSERT INTO submissions (student_id, question_id, code, output, status, score, run_count, submission_count, evaluation_details)
        VALUES (
          ${student_id}, 
          ${question_id}, 
          ${code}, 
          ${output || ''}, 
          ${status || 'Submitted'},
          ${score || 0},
          1,
          1,
          ${detailsJson}
        )
        RETURNING *
      `;
      return res.status(201).json({ submission: submission[0] });
    }
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/submissions/save ────────────────────────────────────────
// Save student code submission without grading yet. Just saves work in progress.
router.post('/submissions/save', async (req, res) => {
  try {
    const { student_id, question_id, code } = req.body;

    if (!student_id || !question_id || !code) {
      return res.status(400).json({ error: 'student_id, question_id, and code are required.' });
    }

    const existing = await sql`
      SELECT * FROM submissions WHERE student_id = ${student_id} AND question_id = ${question_id}
    `;

    if (existing.length > 0) {
      // Upsert check: only update if it is not already finally submitted.
      const submission = await sql`
        UPDATE submissions
        SET code = ${code},
            status = CASE WHEN status = 'Saved' OR status = 'Pending Administration' THEN 'Saved' ELSE status END,
            submission_count = submission_count + 1
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
      return res.json({ submission: submission[0] });
    } else {
      const submission = await sql`
        INSERT INTO submissions (student_id, question_id, code, status, submission_count)
        VALUES (${student_id}, ${question_id}, ${code}, 'Saved', 1)
        RETURNING *
      `;
      return res.status(201).json({ submission: submission[0] });
    }

  } catch (error) {
    console.error('Save submission error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/submissions/final ───────────────────────────────────────
// Mark all answers as final
router.post('/submissions/final', async (req, res) => {
  try {
    const { student_id } = req.body;
    if (!student_id) return res.status(400).json({ error: 'student_id is required' });

    await sql`
      UPDATE students SET exam_started = false WHERE id = ${student_id}
    `;

    res.json({ message: 'Exam finally submitted' });
  } catch (err) {
    console.error('Final submit error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/student/exam-summary/:id ─────────────────────────────────
// Get summary for the exam submitted page
router.get('/student/exam-summary/:id', async (req, res) => {
  try {
    const student_id = req.params.id;
    
    // Get student details
    const studentData = await sql`SELECT * FROM students WHERE id = ${student_id}`;
    if (studentData.length === 0) return res.status(404).json({ error: 'Student not found' });
    const student = studentData[0];
    
    // Total questions logic: For now we return 4 because getRandomQuestions limits to 4. 
    // Usually it would check the questions table explicitly or get the subset assigned.
    const questionsAssignedData = await sql`
      SELECT id FROM questions 
      ORDER BY MD5(id::text || ${student_id}::text) 
      LIMIT 4
    `;
    const totalQuestions = questionsAssignedData.length;
    
    const attemptsData = await sql`
      SELECT COUNT(*) as attempt_count, COALESCE(SUM(run_count), 0) as total_runs, COALESCE(SUM(submission_count), 0) as total_subs
      FROM submissions 
      WHERE student_id = ${student_id}
    `;
    
    const attemptedCount = parseInt(attemptsData[0].attempt_count, 10);
    const unattemptedCount = totalQuestions - attemptedCount;
    const totalRuns = parseInt(attemptsData[0].total_runs, 10);
    const totalSubs = parseInt(attemptsData[0].total_subs, 10);

    res.json({
      student_name: student.name,
      regd_no: student.regd_no,
      system_no: student.system_no,
      total_questions: totalQuestions,
      attempted_questions: attemptedCount,
      unattempted_questions: unattemptedCount,
      total_runs: totalRuns,
      total_submissions: totalSubs
    });

  } catch (err) {
    console.error('Exam summary error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
