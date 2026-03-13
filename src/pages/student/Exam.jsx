import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useExam } from '../../context/ExamContext';
import { QuestionPanel } from '../../components/exam/QuestionPanel';
import { CodeEditor } from '../../components/exam/CodeEditor';
import { OutputConsole } from '../../components/exam/OutputConsole';
import { Navbar } from '../../components/Navbar';
import { ExamTimer } from '../../components/ExamTimer';
import { Button } from '../../components/Button';
import { setupAntiCheat, enterFullscreen, exitFullscreen } from '../../utils/antiCheat';
import api from '../../utils/api';
import { Play, Send, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const ExamPage = () => {
  const { student, examActive, setTimeRemaining, timeRemaining, addViolation, violations, endExamSession, questions } = useExam();
  const navigate = useNavigate();

  const DEFAULT_CODE = `#include <stdio.h>\n\nint main() {\n    return 0;\n}`;
  const [code, setCode] = useState(sessionStorage.getItem('saved_code') || DEFAULT_CODE);
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [warning, setWarning] = useState(null);
  const [showViolationModal, setShowViolationModal] = useState(false);

  // Initialize Exam
  useEffect(() => {
    if (!student || !examActive) return;
    
    // Timer is set from server-side remaining_time via ExamContext
    // No need to set it here
    
    enterFullscreen();

    // Setup Anti-Cheat
    const cleanupAntiCheat = setupAntiCheat((violation) => {
      // Don't log duplicate immediately consecutive violations
      addViolation(violation);
      setWarning(violation.message);
      setShowViolationModal(true);
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => setWarning(null), 3000);
    });

    return () => {
      cleanupAntiCheat();
      exitFullscreen();
    };
  }, [student, examActive]);

  // Timer Tick
  useEffect(() => {
    if (!examActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(); // Auto-submit when time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examActive]);


  // Auto Save Logic
  useEffect(() => {
    if (!examActive) return;
    const saveInterval = setInterval(() => {
      sessionStorage.setItem('saved_code', code);
    }, 10000);
    return () => clearInterval(saveInterval);
  }, [code, examActive]);

  if (!student) return <Navigate to="/student/login" replace />;
  if (!examActive) return <Navigate to="/student/waiting" replace />;

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');
    setIsError(false);

    try {
      const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: code,
          language_id: 50 // C language
        })
      });
      
      const data = await response.json();

      if (data.compile_output) {
        setIsError(true);
        setOutput(data.compile_output);
      } else if (data.stderr) {
        setIsError(true);
        setOutput(data.stderr);
      } else if (data.status?.id === 3) {
        setIsError(false);
        setOutput(data.stdout || 'Program exited with no output.');
      } else {
        setIsError(true);
        setOutput(data.message || `Runtime Error: ${data.status?.description}`);
      }
    } catch (error) {
      setIsError(true);
      setOutput('Failed to connect to compilation server. Check network connection.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    // Save to Neon DB via Express API
    try {
      await api.submitCode({
        student_id: student.id,
        question_id: questions[0]?.id,
        code,
        output,
        status: isError ? 'Error' : 'Success'
      });
    } catch (err) {
      console.error('Submission failed:', err);
    }
    
    setIsError(false);
    setOutput('Code submitted successfully.');
    
    // Clear session entirely
    endExamSession();
    sessionStorage.removeItem('saved_code');

    setTimeout(() => {
      alert('Exam submitted successfully!');
      navigate('/');
    }, 1500);
  };

  const renderTopRight = () => (
    <div className="flex items-center gap-4">
      <div className="text-sm text-right hidden sm:block">
        <p className="font-semibold text-slate-900 leading-tight">{student.name}</p>
        <p className="text-slate-500 text-xs">{student.regd_no || student.regNo} | {student.system_no || student.systemNo}</p>
      </div>
      <ExamTimer />
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-brand-bg select-none relative">
      
      {/* Violation Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Security Warning</h3>
            <p className="text-slate-600 text-sm">{warning || 'A suspicious activity was detected.'}</p>
            
            {violations.length > 3 && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-200">
                Multiple suspicious activities detected. Your exam will be flagged for manual review.
              </div>
            )}
            
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Total Violations: {violations.length}
            </p>

            <Button className="w-full mt-2" onClick={() => {
               setShowViolationModal(false);
               enterFullscreen(); // force them back
            }}>
              Acknowledge & Return to Exam
            </Button>
          </div>
        </div>
      )}

      {/* Warning Toast */}
      {warning && !showViolationModal && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <AlertTriangle size={20} />
          <span className="font-medium">Warning: {warning}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar title={`Exam: ${questions[0]?.title || 'Untitled'}`} rightContent={renderTopRight()} />
      
      {/* System Message Bar */}
      <div className="h-8 bg-slate-900 text-slate-300 text-xs font-medium flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-4 border-r border-slate-700 pr-4">
           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Platform Active</span>
           <span className="flex items-center gap-1 text-slate-400">
             <Info size={12} /> Auto-saving enabled
           </span>
        </div>
        <div className="flex items-center gap-6">
           <span className="text-slate-400">Enforced Mode: Fullscreen</span>
           <span className={violations.length > 0 ? "text-amber-400 font-bold" : "text-emerald-400"}>
              Violations: {violations.length}
           </span>
        </div>
      </div>
      
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Question (40%) */}
        <div className="w-[40%] min-w-[300px] h-full">
          <QuestionPanel question={questions[0]} />
        </div>

        {/* Right Side: IDE (60%) */}
        <div className="flex-1 flex flex-col h-full bg-[#1e1e1e]">
          <CodeEditor code={code} setCode={setCode} />
          
          <div className="flex flex-col border-t border-slate-800">
            {/* Editor Action Bar */}
            <div className="bg-slate-900 p-3 flex justify-end gap-3 border-b border-slate-800">
              <Button variant="secondary" onClick={handleRunCode} disabled={isRunning} className="bg-slate-800 hover:bg-slate-700 h-9 shrink-0 gap-2">
                <Play size={16} /> Run Code
              </Button>
              <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 h-9 shrink-0 gap-2 shadow-emerald-900/20 shadow-lg">
                <Send size={16} /> Submit Answer
              </Button>
            </div>
            
            <OutputConsole output={output} isRunning={isRunning} isError={isError} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamPage;
