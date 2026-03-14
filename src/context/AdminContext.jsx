import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdminState] = useState(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [examSettings, setExamSettings] = useState({ duration: 60, allowedDevice: 'desktop', exam_active: false });
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [allViolations, setAllViolations] = useState([]);
  const [results, setResults] = useState([]);

  const setAdmin = (adminData) => {
    setAdminState(adminData);
    setAdminLoggedIn(!!adminData);
  };

  const logoutAdmin = () => {
    setAdminState(null);
    setAdminLoggedIn(false);
  };

  const fetchDashboardData = async () => {
    if (!adminLoggedIn) return;
    try {
      const statusData = await api.getExamStatus();
      if (statusData && !statusData.error) {
        setExamSettings({
          duration: statusData.exam_duration || 60,
          allowedDevice: statusData.allowed_device || 'desktop',
          evaluation_mode: statusData.evaluation_mode || 'auto',
          exam_active: statusData.exam_active || false
        });
      }
      const stdData = await api.getStudents();
      if (stdData.students) setStudents(stdData.students);
      const vioData = await api.getViolations();
      if (vioData.violations) setAllViolations(vioData.violations);
      const subData = await api.getSubmissions();
      if (subData.submissions) setResults(subData.submissions);
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

  const updateExamStatus = async (isActive) => {
    try {
      if (isActive) await api.startExam();
      else await api.endExam();
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update exam status:', err);
    }
  };

  return (
    <AdminContext.Provider value={{
      admin, setAdmin,
      adminLoggedIn, setAdminLoggedIn,
      logoutAdmin,
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