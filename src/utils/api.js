const API_BASE = 'http://localhost:5000/api';

const api = {
  // ─── STUDENT APIs ────────────────────────────────────────────────────

  async studentLogin({ name, regNo, systemNo, device }) {
    const res = await fetch(`${API_BASE}/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, regd_no: regNo, system_no: systemNo, device_type: device })
    });
    return res.json();
  },

  async getExamStatus() {
    const res = await fetch(`${API_BASE}/exam/status`);
    return res.json();
  },

  async getRandomQuestions(studentId) {
    const url = studentId ? `${API_BASE}/questions/random?student_id=${studentId}` : `${API_BASE}/questions/random`;
    const res = await fetch(url);
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

  async startExam() {
    const res = await fetch(`${API_BASE}/admin/start-exam`, { method: 'POST' });
    return res.json();
  },

  async endExam() {
    const res = await fetch(`${API_BASE}/admin/end-exam`, { method: 'POST' });
    return res.json();
  },

  async addQuestion({ title, description, sample_input, sample_output }) {
    const res = await fetch(`${API_BASE}/admin/add-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, sample_input, sample_output })
    });
    return res.json();
  },

  async deleteQuestion(id) {
    const res = await fetch(`${API_BASE}/admin/delete-question/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async updateSettings({ exam_duration, allowed_device, evaluation_mode }) {
    const res = await fetch(`${API_BASE}/admin/update-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exam_duration, allowed_device, evaluation_mode })
    });
    return res.json();
  },

  async addTestcase({ question_id, input, expected_output, is_hidden }) {
    const res = await fetch(`${API_BASE}/admin/add-testcase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id, input, expected_output, is_hidden })
    });
    return res.json();
  },

  async updateSubmission({ id, status, score }) {
    const res = await fetch(`${API_BASE}/admin/update-submission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, score })
    });
    return res.json();
  },

  async getStudents() {
    const res = await fetch(`${API_BASE}/admin/students`);
    return res.json();
  },

  async getViolations() {
    const res = await fetch(`${API_BASE}/admin/violations`);
    return res.json();
  },

  async getSubmissions() {
    const res = await fetch(`${API_BASE}/admin/submissions`);
    return res.json();
  },

  async getQuestions() {
    const res = await fetch(`${API_BASE}/admin/questions`);
    return res.json();
  }
};

export default api;
