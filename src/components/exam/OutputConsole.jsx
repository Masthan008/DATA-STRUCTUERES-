import React from 'react';
import { Terminal, Loader2 } from 'lucide-react';

export const OutputConsole = ({ outputData, isRunning, isError }) => {
  return (
    <div className="h-44 bg-[#0d1117] text-slate-300 font-mono text-xs flex flex-col">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#21262d] border-t border-t-[#21262d]">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
          <Terminal size={12} /> Console
        </div>
        <div className="flex items-center gap-3">
          {outputData?.time && (
            <span className="text-slate-500 text-[10px]">Exec Time: {outputData.time}s</span>
          )}
          {isRunning && (
            <span className="flex items-center gap-1.5 text-blue-400 text-[11px]">
              <Loader2 size={10} className="animate-spin" /> Running...
            </span>
          )}
        </div>
      </div>
      {/* Console Body */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isRunning ? (
          <div className="flex items-center gap-2 text-blue-400">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Compiling and executing...
          </div>
        ) : outputData ? (
          <div className="space-y-3">
            {outputData.compileError && (
              <div>
                <span className="text-red-500 font-semibold mb-1 block">Compilation Error:</span>
                <pre className="text-red-400 whitespace-pre-wrap leading-relaxed">{outputData.compileError}</pre>
              </div>
            )}
            {outputData.runtimeError && (
              <div>
                <span className="text-amber-500 font-semibold mb-1 block">Runtime Error:</span>
                <pre className="text-amber-400 whitespace-pre-wrap leading-relaxed">{outputData.runtimeError}</pre>
              </div>
            )}
            {outputData.output && (
              <div>
                <span className="text-emerald-500 font-semibold mb-1 block">Program Output:</span>
                <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">{outputData.output}</pre>
              </div>
            )}
            {(!outputData.compileError && !outputData.runtimeError && !outputData.output) && (
              <pre className="text-slate-500">Program exited with no output.</pre>
            )}
          </div>
        ) : (
          <pre className="text-slate-600">
            {'> Ready. Click "Run Code" to compile and execute.'}
          </pre>
        )}
      </div>
    </div>
  );
};
