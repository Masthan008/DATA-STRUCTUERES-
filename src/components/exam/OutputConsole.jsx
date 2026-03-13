import React from 'react';
import { Terminal } from 'lucide-react';

export const OutputConsole = ({ output, isRunning, isError }) => {
  return (
    <div className="h-48 bg-[#0f172a] text-slate-300 font-mono text-sm border-t border-slate-800 flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 border-b border-slate-800 text-xs text-slate-400">
        <Terminal size={14} /> Output Console
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {isRunning ? (
          <div className="flex items-center gap-2 text-brand-primary">
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" /> Running code...
          </div>
        ) : (
          <pre className={`whitespace-pre-wrap ${isError ? 'text-red-500' : 'text-emerald-400'}`}>
            {output || 'Code output will appear here.'}
          </pre>
        )}
      </div>
    </div>
  );
};
