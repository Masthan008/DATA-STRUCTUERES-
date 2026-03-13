import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/Table';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { ExternalLink } from 'lucide-react';

const Results = () => {
  const { results } = useAdmin();

  // Mock initial results if empty for demo purposes
  const displayResults = results.length > 0 ? results : [
    { studentName: 'John Doe', regNo: 'REG001', question: 'Two Sum', status: 'Accepted', score: 10, timeTaken: '14 min' },
    { studentName: 'Alice Smith', regNo: 'REG002', question: 'Two Sum', status: 'Wrong Answer', score: 0, timeTaken: '45 min' },
    { studentName: 'Bob Johnson', regNo: 'REG003', question: 'Two Sum', status: 'Accepted', score: 10, timeTaken: '22 min' },
    { studentName: 'Charlie Brown', regNo: 'REG005', question: 'Two Sum', status: 'Time Limit Exceeded', score: 0, timeTaken: '60 min' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Exam Results</h1>
          <p className="text-slate-500 mt-1">View student submissions and automated scores.</p>
        </div>
        <Button variant="outline" className="gap-2 bg-white">
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time Taken</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayResults.map((res, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{res.students?.name || res.studentName}</div>
                    <div className="text-xs text-slate-500">{res.students?.regd_no || res.regNo}</div>
                  </TableCell>
                  <TableCell className="text-slate-700">{res.questions?.title || res.question}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      res.status === 'Success' || res.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                      res.status === 'Wrong Answer' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {res.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500">{res.timeTaken || '1 min'}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{res.status === 'Success' ? 10 : 0} / 10</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-brand-primary">
                      View Code <ExternalLink size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {displayResults.length === 0 && (
            <div className="text-center py-12 text-slate-500">No submissions to evaluate yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Results;
