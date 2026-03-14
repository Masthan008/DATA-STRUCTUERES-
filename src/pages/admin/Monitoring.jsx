import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/Table';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Users, Wifi, Ban, Send } from 'lucide-react';
import api from '../../utils/api';

const Monitoring = () => {
  const { students, setStudents, fetchDashboardData } = useAdmin();
  const [actionLoading, setActionLoading] = useState(null); // student id being acted on

  const handleBlacklist = async (student) => {
    setActionLoading(student.id + '_blacklist');
    try {
      await api.blacklistStudent({ student_id: student.id, blacklisted: !student.blacklisted });
      setStudents(students.map(s => s.id === student.id ? { ...s, blacklisted: !s.blacklisted } : s));
    } catch (err) { console.error(err); }
    setActionLoading(null);
  };

  const handleForceSubmit = async (student) => {
    if (!window.confirm(`Force-submit exam for ${student.name}? This will end their session.`)) return;
    setActionLoading(student.id + '_force');
    try {
      await api.forceSubmitStudent(student.id);
      await fetchDashboardData();
    } catch (err) { console.error(err); }
    setActionLoading(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Monitor</h1>
          <p className="text-sm text-slate-500 mt-0.5">Live view of connected students</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <Wifi size={12} /> Live
        </div>
      </div>

      {students.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Reg. No.</TableHead>
              <TableHead>System</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Violations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s, i) => (
              <TableRow key={s.id || i} className={s.blacklisted ? 'bg-red-50/60 opacity-70' : s.violations > 0 ? 'bg-amber-50/40' : ''}>
                <TableCell className="font-mono text-xs text-slate-400">{i + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {s.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-900 text-sm">{s.name}</span>
                  </div>
                </TableCell>
                <TableCell><code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{s.regd_no || s.regNo}</code></TableCell>
                <TableCell className="text-sm">{s.system_no || s.systemNo}</TableCell>
                <TableCell>
                  <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium">{s.device_type || s.device}</span>
                </TableCell>
                <TableCell>
                  {s.violations > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">⚠ {s.violations}</span>
                  ) : (
                    <span className="text-emerald-600 text-xs font-semibold">✓ Clean</span>
                  )}
                </TableCell>
                <TableCell>
                  {s.blacklisted
                    ? <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">Blacklisted</span>
                    : s.exam_started
                      ? <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Active</span>
                      : <span className="text-xs text-slate-400">Inactive</span>
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleForceSubmit(s)}
                      disabled={actionLoading === s.id + '_force' || !s.exam_started}
                      className="h-7 text-xs gap-1 text-amber-600 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-30"
                      title="Force submit exam"
                    >
                      <Send size={12} /> Force Submit
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleBlacklist(s)}
                      disabled={actionLoading === s.id + '_blacklist'}
                      className={`h-7 text-xs gap-1 ${s.blacklisted ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50 hover:text-red-700'}`}
                      title={s.blacklisted ? 'Remove from blacklist' : 'Blacklist student'}
                    >
                      <Ban size={12} /> {s.blacklisted ? 'Unban' : 'Blacklist'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Users size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No students connected yet</p>
            <p className="text-slate-400 text-xs mt-1">Students will appear here once they log in</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Monitoring;
