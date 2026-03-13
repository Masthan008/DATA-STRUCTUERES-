import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  
  const [examSettings, setExamSettings] = useState({
    duration: 60,
    allowedDevice: 'desktop',
    exam_active: false
  });

  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [allViolations, setAllViolations] = useState([]);
  const [results, setResults] = useState([]);

  // Fetch all dashboard data from Neon DB via Express API
  const fetchDashboardData = async () => {
    if (!adminLoggedIn) return;

    try {
      // Exam status
      const statusData = await api.getExamStatus();
      setExamSettings({
        duration: statusData.exam_duration || 60,
        allowedDevice: statusData.allowed_device || 'desktop',
        evaluation_mode: statusData.evaluation_mode || 'auto',
        exam_active: statusData.exam_active || false
      });

      // Students
      const stdData = await api.getStudents();
      if (stdData.students) setStudents(stdData.students);

      // Violations
      const vioData = await api.getViolations();
      if (vioData.violations) setAllViolations(vioData.violations);

      // Submissions
      const subData = await api.getSubmissions();
      if (subData.submissions) setResults(subData.submissions);

      // Questions
      const qData = await api.getQuestions();
      if (qData.questions) setQuestions(qData.questions);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  useEffect(() => {
    if (!adminLoggedIn) return;
    fetchDashboardData();
    const intv = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(intv);
  }, [adminLoggedIn]);

  // Start or end exam via API
  const updateExamStatus = async (isActive) => {
    try {
      if (isActive) {
        await api.startExam();
      } else {
        await api.endExam();
      }
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update exam status:', err);
    }
  };

  return (
    <AdminContext.Provider value={{
      adminLoggedIn, setAdminLoggedIn,
      examSettings, setExamSettings,
      questions, setQuestions,
      students, setStudents,
      allViolations, setAllViolations,
      results, setResults,
      updateExamStatus,
      fetchDashboardData
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
