import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const QuestionManagement = () => {
  const { questions, setQuestions } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', description: '', inputExample: '', outputExample: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const data = await api.addQuestion({
        title: newQuestion.title,
        description: newQuestion.description,
        sample_input: newQuestion.inputExample,
        sample_output: newQuestion.outputExample
      });
      if (data.question) {
        setQuestions([...questions, data.question]);
      }
    } catch (err) {
      console.error('Failed to add question:', err);
    }
    setNewQuestion({ title: '', description: '', inputExample: '', outputExample: '' });
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Question Bank</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          {isAdding ? 'Cancel' : <><Plus size={20} /> Add Question</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-brand-primary/20 shadow-md">
          <CardHeader><CardTitle>Add New Question</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <Input label="Question Title" required value={newQuestion.title} onChange={e => setNewQuestion({...newQuestion, title: e.target.value})} />
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Problem Description</label>
                <textarea required rows="4" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none" value={newQuestion.description} onChange={e => setNewQuestion({...newQuestion, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Example Input" required value={newQuestion.inputExample} onChange={e => setNewQuestion({...newQuestion, inputExample: e.target.value})} />
                <Input label="Example Output" required value={newQuestion.outputExample} onChange={e => setNewQuestion({...newQuestion, outputExample: e.target.value})} />
              </div>
              <Button type="submit" className="w-full mt-4">Save Question</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {questions.map((q) => (
          <Card key={q.id}>
            <CardContent className="p-6 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{q.title}</h3>
                <p className="text-slate-600 text-sm mt-1 line-clamp-2 leading-relaxed">{q.description}</p>
                <div className="mt-3 flex gap-4 text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded-lg inline-flex">
                  <span>Input: {q.sample_input || q.inputExample}</span>
                  <span>|</span>
                  <span>Output: {q.sample_output || q.outputExample}</span>
                </div>
              </div>
              <Button variant="ghost" onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 size={20} />
              </Button>
            </CardContent>
          </Card>
        ))}
        {questions.length === 0 && (
          <div className="text-center py-12 text-slate-500">No questions added yet.</div>
        )}
      </div>
    </div>
  );
};

export default QuestionManagement;
