import { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../utils/api';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdminState] = useState(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [examSettings, setExamSettings] = useState({ duration: 60, allowedDevice: 'desktop', evaluation_mode: 'auto', exam_active: false });
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [allViolations, setAllViolations] = useState([]);
  const [results, setResults] = useState([]);

  // Ref so interval callbacks always get the latest admin without re-creating the interval
  const adminRef = useRef(null);

  const setAdmin = (adminData) => {
    setAdminState(adminData);
    adminRef.current = adminData;
    setAdminLoggedIn(!!adminData);
  };

  const logoutAdmin = () => {
    setAdminState(null);
    adminRef.current = null;
    setAdminLoggedIn(false);
  };

  const fetchDashboardData = async () => {
    if (!adminRef.current) return;
    try {
      const adminId = adminRef.current.id;
      const statusData = await api.getExamStatus(adminId);
      if (statusData && !statusData.error) {
        // Value-equality check — only update state if something actually changed
        // Normalize types: DB returns strings for numbers sometimes
        setExamSettings(prev => {
          const next = {
            duration: Number(statusData.exam_duration) || 60,
            allowedDevice: statusData.allowed_device || 'desktop',
            evaluation_mode: statusData.evaluation_mode || 'auto',
            exam_active: Boolean(statusData.exam_active)
          };
          if (
            prev.duration === next.duration &&
            prev.allowedDevice === next.allowedDevice &&
            prev.evaluation_mode === next.evaluation_mode &&
            prev.exam_active === next.exam_active
          ) return prev;
          return next;
        });
      }
      const stdData = await api.getStudents(adminId);
      if (stdData.students) setStudents(stdData.students);
      const vioData = await api.getViolations(adminId);
      if (vioData.violations) setAllViolations(vioData.violations);
      const subData = await api.getSubmissions(adminId);
      if (subData.submissions) setResults(subData.submissions);
      const qData = await api.getQuestions(adminId);
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
      const adminId = adminRef.current?.id;
      if (isActive) await api.startExam(adminId);
      else await api.endExam(adminId);
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
