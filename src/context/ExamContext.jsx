import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

export const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [student, setStudent] = useState(() => JSON.parse(sessionStorage.getItem('exam_student')) || null);
  const [examActive, setExamActive] = useState(() => JSON.parse(sessionStorage.getItem('exam_active')) || false);
  const [examSubmitted, setExamSubmitted] = useState(() => JSON.parse(sessionStorage.getItem('exam_submitted')) || false);
  const [violations, setViolations] = useState(() => JSON.parse(sessionStorage.getItem('exam_violations')) || []);
  const [timeRemaining, setTimeRemaining] = useState(() => Number(sessionStorage.getItem('exam_timeRemaining')) || 0);
  const [questions, setQuestions] = useState(() => JSON.parse(sessionStorage.getItem('exam_questions')) || []);

  useEffect(() => sessionStorage.setItem('exam_student', JSON.stringify(student)), [student]);
  useEffect(() => sessionStorage.setItem('exam_active', JSON.stringify(examActive)), [examActive]);
  useEffect(() => sessionStorage.setItem('exam_submitted', JSON.stringify(examSubmitted)), [examSubmitted]);
  useEffect(() => sessionStorage.setItem('exam_violations', JSON.stringify(violations)), [violations]);
  useEffect(() => sessionStorage.setItem('exam_timeRemaining', timeRemaining.toString()), [timeRemaining]);
  useEffect(() => sessionStorage.setItem('exam_questions', JSON.stringify(questions)), [questions]);

  useEffect(() => {
    let prevExamActive = JSON.parse(sessionStorage.getItem('exam_active')) || false;

    const fetchExamStatus = async () => {
      const alreadySubmitted = JSON.parse(sessionStorage.getItem('exam_submitted')) || false;
      if (alreadySubmitted) return;
      try {
        const storedStudent = JSON.parse(sessionStorage.getItem('exam_student'));
        const data = await api.getExamStatus(storedStudent?.admin_id);
        if (data && data.error) return;

        // Check if student has been blacklisted
        if (storedStudent?.id) {
          try {
            const statusRes = await fetch(`/api/student/status/${storedStudent.id}`);
            const statusData = await statusRes.json();
            if (statusData.blacklisted) {
              // Force logout
              sessionStorage.clear();
              window.location.href = '/student/login';
              return;
            }
          } catch {}
        }

        if (data && typeof data.exam_active !== 'undefined') {
          if (data.exam_active && !prevExamActive) {
            sessionStorage.removeItem('exam_timeRemaining');
          }
          prevExamActive = data.exam_active;
          setExamActive(data.exam_active);
          if (data.exam_active && data.remaining_time != null) {
            const localTime = Number(sessionStorage.getItem('exam_timeRemaining')) || 0;
            if (localTime === 0 || Math.abs(data.remaining_time - localTime) > 10) {
              setTimeRemaining(data.remaining_time);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch exam status:', err);
      }
    };

    const interval = setInterval(fetchExamStatus, 5000);
    fetchExamStatus();
    return () => clearInterval(interval);
  }, []);

  const loginStudent = async (details) => {
    try {
      const data = await api.studentLogin(details);
      if (data.error) return { error: data.error };
      setStudent(data.student);
      const qData = await api.getRandomQuestions(data.student.id, data.student.admin_id);
      if (qData.questions) setQuestions(qData.questions);
      return { student: data.student };
    } catch (err) {
      console.error('Login failed:', err);
      setStudent(details);
      return { student: details };
    }
  };

  const addViolation = async (violation) => {
    const newViolation = { ...violation, timestamp: new Date() };
    setViolations(prev => [...prev, newViolation]);
    if (student?.id) {
      try {
        await api.logViolation({
          student_id: student.id,
          regd_no: student.regd_no || student.regNo,
          violation_type: violation.type,
        });
      } catch (err) {
        console.error('Failed to log violation:', err);
      }
    }
  };

  const endExamSession = () => {
    setExamActive(false);
    setExamSubmitted(true);
    sessionStorage.removeItem('exam_active');
    sessionStorage.setItem('exam_submitted', 'true');
  };

  const logout = () => {
    setStudent(null);
    setExamActive(false);
    setExamSubmitted(false);
    setQuestions([]);
    setViolations([]);
    sessionStorage.clear();
  };

  return (
    <ExamContext.Provider value={{
      student, loginStudent, logout,
      examActive, setExamActive,
      examSubmitted,
      violations, addViolation,
      timeRemaining, setTimeRemaining,
      questions,
      endExamSession,
    }}>
      {children}
    </ExamContext.Provider>
  );
};
export const useExam = () => useContext(ExamContext);
