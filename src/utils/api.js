const API_BASE = '/api';

const api = {
  // ─── STUDENT APIs ────────────────────────────────────────────────────

  async studentLogin({ name, regNo, systemNo, device, admin_id }) {
    const res = await fetch(`${API_BASE}/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, regd_no: regNo, system_no: systemNo, device_type: device, admin_id })
    });
    return res.json();
  },

  async getExamStatus(adminId) {
    const url = adminId ? `${API_BASE}/exam/status?admin_id=${adminId}` : `${API_BASE}/exam/status`;
    const res = await fetch(url);
    return res.json();
  },

  async getRandomQuestions(studentId, adminId) {
    const params = new URLSearchParams({ ...(studentId && { student_id: studentId }), ...(adminId && { admin_id: adminId }) });
    const res = await fetch(`${API_BASE}/questions/random?${params}`);
    return res.json();
  },

  async logViolation({ student_id, regd_no, violation_type }) {
    const res = await fetch(`${API_BASE}/violations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, regd_no, violation_type })
    });
    return res.json();
  },

  async submitCode({ student_id, question_id, code, output, status, score, evaluation_details }) {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, question_id, code, output, status, score, evaluation_details })
    });
    return res.json();
  },

  async saveCode({ student_id, question_id, code }) {
    const res = await fetch(`${API_BASE}/submissions/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, question_id, code })
    });
    return res.json();
  },

  async compile({ source_code, stdin = '' }) {
    const res = await fetch(`${API_BASE}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_code, stdin })
    });
    return res.json();
  },

  async submitFinalExam(student_id) {
    const res = await fetch(`${API_BASE}/submissions/final`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id })
    });
    return res.json();
  },

  async getExamSummary(student_id) {
    const res = await fetch(`${API_BASE}/student/exam-summary/${student_id}`);
    return res.json();
  },

  async pushLiveCode({ student_id, code, question_title }) {
    const res = await fetch(`${API_BASE}/student/live-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, code, question_title })
    });
    return res.json();
  },

  async getLiveCode(student_id) {
    const res = await fetch(`${API_BASE}/admin/live-code/${student_id}`);
    return res.json();
  },

  // ─── ADMIN APIs ──────────────────────────────────────────────────────

  async adminLogin(username, password) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async adminSignup(username, password) {
    const res = await fetch(`${API_BASE}/admin/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    return data;
  },

  async startExam(adminId) {
    const res = await fetch(`${API_BASE}/admin/start-exam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id: adminId })
    });
    return res.json();
  },

  async endExam(adminId) {
    const res = await fetch(`${API_BASE}/admin/end-exam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id: adminId })
    });
    return res.json();
  },

  async addQuestion({ admin_id, title, description, sample_input, sample_output, question_score, difficulty, category, time_limit_seconds }) {
    const res = await fetch(`${API_BASE}/admin/add-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id, title, description, sample_input, sample_output, question_score, difficulty, category, time_limit_seconds })
    });
    return res.json();
  },

  async bulkImportQuestions({ admin_id, questions }) {
    const res = await fetch(`${API_BASE}/admin/bulk-import-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id, questions })
    });
    return res.json();
  },

  async blacklistStudent({ student_id, blacklisted }) {
    const res = await fetch(`${API_BASE}/admin/blacklist-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, blacklisted })
    });
    return res.json();
  },

  async forceSubmitStudent(student_id) {
    const res = await fetch(`${API_BASE}/admin/force-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id })
    });
    return res.json();
  },

  async deleteQuestion(id, adminId) {
    const res = await fetch(`${API_BASE}/admin/delete-question/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-id': adminId }
    });
    return res.json();
  },

  async updateSettings({ admin_id, exam_duration, allowed_device, evaluation_mode }) {
    const res = await fetch(`${API_BASE}/admin/update-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id, exam_duration, allowed_device, evaluation_mode })
    });
    return res.json();
  },

  async addTestcase({ admin_id, question_id, input, expected_output, is_hidden }) {
    const res = await fetch(`${API_BASE}/admin/add-testcase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id, question_id, input, expected_output, is_hidden })
    });
    return res.json();
  },

  async updateSubmission({ admin_id, id, status, score_awarded }) {
    const res = await fetch(`${API_BASE}/admin/update-submission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id, id, status, score_awarded })
    });
    return res.json();
  },

  async getStudents(adminId) {
    const res = await fetch(`${API_BASE}/admin/students?admin_id=${adminId}`);
    return res.json();
  },

  async getViolations(adminId) {
    const res = await fetch(`${API_BASE}/admin/violations?admin_id=${adminId}`);
    return res.json();
  },

  async getSubmissions(adminId) {
    const res = await fetch(`${API_BASE}/admin/submissions?admin_id=${adminId}`);
    return res.json();
  },

  async getQuestions(adminId) {
    const res = await fetch(`${API_BASE}/admin/questions?admin_id=${adminId}`);
    return res.json();
  }
};

export default api;
