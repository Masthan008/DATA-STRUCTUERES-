import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [student, setStudent] = useState(() => JSON.parse(sessionStorage.getItem('exam_student')) || null);
  const [examActive, setExamActive] = useState(() => JSON.parse(sessionStorage.getItem('exam_active')) || false);
  const [violations, setViolations] = useState(() => JSON.parse(sessionStorage.getItem('exam_violations')) || []);
  const [timeRemaining, setTimeRemaining] = useState(() => Number(sessionStorage.getItem('exam_timeRemaining')) || 0);
  const [questions, setQuestions] = useState(() => JSON.parse(sessionStorage.getItem('exam_questions')) || []);
  
  // Sync local state to sessionStorage
  useEffect(() => sessionStorage.setItem('exam_student', JSON.stringify(student)), [student]);
  useEffect(() => sessionStorage.setItem('exam_active', JSON.stringify(examActive)), [examActive]);
  useEffect(() => sessionStorage.setItem('exam_violations', JSON.stringify(violations)), [violations]);
  useEffect(() => sessionStorage.setItem('exam_timeRemaining', timeRemaining.toString()), [timeRemaining]);
  useEffect(() => sessionStorage.setItem('exam_questions', JSON.stringify(questions)), [questions]);

  // Poll Neon DB (via Express API) for exam status — every 5 seconds
  useEffect(() => {
    const fetchExamStatus = async () => {
      try {
        const data = await api.getExamStatus();
        setExamActive(data.exam_active);
        
        // Sync timer from server if exam just started and local timer is 0
        if (data.exam_active && data.remaining_time && Number(sessionStorage.getItem('exam_timeRemaining')) === 0) {
          setTimeRemaining(data.remaining_time);
        }
      } catch (err) {
        console.error('Failed to fetch exam status:', err);
      }
    };

    const interval = setInterval(fetchExamStatus, 5000);
    fetchExamStatus(); // initial fetch
    return () => clearInterval(interval);
  }, []);

  // Login student via Neon API
  const loginStudent = async (details) => {
    try {
      const data = await api.studentLogin(details);

      if (data.error) {
        console.error('Login error:', data.error);
        return { error: data.error };
      }

      setStudent(data.student);

      // Fetch random questions for the student session
      const qData = await api.getRandomQuestions();
      if (qData.questions) {
        setQuestions(qData.questions);
      }

      return { student: data.student };
    } catch (err) {
      console.error('Login failed:', err);
      // Fallback to local state so UI still works offline
      setStudent(details);
      return { student: details };
    }
  };

  // Log violation to Neon DB
  const addViolation = async (violation) => {
    const newViolation = { ...violation, timestamp: new Date() };
    setViolations(prev => [...prev, newViolation]);

    if (student?.id) {
      try {
        await api.logViolation({
          student_id: student.id,
          regd_no: student.regd_no || student.regNo,
          violation_type: violation.type
        });
      } catch (err) {
        console.error('Failed to log violation:', err);
      }
    }
  };

  const endExamSession = () => {
    setExamActive(false);
    setStudent(null);
    setViolations([]);
    setTimeRemaining(0);
    setQuestions([]);
    sessionStorage.removeItem('exam_student');
    sessionStorage.removeItem('exam_active');
    sessionStorage.removeItem('exam_violations');
    sessionStorage.removeItem('exam_timeRemaining');
    sessionStorage.removeItem('exam_questions');
  };
  
  return (
    <ExamContext.Provider value={{
      student, loginStudent,
      examActive, setExamActive,
      violations, addViolation,
      timeRemaining, setTimeRemaining,
      questions,
      endExamSession
    }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => useContext(ExamContext);
