import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/Table';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Download, Trophy, CheckCircle, XCircle, Clock, Eye, Code, ChevronRight, X, User } from 'lucide-react';
import { Input } from '../../components/Input';
import api from '../../utils/api';

const Results = () => {
  const { results, setResults, examSettings } = useAdmin();
  const [selectedSub, setSelectedSub] = useState(null);
  const [manualScore, setManualScore] = useState('');
  const [manualStatus, setManualStatus] = useState('Success');
  const [isUpdating, setIsUpdating] = useState(false);

  const isManualMode = examSettings?.evaluation_mode === 'manual';

  const getStatusBadge = (status) => {
    if (status === 'PASS' || status === 'Success' || status === 'Accepted') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700"><CheckCircle size={12} /> {status}</span>;
    if (status === 'FAIL' || status === 'Error' || status === 'Wrong Answer') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-700"><XCircle size={12} /> {status}</span>;
    if (status === 'PARTIAL') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-700"><CheckCircle size={12} /> PARTIAL</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-700"><Clock size={12} /> {status}</span>;
  };

  const handleUpdateManual = async () => {
    setIsUpdating(true);
    try {
      await api.updateSubmission({ id: selectedSub.id, status: manualStatus, score: Number(manualScore) });
      setResults(results.map(r => r.id === selectedSub.id ? { ...r, status: manualStatus, score: Number(manualScore) } : r));
      setSelectedSub(null);
    } catch (err) {
      console.error(err);
    }
    setIsUpdating(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Results & Submissions</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {results.length} submissions evaluated • <span className="font-semibold text-brand-primary">{isManualMode ? 'Manual Grading' : 'Auto Evaluation'}</span>
          </p>
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
              <TableHead className="w-20 text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((res, i) => (
              <TableRow key={res.id}>
                <TableCell className="font-mono text-xs text-slate-400">{i + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {(res.students?.name || res.student_name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{res.students?.name || res.student_name}</p>
                      <p className="text-xs text-slate-400">{res.students?.regd_no || res.regd_no}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-700">{res.questions?.title || res.question_title}</TableCell>
                <TableCell>{getStatusBadge(res.status)}</TableCell>
                <TableCell>
                  <span className={`font-bold text-sm ${res.score >= 50 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {res.score || 0} / 100
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedSub(res);
                    setManualScore(res.score || 0);
                    setManualStatus(res.status);
                  }} className="h-8 group">
                    View <ChevronRight size={14} className="ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </Button>
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

      {/* Submission Review Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User size={18} className="text-brand-primary" /> 
                  {selectedSub.students?.name || selectedSub.student_name}
                </h3>
                <p className="text-sm text-slate-500">{selectedSub.questions?.title || selectedSub.question_title}</p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Code Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Code size={16} /> Submitted Source Code</h4>
                <div className="bg-[#1E1E1E] rounded-xl p-4 overflow-x-auto max-h-[400px]">
                  <pre className="text-xs font-mono text-emerald-400 leading-relaxed cursor-text select-text" style={{ userSelect: 'auto' }}>
                    {selectedSub.code || 'No code available'}
                  </pre>
                </div>
              </div>

              {/* Output / Tests Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><span className="text-blue-500">&gt;_</span> Raw Output / Test Results</h4>
                <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">
                    {selectedSub.output || 'No output tracked'}
                  </pre>
                </div>
              </div>

              {/* Auto Evaluation Details */}
              {selectedSub.evaluation_details && selectedSub.evaluation_details.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-semibold text-slate-900">Auto Evaluation Traces</h4>
                  <div className="grid gap-2">
                    {selectedSub.evaluation_details.map((tc, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border text-xs font-mono ${tc.status === 'Pass' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <div className="flex justify-between font-bold mb-1">
                          <span>Test Case {idx + 1}</span>
                          <span>{tc.status}</span>
                        </div>
                        <div className="text-slate-600">IN: {tc.input}</div>
                        <div className="text-slate-600">EXP: {tc.expected}</div>
                        <div className="text-slate-600 font-semibold mt-1">OUT: {tc.actual}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer Admin controls */}
            {isManualMode ? (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-end justify-between rounded-b-2xl">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Manual Status Override</label>
                    <select 
                      className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-brand-primary/30 outline-none"
                      value={manualStatus}
                      onChange={(e) => setManualStatus(e.target.value)}
                    >
                      <option value="PASS">PASS</option>
                      <option value="PARTIAL">PARTIAL</option>
                      <option value="FAIL">FAIL</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Score (0-100)</label>
                    <input 
                      type="number" 
                      className="h-10 w-24 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-brand-primary/30 outline-none"
                      value={manualScore}
                      onChange={(e) => setManualScore(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedSub(null)}>Cancel</Button>
                  <Button onClick={handleUpdateManual} disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save Grade'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-2xl">
                <span className="text-xs text-slate-500 font-medium">Automatic Evaluation Mode active. Scores are determined by Judge0 tests.</span>
                <Button variant="outline" onClick={() => setSelectedSub(null)}>Close</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
