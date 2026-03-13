import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/Table';
import { Card, CardContent } from '../../components/Card';

const Monitoring = () => {
  const { students } = useAdmin();

  // Mock initial student data if empty for demo purposes
  const displayStudents = students.length > 0 ? students : [
    { name: 'John Doe', regNo: 'REG001', systemNo: 'LAB-PC-01', violations: 0, device: 'desktop' },
    { name: 'Alice Smith', regNo: 'REG002', systemNo: 'LAB-PC-02', violations: 2, device: 'desktop' },
    { name: 'Bob Johnson', regNo: 'REG003', systemNo: 'LAB-PC-03', violations: 0, device: 'desktop' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Student Monitoring</h1>
        <p className="text-slate-500 mt-1">Live monitoring of connected students and their statuses.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Reg. Number</TableHead>
                <TableHead>System ID</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Violations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayStudents.map((s, i) => (
                <TableRow key={i} className={s.violations > 0 ? 'bg-red-50/50 hover:bg-red-50' : ''}>
                  <TableCell className="font-medium text-slate-900">{s.name}</TableCell>
                  <TableCell>{s.regd_no || s.regNo}</TableCell>
                  <TableCell>{s.system_no || s.systemNo}</TableCell>
                  <TableCell className="capitalize">{s.device_type || s.device}</TableCell>
                  <TableCell>
                    {s.violations > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {s.violations} Warnings
                      </span>
                    ) : (
                      <span className="text-slate-500 text-sm">Clean</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Monitoring;
