import React from 'react';
import { Navigate } from 'react-router-dom';
import { useExam } from '../../context/ExamContext';
import { Card, CardContent } from '../../components/Card';
import { Navbar } from '../../components/Navbar';
import { CheckCircle2 } from 'lucide-react';

const ExamSubmitted = () => {
  const { student } = useExam();

  if (!student) return <Navigate to="/student/login" replace />;

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg animate-slide-up text-center">
          <Card className="shadow-elevated border-t-4 border-t-emerald-500">
            <CardContent className="py-12 px-6">
              <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">Exam Submitted Successfully</h2>
              <p className="text-slate-500 mb-6">
                Thank you, {student.name}. Your code has been submitted and recorded.
              </p>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600 inline-block">
                Please wait for the administrator to review your results.
                <br />You may now close this tab safely.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ExamSubmitted;
