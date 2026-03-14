import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table';
import { Plus, Trash2, X, FileQuestion, Type, FileText, ArrowRightLeft } from 'lucide-react';
import api from '../../utils/api';

const QuestionManagement = () => {
  const { questions, setQuestions, admin } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ 
    title: '', description: '', inputExample: '', outputExample: '', question_score: 10, testCases: [{ input: '', expected_output: '', is_hidden: true }] 
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const data = await api.addQuestion({
        admin_id: admin.id,
        title: newQuestion.title,
        description: newQuestion.description,
        sample_input: newQuestion.inputExample,
        sample_output: newQuestion.outputExample,
        question_score: parseInt(newQuestion.question_score, 10) || 10
      });
      if (data.question) {
        setQuestions([...questions, data.question]);
        for (const tc of newQuestion.testCases) {
          if (tc.input.trim() && tc.expected_output.trim()) {
             await api.addTestcase({
               admin_id: admin.id,
               question_id: data.question.id,
               input: tc.input,
               expected_output: tc.expected_output,
               is_hidden: tc.is_hidden
             });
          }
        }
      }
    } catch (err) {
      console.error('Failed to add question:', err);
    }
    setNewQuestion({ title: '', description: '', inputExample: '', outputExample: '', question_score: 10, testCases: [{ input: '', expected_output: '', is_hidden: true }] });
    setIsAdding(false);
  };

  const handleAddTestCase = () => {
    setNewQuestion(prev => ({
      ...prev, testCases: [...prev.testCases, { input: '', expected_output: '', is_hidden: true }]
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...newQuestion.testCases];
    updated[index][field] = value;
    setNewQuestion({ ...newQuestion, testCases: updated });
  };

  const handleRemoveTestCase = (index) => {
    const updated = [...newQuestion.testCases];
    updated.splice(index, 1);
    setNewQuestion({ ...newQuestion, testCases: updated });
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteQuestion(id, admin.id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Question Bank</h1>
          <p className="text-sm text-slate-500 mt-0.5">{questions.length} questions configured</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2" variant={isAdding ? 'outline' : 'primary'}>
          {isAdding ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Question</>}
        </Button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <Card className="border-brand-primary/20 shadow-glow-blue animate-scale-in">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">New Question</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <Input icon={Type} label="Question Title" required placeholder="e.g., Reverse a Linked List" value={newQuestion.title} onChange={e => setNewQuestion({...newQuestion, title: e.target.value})} />
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Problem Description</label>
                <textarea required rows="3" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary focus:outline-none transition-all duration-200 shadow-sm hover:border-slate-300 resize-none" placeholder="Describe the problem..." value={newQuestion.description} onChange={e => setNewQuestion({...newQuestion, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input icon={ArrowRightLeft} label="Sample Input" required placeholder="e.g., [1,2,3,4,5]" value={newQuestion.inputExample} onChange={e => setNewQuestion({...newQuestion, inputExample: e.target.value})} />
                <Input icon={ArrowRightLeft} label="Sample Output" required placeholder="e.g., [5,4,3,2,1]" value={newQuestion.outputExample} onChange={e => setNewQuestion({...newQuestion, outputExample: e.target.value})} />
              </div>
              <div className="w-1/2">
                <Input type="number" label="Marks / Score" required placeholder="10" value={newQuestion.question_score} onChange={e => setNewQuestion({...newQuestion, question_score: e.target.value})} />
              </div>

              {/* Test Cases Section */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-800">Test Cases (for Auto-Evaluation)</h4>
                  <button type="button" onClick={handleAddTestCase} className="text-xs font-semibold text-brand-primary bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1">
                    <Plus size={12} /> Add Case
                  </button>
                </div>
                
                <div className="space-y-3">
                  {newQuestion.testCases.map((tc, idx) => (
                    <div key={idx} className="flex gap-2 items-start relative group bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex-1 space-y-3">
                        <Input placeholder="Input Data" value={tc.input} onChange={e => handleTestCaseChange(idx, 'input', e.target.value)} />
                        <Input placeholder="Expected Output" value={tc.expected_output} onChange={e => handleTestCaseChange(idx, 'expected_output', e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-2 pt-1 pl-2 border-l border-slate-200">
                         <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-500">
                           <input type="checkbox" checked={tc.is_hidden} onChange={e => handleTestCaseChange(idx, 'is_hidden', e.target.checked)} className="rounded text-brand-primary focus:ring-brand-primary/30" />
                           Hidden
                         </label>
                         {newQuestion.testCases.length > 1 && (
                           <button type="button" onClick={() => handleRemoveTestCase(idx)} className="text-red-400 hover:text-red-600 self-start mt-2">
                             <Trash2 size={14} />
                           </button>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
                <Button type="submit" className="gap-2"><Plus size={16} /> Save Question & Test Cases</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Questions Table */}
      {questions.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Sample Input</TableHead>
              <TableHead>Sample Output</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="w-20 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q, i) => (
              <TableRow key={q.id}>
                <TableCell className="font-mono text-xs text-slate-400">{i + 1}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{q.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{q.description}</p>
                  </div>
                </TableCell>
                <TableCell><code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{q.sample_input || q.inputExample}</code></TableCell>
                <TableCell><code className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{q.sample_output || q.outputExample}</code></TableCell>
                <TableCell><span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{q.question_score || 10}</span></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0">
                    <Trash2 size={15} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileQuestion size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No questions added yet</p>
            <p className="text-slate-400 text-xs mt-1">Click "Add Question" above to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionManagement;
