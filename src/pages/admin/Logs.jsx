import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/Table';
import { Card, CardContent } from '../../components/Card';
import { AlertTriangle, MousePointerClick, Maximize, CopySlash } from 'lucide-react';

const Logs = () => {
  const { allViolations } = useAdmin();

  // Mock initial logs if empty for demo purposes
  const displayLogs = allViolations.length > 0 ? allViolations : [
    { studentName: 'Alice Smith', regNo: 'REG002', type: 'fullscreen_exit', message: 'Exited fullscreen mode', timestamp: new Date(Date.now() - 300000) },
    { studentName: 'Alice Smith', regNo: 'REG002', type: 'copy_paste', message: 'Copy/Paste is disabled during the exam', timestamp: new Date(Date.now() - 500000) },
    { studentName: 'Charlie Brown', regNo: 'REG005', type: 'tab_switch', message: 'Switched tabs or minimized window', timestamp: new Date(Date.now() - 1500000) },
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'fullscreen_exit': return <Maximize size={16} className="text-amber-500" />;
      case 'copy_paste': return <CopySlash size={16} className="text-red-500" />;
      case 'right_click': return <MousePointerClick size={16} className="text-orange-500" />;
      case 'tab_switch': return <AlertTriangle size={16} className="text-purple-500" />;
      default: return <AlertTriangle size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Logs</h1>
        <p className="text-slate-500 mt-1">Detailed history of all triggered anti-cheat events.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Reg. Number</TableHead>
                <TableHead>Violation Type</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayLogs.map((log, i) => (
                <TableRow key={i}>
                  <TableCell className="text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">{log.students?.name || log.studentName}</TableCell>
                  <TableCell>{log.regd_no || log.regNo}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       {getIcon(log.violation_type || log.type)}
                       <span className="capitalize">{(log.violation_type || log.type).replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{log.violation_type || log.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {displayLogs.length === 0 && (
            <div className="text-center py-12 text-slate-500">No violations recorded yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Logs;
