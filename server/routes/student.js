import { Router } from 'express';
import sql from '../db.js';

const router = Router();

// ─── POST /api/student/login ───────────────────────────────────────────
router.post('/student/login', async (req, res) => {
  try {
    const { name, regd_no, system_no, device_type } = req.body;

    if (!name || !regd_no || !system_no || !device_type) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existing = await sql`SELECT * FROM students WHERE regd_no = ${regd_no}`;
    if (existing.length > 0) {
      if (existing[0].blacklisted) return res.status(403).json({ error: 'You have been removed from this exam.' });
      return res.json({ student: existing[0], message: 'Session restored.' });
    }

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
router.get('/exam/status', async (req, res) => {
  try {
    const admin_id = req.query.admin_id;
    const query = admin_id
      ? sql`SELECT * FROM exam_settings WHERE admin_id = ${admin_id} LIMIT 1`
      : sql`SELECT * FROM exam_settings LIMIT 1`;

    const settings = await query;
    if (settings.length === 0) return res.json({ exam_active: false });

    const s = settings[0];
    let remaining_time = null;

    // Auto-start if scheduled time has arrived
    if (!s.exam_active && s.scheduled_start_time && new Date(s.scheduled_start_time) <= new Date()) {
      await sql`UPDATE exam_settings SET exam_active = true, exam_start_time = ${s.scheduled_start_time}, scheduled_start_time = null WHERE id = ${s.id}`;
      s.exam_active = true;
      s.exam_start_time = s.scheduled_start_time;
    }

    if (s.exam_active && s.exam_start_time) {
      const startMs = new Date(s.exam_start_time).getTime();
      const durationMs = s.exam_duration * 60 * 1000;
      const nowMs = Date.now();
      remaining_time = Math.max(0, Math.floor((startMs + durationMs - nowMs) / 1000));
      if (remaining_time <= 0) {
        await sql`UPDATE exam_settings SET exam_active = false WHERE id = ${s.id}`;
        s.exam_active = false;
      }
    }

    res.json({
      exam_active: s.exam_active,
      exam_duration: s.exam_duration,
      allowed_device: s.allowed_device,
      exam_start_time: s.exam_start_time,
      evaluation_mode: s.evaluation_mode,
      scheduled_start_time: s.scheduled_start_time,
      remaining_time
    });
  } catch (error) {
    console.error('Exam status error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /api/questions/random ─────────────────────────────────────────
router.get('/questions/random', async (req, res) => {
  try {
    const { student_id, admin_id } = req.query;
    const sid = student_id || 'default';
    const questions = admin_id
      ? await sql`SELECT * FROM questions WHERE admin_id = ${admin_id} ORDER BY MD5(id::text || ${sid}::text) LIMIT 4`
      : await sql`SELECT * FROM questions ORDER BY MD5(id::text || ${sid}::text) LIMIT 4`;
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
    const { student_id, question_id, code, output, status, score, score_awarded, evaluation_details } = req.body;

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
            score_awarded = ${score_awarded !== undefined ? score_awarded : null},
            run_count = run_count + 1,
            submission_count = submission_count + 1,
            evaluation_details = ${detailsJson}::jsonb
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
      return res.json({ submission: submission[0] });
    } else {
      // Insert
      const submission = await sql`
        INSERT INTO submissions (student_id, question_id, code, output, status, score, score_awarded, run_count, submission_count, evaluation_details)
        VALUES (
          ${student_id}, 
          ${question_id}, 
          ${code}, 
          ${output || ''}, 
          ${status || 'Submitted'},
          ${score || 0},
          ${score_awarded !== undefined ? score_awarded : null},
          1,
          1,
          ${detailsJson}::jsonb
        )
        RETURNING *
      `;
      return res.status(201).json({ submission: submission[0] });
    }
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
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
    res.status(500).json({ error: error.message || 'Internal server error.' });
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
      WHERE admin_id = ${student.admin_id}
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

// ─── POST /api/compile ─────────────────────────────────────────────────
// Compiles and runs C code locally using the system GCC — no external API needed.
router.post('/compile', async (req, res) => {
  const { source_code, stdin = '' } = req.body;

  if (!source_code) {
    return res.status(400).json({ error: 'source_code is required.' });
  }

  const { exec, spawn } = await import('child_process');
  const { writeFile, unlink, mkdtemp } = await import('fs/promises');
  const { tmpdir } = await import('os');
  const path = await import('path');

  // Create a unique temp directory for this submission
  let tmpDir;
  try {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'exam-'));
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create temp directory.' });
  }

  const srcFile = path.join(tmpDir, 'main.c');
  const outFile = path.join(tmpDir, process.platform === 'win32' ? 'main.exe' : 'main.out');

  try {
    await writeFile(srcFile, source_code, 'utf8');

    // Step 1: Compile — capture stdout and stderr separately (Windows-safe)
    const compileResult = await new Promise((resolve) => {
      exec(`gcc "${srcFile}" -o "${outFile}" -Wall -lm`, { timeout: 10000 }, (err, stdout, stderr) => {
        resolve({
          exitCode: err ? (err.code || 1) : 0,
          output: (stderr || stdout || '').trim()
        });
      });
    });

    if (compileResult.exitCode !== 0 || compileResult.output.trim()) {
      // Check if the binary was produced despite warnings
      const { access } = await import('fs/promises');
      let binaryExists = false;
      try { await access(outFile); binaryExists = true; } catch {}

      if (!binaryExists) {
        // Real compile error
        return res.json({ compileError: compileResult.output.trim() });
      }
      // Warnings only — continue to run but include warnings
    }

    // Step 2: Run with stdin, 5s timeout
    const runResult = await new Promise((resolve) => {
      const start = Date.now();
      const child = spawn(outFile, [], { timeout: 5000 });

      let stdout = '';
      let stderr = '';

      if (stdin) child.stdin.write(stdin);
      child.stdin.end();

      child.stdout.on('data', (d) => { stdout += d.toString(); });
      child.stderr.on('data', (d) => { stderr += d.toString(); });

      child.on('close', (code) => {
        resolve({
          stdout,
          stderr,
          exitCode: code,
          time: ((Date.now() - start) / 1000).toFixed(3),
        });
      });

      child.on('error', (err) => {
        resolve({ stdout: '', stderr: err.message, exitCode: 1, time: '0' });
      });
    });

    const result = { time: runResult.time };

    if (runResult.stderr && runResult.stderr.trim()) {
      result.runtimeError = runResult.stderr.trim();
    } else {
      result.output = runResult.stdout;
      if (!runResult.stdout && runResult.exitCode === 0) result.noOutput = true;
    }

    // Include compiler warnings alongside output if any
    if (compileResult.output.trim()) {
      result.warnings = compileResult.output.trim();
    }

    return res.json(result);

  } catch (err) {
    console.error('Compile error:', err);
    return res.status(500).json({ error: `Compiler error: ${err.message}` });
  } finally {
    // Cleanup temp files
    try {
      const { rm } = await import('fs/promises');
      await rm(tmpDir, { recursive: true, force: true });
    } catch {}
  }
});

// ─── POST /api/student/live-code ──────────────────────────────────────
// Store student's current code in memory for live admin view
const liveCodeStore = new Map(); // student_id -> { code, question_title, updated_at }

router.post('/student/live-code', async (req, res) => {
  const { student_id, code, question_title } = req.body;
  if (!student_id) return res.status(400).json({ error: 'student_id required' });
  liveCodeStore.set(student_id, { code: code || '', question_title: question_title || '', updated_at: new Date() });
  res.json({ success: true });
});

// ─── GET /api/admin/live-code/:student_id ─────────────────────────────
router.get('/admin/live-code/:student_id', (req, res) => {
  const data = liveCodeStore.get(req.params.student_id);
  if (!data) return res.json({ code: '', question_title: '', updated_at: null });
  res.json(data);
});

export { liveCodeStore };

export default router;
