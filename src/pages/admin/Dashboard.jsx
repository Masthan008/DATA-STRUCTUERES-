import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Users, AlertTriangle, PlayCircle, StopCircle, FileText, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const { students, allViolations, examSettings, updateExamStatus, results } = useAdmin();

  const stats = [
    {
      label: 'Total Students',
      value: students.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Violations',
      value: allViolations.length,
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Submissions',
      value: results?.length || 0,
      icon: FileText,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Exam Status',
      value: examSettings?.exam_active ? 'Active' : 'Inactive',
      icon: Activity,
      color: examSettings?.exam_active ? 'from-emerald-500 to-teal-500' : 'from-slate-400 to-slate-500',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Exam control center and live statistics</p>
        </div>
        <div className="flex gap-3">
          {examSettings && !examSettings.exam_active ? (
            <Button onClick={() => updateExamStatus(true)} className="gap-2" variant="success">
              <PlayCircle size={18} /> Start Exam
            </Button>
          ) : (
            <Button variant="danger" onClick={() => updateExamStatus(false)} className="gap-2">
              <StopCircle size={18} /> End Exam
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} hover className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                  <stat.icon size={16} className="text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Exam Configuration</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Duration</span>
                <span className="font-semibold text-slate-900">{examSettings?.duration || 60} minutes</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Allowed Devices</span>
                <span className="font-semibold text-slate-900 capitalize">{examSettings?.allowedDevice || 'desktop'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Status</span>
                <span className={`font-semibold ${examSettings?.exam_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {examSettings?.exam_active ? '● Running' : '○ Stopped'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Recent Activity</h3>
            {allViolations.length > 0 ? (
              <div className="space-y-2">
                {allViolations.slice(0, 4).map((v, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm py-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-slate-600 truncate">{v.student_name || 'Student'} — {v.violation_type}</span>
                    <span className="text-xs text-slate-400 ml-auto shrink-0">{new Date(v.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
