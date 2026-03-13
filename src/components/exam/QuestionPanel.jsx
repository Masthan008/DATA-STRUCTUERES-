import React from 'react';

export const QuestionPanel = ({ question }) => {
  if (!question) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white border-r border-slate-200">
      {/* Question Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-4 z-10">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-slate-900">{question.title}</h2>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">Easy</span>
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">10 Points</span>
          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">Data Structures</span>
        </div>
      </div>

      {/* Question Body */}
      <div className="p-5 space-y-5">
        {/* Description */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
          <p className="text-slate-700 text-sm leading-relaxed">{question.description}</p>
        </div>

        {/* Example */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200">
            <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Example 1</h4>
          </div>
          <div className="p-4 font-mono text-sm space-y-2">
            <div>
              <span className="text-slate-400 text-xs font-sans font-semibold uppercase">Input</span>
              <pre className="text-slate-800 mt-0.5 bg-white px-3 py-1.5 rounded border border-slate-200 text-xs">{question.sample_input || question.inputExample}</pre>
            </div>
            <div>
              <span className="text-slate-400 text-xs font-sans font-semibold uppercase">Output</span>
              <pre className="text-emerald-700 mt-0.5 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200 text-xs">{question.sample_output || question.outputExample}</pre>
            </div>
          </div>
        </div>

        {/* Constraints */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Constraints</h3>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>Time Limit: 2 seconds</li>
            <li>Memory Limit: 256 MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
