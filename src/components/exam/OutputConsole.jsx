import React from 'react';
import { Terminal, Loader2 } from 'lucide-react';

export const OutputConsole = ({ output, isRunning, isError }) => {
  return (
    <div className="h-44 bg-[#0d1117] text-slate-300 font-mono text-xs flex flex-col">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#21262d] border-t border-t-[#21262d]">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
          <Terminal size={12} /> Console
        </div>
        {isRunning && (
          <span className="flex items-center gap-1.5 text-blue-400 text-[11px]">
            <Loader2 size={10} className="animate-spin" /> Running...
          </span>
        )}
      </div>
      {/* Console Body */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isRunning ? (
          <div className="flex items-center gap-2 text-blue-400">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Compiling and executing...
          </div>
        ) : (
          <pre className={`whitespace-pre-wrap leading-relaxed ${isError ? 'text-red-400' : output ? 'text-emerald-400' : 'text-slate-600'}`}>
            {output || '> Ready. Click "Run Code" to compile and execute.'}
          </pre>
        )}
      </div>
    </div>
  );
};
