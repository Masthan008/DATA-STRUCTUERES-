import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useExam } from '../../context/ExamContext';
import { QuestionPanel } from '../../components/exam/QuestionPanel';
import { CodeEditor } from '../../components/exam/CodeEditor';
import { OutputConsole } from '../../components/exam/OutputConsole';
import { ExamTimer } from '../../components/ExamTimer';
import { Button } from '../../components/Button';
import { setupAntiCheat, enterFullscreen, exitFullscreen } from '../../utils/antiCheat';
import api from '../../utils/api';
import { Play, Send, ShieldAlert, Code2, User, Hash, Monitor, CheckCircle } from 'lucide-react';

const ExamPage = () => {
  const { student, examActive, setTimeRemaining, timeRemaining, addViolation, violations, endExamSession, questions } = useExam();
  const navigate = useNavigate();

  const DEFAULT_CODE = `#include <stdio.h>\n\nint main() {\n    return 0;\n}`;
  const [code, setCode] = useState(sessionStorage.getItem('saved_code') || DEFAULT_CODE);
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [lastViolationMsg, setLastViolationMsg] = useState('');

  // Initialize Exam
  useEffect(() => {
    if (!student || !examActive) return;
    enterFullscreen();

    const cleanupAntiCheat = setupAntiCheat((violation) => {
      addViolation(violation);
      setLastViolationMsg(violation.message);
      setShowViolationModal(true);
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
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examActive]);

  // Auto Save
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
        body: JSON.stringify({ source_code: code, language_id: 50 })
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
    setIsRunning(true);
    let finalStatus = 'Submitted';
    let finalScore = 0;
    let evalDetails = [];
    
    try {
      // Fetch settings to check evaluation mode
      const settingsRaw = await api.getExamStatus();
      const isAutoEval = settingsRaw.evaluation_mode === 'auto';
      
      const questionId = questions[0]?.id;
      
      if (isAutoEval && questionId) {
        // Fetch test cases
        const tcRes = await fetch(`http://localhost:5000/api/questions/${questionId}/testcases`);
        const tcData = await tcRes.json();
        const testcases = tcData.testcases || [];
        
        if (testcases.length > 0) {
          let passedCt = 0;
          
          for (let tc of testcases) {
            // Run Judge0
            const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ source_code: code, language_id: 50, stdin: tc.input })
            });
            const result = await response.json();
            
            const actualOut = (result.stdout || '').trim();
            const expectedOut = (tc.expected_output || '').trim();
            const passed = (result.status?.id === 3) && (actualOut === expectedOut);
            
            if (passed) passedCt++;
            
            evalDetails.push({
              input: tc.input,
              expected: expectedOut,
              actual: actualOut,
              status: passed ? 'Pass' : 'Fail',
              error: result.stderr || result.compile_output || null
            });
          }
          
          finalScore = Math.round((passedCt / testcases.length) * 100);
          finalStatus = passedCt === testcases.length ? 'PASS' : 'FAIL';
        }
      }

      await api.submitCode({
        student_id: student.id,
        question_id: questionId,
        code,
        output: isAutoEval ? (evalDetails.length ? evalDetails[0].actual : output) : output,
        status: isAutoEval ? finalStatus : (isError ? 'Error' : 'Success'),
        score: finalScore,
        evaluation_details: evalDetails
      });
      
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsRunning(false);
      setIsError(false);
      setOutput('Code submitted successfully.');
      
      endExamSession();
      sessionStorage.removeItem('saved_code');
      
      navigate('/student/submitted');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F1F5F9] select-none relative">
      
      {/* Violation Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-scale-in">
            <div className="mx-auto w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
              <ShieldAlert size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Security Alert</h3>
            <p className="text-slate-500 text-sm">{lastViolationMsg || 'Suspicious activity detected.'}</p>
            
            {violations.length > 3 && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold border border-red-200">
                ⚠ Multiple violations detected. Your exam will be flagged for review.
              </div>
            )}
            
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-semibold">
              Violations: <span className="text-red-600 font-bold">{violations.length}</span>
            </div>

            <Button className="w-full" onClick={() => {
               setShowViolationModal(false);
               enterFullscreen();
            }}>
              Return to Exam
            </Button>
          </div>
        </div>
      )}

      {/* Top Navbar — HackerRank style */}
      <header className="h-12 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex bg-gradient-to-br from-brand-primary to-brand-accent text-white p-1.5 rounded-lg">
            <Code2 size={16} />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900">{questions[0]?.title || 'Exam'}</h1>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">LIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><User size={12} /> {student.name}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1"><Hash size={12} /> {student.regd_no || student.regNo}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1"><Monitor size={12} /> {student.system_no || student.systemNo}</span>
          </div>
          <ExamTimer />
        </div>
      </header>

      {/* Status Bar */}
      <div className="h-7 bg-[#0d1117] text-[10px] font-medium flex items-center justify-between px-4 text-slate-500 z-40 border-b border-[#21262d]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Platform Active</span>
          <span className="flex items-center gap-1"><CheckCircle size={10} /> Auto-save enabled</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Mode: Fullscreen</span>
          <span className={violations.length > 0 ? "text-red-400 font-bold" : "text-emerald-400"}>
            Flags: {violations.length}
          </span>
        </div>
      </div>
      
      {/* Main Content — Split View */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Question Panel (40%) */}
        <div className="w-[40%] min-w-[300px] h-full">
          <QuestionPanel question={questions[0]} />
        </div>

        {/* Right: Editor + Console (60%) */}
        <div className="flex-1 flex flex-col h-full bg-[#0d1117]">
          <CodeEditor code={code} setCode={setCode} />
          
          {/* Action Bar */}
          <div className="bg-[#161b22] px-4 py-2 flex justify-end gap-2 border-t border-[#21262d]">
            <Button variant="outline" onClick={handleRunCode} disabled={isRunning} className="h-8 text-xs bg-[#21262d] border-[#30363d] text-slate-300 hover:bg-[#30363d] gap-1.5">
              <Play size={13} /> Run Code
            </Button>
            <Button onClick={handleSubmit} className="h-8 text-xs gap-1.5" variant="success">
              <Send size={13} /> Submit
            </Button>
          </div>
          
          <OutputConsole output={output} isRunning={isRunning} isError={isError} />
        </div>
      </main>
    </div>
  );
};

export default ExamPage;
