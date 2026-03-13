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
import { Play, Send, ShieldAlert, Code2, User, Hash, Monitor, CheckCircle, Save, Menu } from 'lucide-react';
import { cn as clsx } from '../../utils/clsx';

const ExamPage = () => {
  const { student, examActive, setTimeRemaining, timeRemaining, addViolation, violations, endExamSession, questions } = useExam();
  const navigate = useNavigate();

  const DEFAULT_CODE = `#include <stdio.h>\n\nint main() {\n    return 0;\n}`;
  
  // Multi-question state
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [codePerQuestion, setCodePerQuestion] = useState({});
  const [statusPerQuestion, setStatusPerQuestion] = useState({});
  const [resultsPerQuestion, setResultsPerQuestion] = useState({});
  
  // UI state
  const [isRunning, setIsRunning] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [lastViolationMsg, setLastViolationMsg] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize Exam & Load Saved States
  useEffect(() => {
    if (!student || !examActive || questions.length === 0) return;
    enterFullscreen();

    // Load from session storage
    const savedCode = JSON.parse(sessionStorage.getItem('exam_code_state')) || {};
    const savedStatus = JSON.parse(sessionStorage.getItem('exam_status_state')) || {};
    
    // Initialize default states for questions if not exist
    const initialCode = { ...savedCode };
    const initialStatus = { ...savedStatus };
    
    questions.forEach(q => {
      if (!initialCode[q.id]) initialCode[q.id] = DEFAULT_CODE;
      if (!initialStatus[q.id]) initialStatus[q.id] = 'Not Attempted';
    });
    
    setCodePerQuestion(initialCode);
    setStatusPerQuestion(initialStatus);

    const cleanupAntiCheat = setupAntiCheat((violation) => {
      addViolation(violation);
      setLastViolationMsg(violation.message);
      setShowViolationModal(true);
    });

    return () => {
      cleanupAntiCheat();
    };
  }, [student, examActive, questions]);

  // Timer Tick
  useEffect(() => {
    if (!examActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitFinalExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examActive]);

  // Auto Save
  useEffect(() => {
    if (!examActive || Object.keys(codePerQuestion).length === 0) return;
    const saveInterval = setInterval(() => {
      sessionStorage.setItem('exam_code_state', JSON.stringify(codePerQuestion));
      sessionStorage.setItem('exam_status_state', JSON.stringify(statusPerQuestion));
    }, 5000);
    return () => clearInterval(saveInterval);
  }, [codePerQuestion, statusPerQuestion, examActive]);

  if (!student) return <Navigate to="/student/login" replace />;
  if (!examActive) return <Navigate to="/student/waiting" replace />;

  const currentQuestionId = questions[activeQuestionIndex]?.id;
  const currentCode = codePerQuestion[currentQuestionId] || DEFAULT_CODE;
  const currentOutput = resultsPerQuestion[currentQuestionId] || null;

  const updateCurrentCode = (newCode) => {
    setCodePerQuestion(prev => ({
      ...prev,
      [currentQuestionId]: newCode
    }));
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    
    try {
      const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: currentCode, language_id: 50 })
      });
      
      const data = await response.json();
      
      let resData = { time: data.time };
      
      if (data.compile_output) {
        resData.compileError = data.compile_output;
      } else if (data.stderr) {
        resData.runtimeError = data.stderr;
      } else if (data.status?.id === 3) {
        resData.output = data.stdout || '';
      } else {
        resData.runtimeError = data.message || `Runtime Error: ${data.status?.description}`;
      }
      
      setResultsPerQuestion(prev => ({
        ...prev,
        [currentQuestionId]: resData
      }));
      
      // Upsert run count in backend
      await api.submitCode({
        student_id: student.id,
        question_id: currentQuestionId,
        code: currentCode,
        output: resData.output || resData.compileError || resData.runtimeError,
        status: statusPerQuestion[currentQuestionId] === 'Submitted' ? 'Submitted' : 'Saved'
      });
      
      if (statusPerQuestion[currentQuestionId] === 'Not Attempted') {
        setStatusPerQuestion(prev => ({...prev, [currentQuestionId]: 'Saved'}));
      }

    } catch (error) {
      setResultsPerQuestion(prev => ({
        ...prev,
        [currentQuestionId]: { runtimeError: 'Failed to connect to compilation server. Check network connection.' }
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveCode = async () => {
    setIsRunning(true);
    try {
      await api.saveCode({
        student_id: student.id,
        question_id: currentQuestionId,
        code: currentCode
      });
      setStatusPerQuestion(prev => ({
        ...prev,
        [currentQuestionId]: 'Saved'
      }));
      setResultsPerQuestion(prev => ({
        ...prev,
        [currentQuestionId]: { output: 'Code saved successfully.' }
      }));
    } catch (err) {
      console.error(err);
      setResultsPerQuestion(prev => ({
        ...prev,
        [currentQuestionId]: { runtimeError: 'Failed to save code to server.' }
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitQuestion = async () => {
    setIsRunning(true);
    let finalStatus = 'Submitted';
    let finalScore = 0;
    let evalDetails = [];
    
    try {
      const settingsRaw = await api.getExamStatus();
      const isAutoEval = settingsRaw.evaluation_mode === 'auto';
      
      if (isAutoEval && currentQuestionId) {
        // Fetch test cases
        const tcRes = await fetch(`http://localhost:5000/api/questions/${currentQuestionId}/testcases`);
        const tcData = await tcRes.json();
        const testcases = tcData.testcases || [];
        
        if (testcases.length > 0) {
          let passedCt = 0;
          for (let tc of testcases) {
            const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ source_code: currentCode, language_id: 50, stdin: tc.input })
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
        question_id: currentQuestionId,
        code: currentCode,
        output: isAutoEval ? (evalDetails.length ? evalDetails[0].actual : currentOutput?.output) : currentOutput?.output,
        status: isAutoEval ? finalStatus : 'Pending Admin Evaluation',
        score: finalScore,
        evaluation_details: evalDetails
      });
      
      setStatusPerQuestion(prev => ({
        ...prev,
        [currentQuestionId]: 'Submitted'
      }));
      
      setResultsPerQuestion(prev => ({
        ...prev,
        [currentQuestionId]: { output: 'Question submitted successfully.' }
      }));
      
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitFinalExam = async () => {
    setIsRunning(true);
    try {
      await api.submitFinalExam(student.id);
      sessionStorage.removeItem('exam_code_state');
      sessionStorage.removeItem('exam_status_state');
      // Keep student in storage to view summary page
      
      exitFullscreen();
      navigate('/student/exam-summary');
    } catch (err) {
      console.error(err);
      setIsRunning(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Submitted') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (status === 'Saved') return 'bg-blue-50 text-blue-600 border-blue-200';
    return 'bg-slate-50 text-slate-500 border-slate-200';
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

      {/* Top Navbar */}
      <header className="h-12 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="flex bg-gradient-to-br from-brand-primary to-brand-accent text-white p-1.5 rounded-lg">
            <Code2 size={16} />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900">Secure Exam Portal</h1>
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
          <Button onClick={handleSubmitFinalExam} variant="primary" className="h-8 text-xs font-bold shadow-glow-blue border border-brand-primary">
            Submit Final Exam
          </Button>
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
      
      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        {isSidebarOpen && (
          <div className="w-56 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 animate-fade-in">
            <div className="p-4 border-b border-slate-200 bg-white">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Questions ({questions.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {questions.map((q, idx) => {
                const status = statusPerQuestion[q.id] || 'Not Attempted';
                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={clsx(
                      "w-full text-left p-3 rounded-lg text-sm transition-all border outline-none flex flex-col gap-2",
                      activeQuestionIndex === idx 
                        ? "bg-white border-brand-primary shadow-sm ring-1 ring-brand-primary/20" 
                        : "bg-transparent border-transparent hover:bg-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={clsx("font-semibold", activeQuestionIndex === idx ? "text-slate-900" : "text-slate-600")}>
                        Question {idx + 1}
                      </span>
                      {status === 'Submitted' && <CheckCircle size={14} className="text-emerald-500" />}
                    </div>
                    <span className={clsx("text-[10px] px-1.5 py-0.5 rounded-md border inline-block w-fit font-semibold", getStatusColor(status))}>
                      {status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Left: Question Panel */}
        <div className="w-[35%] min-w-[300px] h-full shadow-[1px_0_10px_rgba(0,0,0,0.05)] z-10 transition-all">
          <QuestionPanel question={questions[activeQuestionIndex]} />
        </div>

        {/* Right: Editor + Console */}
        <div className="flex-1 flex flex-col h-full bg-[#0d1117] min-w-[400px]">
          <CodeEditor code={currentCode} setCode={updateCurrentCode} />
          
          {/* Action Bar */}
          <div className="bg-[#161b22] px-4 py-2 flex justify-between items-center border-t border-[#21262d]">
            <div className="text-xs text-slate-500 font-semibold space-x-4">
              <span>{Math.max(0, currentCode.split('\n').length)} Lines</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleSaveCode} 
                disabled={isRunning} 
                className="h-8 text-xs bg-[#21262d] border-[#30363d] text-slate-300 hover:bg-[#30363d] gap-1.5"
              >
                <Save size={13} /> Save Code
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRunCode} 
                disabled={isRunning} 
                className="h-8 text-xs bg-[#21262d] border-[#30363d] text-slate-300 hover:bg-[#30363d] gap-1.5"
              >
                <Play size={13} /> Run Code
              </Button>
              <Button 
                onClick={handleSubmitQuestion} 
                disabled={isRunning || statusPerQuestion[currentQuestionId] === 'Submitted'} 
                className="h-8 text-xs gap-1.5 min-w-[120px]" 
                variant="success"
              >
                {statusPerQuestion[currentQuestionId] === 'Submitted' ? 'Submitted ✓' : <><Send size={13} /> Submit Question</>}
              </Button>
            </div>
          </div>
          
          <OutputConsole outputData={currentOutput} isRunning={isRunning} isError={false} />
        </div>
      </main>
    </div>
  );
};

export default ExamPage;
