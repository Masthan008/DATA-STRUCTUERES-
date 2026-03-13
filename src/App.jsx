import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ExamProvider } from './context/ExamContext';
import { AdminProvider } from './context/AdminContext';

// Student Pages
import StudentLogin from './pages/student/Login';
import WaitingRoom from './pages/student/WaitingRoom';
import ExamPage from './pages/student/Exam';

// Admin Pages
import { AdminLayout } from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import QuestionManagement from './pages/admin/Questions';
import Settings from './pages/admin/Settings';
import Monitoring from './pages/admin/Monitoring';
import Logs from './pages/admin/Logs';
import Results from './pages/admin/Results';

const App = () => {
  return (
    <BrowserRouter>
      <AdminProvider>
        <ExamProvider>
          <Routes>
            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/student/login" replace />} />

            {/* Student Routes */}
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/waiting" element={<WaitingRoom />} />
            <Route path="/student/exam" element={<ExamPage />} />

            {/* Admin Auth Route */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="questions" element={<QuestionManagement />} />
              <Route path="settings" element={<Settings />} />
              <Route path="monitoring" element={<Monitoring />} />
              <Route path="logs" element={<Logs />} />
              <Route path="results" element={<Results />} />
            </Route>
          </Routes>
        </ExamProvider>
      </AdminProvider>
    </BrowserRouter>
  );
};

export default App;
