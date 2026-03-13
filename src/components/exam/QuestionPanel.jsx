import React from 'react';

export const QuestionPanel = ({ question }) => {
  if (!question) {
    return <div className="p-6 text-slate-500">Loading question...</div>;
  }

  return (
    <div className="h-full overflow-y-auto bg-white border-r border-slate-200">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">{question.title}</h2>
          <div className="flex gap-2 text-sm">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-medium">Easy</span>
            <span className="px-2.5 py-0.5 rounded-md text-slate-500 border border-slate-200">10 Pts</span>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed text-sm">
            {question.description}
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="bg-[#F8FAFC] rounded-xl p-4 border border-slate-200">
            <h4 className="font-semibold text-slate-800 text-sm mb-2">Example 1:</h4>
            <div className="font-mono text-sm space-y-1">
              <p><span className="text-slate-500">Input:</span> {question.inputExample}</p>
              <p><span className="text-slate-500">Output:</span> {question.outputExample}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
