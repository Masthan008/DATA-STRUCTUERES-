import React, { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useExam } from '../../context/ExamContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Navbar } from '../../components/Navbar';
import { Loader2, UserCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl pb-6">
            <div className="mx-auto bg-brand-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
               <UserCircle2 size={32} className="text-brand-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome, {student.name}</CardTitle>
            <div className="flex justify-center gap-4 mt-3 text-sm text-slate-500">
               <span className="font-medium bg-white px-3 py-1 rounded-full border border-slate-200">Reg: {student.regNo}</span>
               <span className="font-medium bg-white px-3 py-1 rounded-full border border-slate-200">Sys: {student.systemNo}</span>
            </div>
          </CardHeader>
          <CardContent className="py-12">
            <Loader2 size={48} className="mx-auto animate-spin text-brand-primary mb-6" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Waiting for Admin</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              Please wait while the administrator starts the examination. Do not refresh this page.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default WaitingRoom;
