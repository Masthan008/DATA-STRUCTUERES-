import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/Table';
import { Card, CardContent } from '../../components/Card';
import { AlertTriangle, MousePointerClick, Maximize, CopySlash, Eye } from 'lucide-react';

const Logs = () => {
  const { allViolations } = useAdmin();

  const getViolationBadge = (type) => {
    const map = {
      fullscreen_exit: { icon: Maximize, label: 'Fullscreen Exit', color: 'bg-amber-100 text-amber-700' },
      copy_paste: { icon: CopySlash, label: 'Copy/Paste', color: 'bg-red-100 text-red-700' },
      right_click: { icon: MousePointerClick, label: 'Right Click', color: 'bg-orange-100 text-orange-700' },
      tab_switch: { icon: Eye, label: 'Tab Switch', color: 'bg-purple-100 text-purple-700' },
    };
    const v = map[type] || { icon: AlertTriangle, label: type?.replace('_', ' ') || 'Unknown', color: 'bg-slate-100 text-slate-600' };
    const Icon = v.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${v.color}`}>
        <Icon size={12} /> {v.label}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Violation Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">{allViolations.length} events recorded</p>
        </div>
      </div>

      {allViolations.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Reg. No.</TableHead>
              <TableHead>Violation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allViolations.map((log, i) => (
              <TableRow key={i}>
                <TableCell>
                  <span className="text-xs font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-900 text-sm">{log.students?.name || log.student_name || log.studentName}</span>
                </TableCell>
                <TableCell><code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{log.regd_no || log.regNo}</code></TableCell>
                <TableCell>{getViolationBadge(log.violation_type || log.type)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <AlertTriangle size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No violations recorded yet</p>
            <p className="text-slate-400 text-xs mt-1">All clear — no suspicious activity detected</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Logs;
