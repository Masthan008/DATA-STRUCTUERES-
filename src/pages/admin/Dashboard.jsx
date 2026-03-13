import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Users, AlertTriangle, Clock, PlayCircle, StopCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { students, allViolations, examSettings, updateExamStatus } = useAdmin();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
        <div className="flex gap-3">
          {examSettings && !examSettings.exam_active ? (
            <Button onClick={() => updateExamStatus(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <PlayCircle size={20} /> Start Exam
            </Button>
          ) : (
            <Button variant="danger" onClick={() => updateExamStatus(false)} className="gap-2">
              <StopCircle size={20} /> End Exam
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Students</CardTitle>
            <Users className="text-brand-primary" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Violations</CardTitle>
            <AlertTriangle className="text-amber-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{allViolations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Exam Status</CardTitle>
            <Clock className="text-blue-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-slate-900">
              {examSettings?.exam_active ? (
                <span className="text-emerald-600 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Running</span>
              ) : (
                <span className="text-slate-500">Not Started</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Duration: {examSettings?.duration || 60} mins</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
