import React, { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useExam } from '../../context/ExamContext';
import { Card, CardContent } from '../../components/Card';
import { Navbar } from '../../components/Navbar';
import { UserCircle2, Hash, Monitor } from 'lucide-react';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const { student, examActive } = useExam();

  useEffect(() => {
    if (examActive) {
      navigate('/student/exam');
    }
  }, [examActive, navigate]);

  if (!student) {
    return <Navigate to="/student/login" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg animate-slide-up text-center">
          {/* Avatar */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center mb-6 shadow-lg shadow-brand-primary/20">
            <span className="text-3xl font-bold text-white">{student.name?.charAt(0)?.toUpperCase()}</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome, {student.name}</h2>
          <p className="text-slate-500 text-sm mb-6">You're checked in and ready for the exam</p>

          {/* Info Chips */}
          <div className="flex justify-center gap-3 mb-8">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 shadow-sm">
              <Hash size={14} className="text-brand-primary" />
              <span className="font-medium">{student.regd_no || student.regNo}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 shadow-sm">
              <Monitor size={14} className="text-brand-primary" />
              <span className="font-medium">{student.system_no || student.systemNo}</span>
            </div>
          </div>

          {/* Waiting Card */}
          <Card className="shadow-elevated">
            <CardContent className="py-10 px-6">
              {/* Animated Loader */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-[3px] border-slate-200" />
                  <div className="w-12 h-12 rounded-full border-[3px] border-brand-primary border-t-transparent animate-spin absolute inset-0" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">Waiting for Admin</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                The exam will begin automatically once the administrator starts the session. Please do not close this tab.
              </p>

              {/* Status Indicator */}
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Standby Mode
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default WaitingRoom;
