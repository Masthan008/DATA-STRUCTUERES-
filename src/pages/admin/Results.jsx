import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/Table';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Download, Trophy, CheckCircle, XCircle, Clock } from 'lucide-react';

const Results = () => {
  const { results } = useAdmin();

  const getStatusBadge = (status) => {
    if (status === 'Success' || status === 'Accepted') {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700"><CheckCircle size={12} /> Accepted</span>;
    }
    if (status === 'Error' || status === 'Wrong Answer') {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-700"><XCircle size={12} /> Failed</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-700"><Clock size={12} /> {status}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Results</h1>
          <p className="text-sm text-slate-500 mt-0.5">{results.length} submissions evaluated</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {results.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((res, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-xs text-slate-400">{i + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {(res.students?.name || res.student_name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{res.students?.name || res.student_name || res.studentName}</p>
                      <p className="text-xs text-slate-400">{res.students?.regd_no || res.regd_no || res.regNo}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-700">{res.questions?.title || res.question_title || res.question}</TableCell>
                <TableCell>{getStatusBadge(res.status)}</TableCell>
                <TableCell>
                  <span className={`font-bold text-sm ${(res.status === 'Success' || res.status === 'Accepted') ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {(res.status === 'Success' || res.status === 'Accepted') ? '10' : '0'} / 10
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Trophy size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No submissions yet</p>
            <p className="text-slate-400 text-xs mt-1">Results will appear once students submit their code</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Results;
