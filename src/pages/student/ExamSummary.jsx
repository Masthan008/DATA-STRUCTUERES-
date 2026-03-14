import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useExam } from '../../context/ExamContext';
import { Button } from '../../components/Button';
import api from '../../utils/api';
import { ShieldAlert, LogOut, CheckCircle2, User, Hash, Monitor, Code2, PlaySquare, FileCheck } from 'lucide-react';

const ExamSummary = () => {
  const { student, logout, examSubmitted } = useExam();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    
    const fetchSummary = async () => {
      try {
        const data = await api.getExamSummary(student.id);
        setSummary(data);
      } catch (error) {
        console.error('Failed to load exam summary', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [student]);

  if (!student) return <Navigate to="/student/login" replace />;
  if (!examSubmitted) return <Navigate to="/student/waiting" replace />;

  const handleLogout = () => {
    logout();
    navigate('/student/login');
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100">
        
        {/* Header section */}
        <div className="bg-slate-900 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-slate-900"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Exam Successfully Submitted</h1>
            <p className="text-slate-400">Your secure coding assessment is complete. You may now close this window.</p>
          </div>
        </div>

        <div className="p-8">
          
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-brand-primary animate-spin"></div>
            </div>
          ) : summary ? (
            <div className="space-y-8">
              
              {/* Student Info Card */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User size={16} className="text-brand-primary" />
                  Candidate Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block mb-1">Name</span>
                    <span className="text-sm font-semibold text-slate-900">{summary.student_name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block mb-1">Registration No</span>
                    <span className="text-sm font-semibold text-slate-900">{summary.regd_no}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block mb-1">System No</span>
                    <span className="text-sm font-semibold text-slate-900">{summary.system_no}</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Monitor size={16} className="text-brand-primary" />
                  Exam Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Stat Card 1 */}
                  <div className="bg-white border text-center border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 mx-auto">
                      <Code2 size={20} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-1">{summary.total_questions}</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Questions</div>
                  </div>
                  
                  {/* Stat Card 2 */}
                  <div className="bg-white border text-center border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3 mx-auto">
                      <FileCheck size={20} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-1">{summary.attempted_questions}</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Attempted</div>
                  </div>

                  {/* Stat Card 3 */}
                  <div className="bg-white border text-center border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3 mx-auto">
                      <PlaySquare size={20} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-1">{summary.total_runs}</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Code Runs</div>
                  </div>

                  {/* Stat Card 4 */}
                  <div className="bg-white border text-center border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3 mx-auto">
                      <ShieldAlert size={20} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-1">{summary.unattempted_questions}</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Unattempted</div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center p-8 text-slate-500">
              Unable to load exam summary.
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center">
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut size={16} /> Return to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSummary;
