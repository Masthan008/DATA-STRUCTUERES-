import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/Table';
import { Card, CardContent } from '../../components/Card';
import { Users, Wifi } from 'lucide-react';

const Monitoring = () => {
  const { students } = useAdmin();

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s, i) => (
              <TableRow key={i} className={s.violations > 0 ? 'bg-red-50/40 hover:bg-red-50/60' : ''}>
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
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      ⚠ {s.violations}
                    </span>
                  ) : (
                    <span className="text-emerald-600 text-xs font-semibold">✓ Clean</span>
                  )}
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
