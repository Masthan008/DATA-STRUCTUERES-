import React from 'react';
import { Terminal, Loader2, AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Parse GCC error lines like: "file.c:10:5: error: ..."
const parseGccLines = (text) => {
  if (!text) return [];
  return text.split('\n').map((line, i) => {
    const errorMatch = line.match(/^.*?:(\d+):(\d+):\s*(error|warning|note):\s*(.*)$/);
    if (errorMatch) {
      return {
        key: i,
        lineNo: errorMatch[1],
        col: errorMatch[2],
        severity: errorMatch[3],
        message: errorMatch[4],
        raw: line,
      };
    }
    return { key: i, raw: line, severity: null };
  }).filter(l => l.raw.trim() !== '');
};

const SeverityIcon = ({ severity }) => {
  if (severity === 'error') return <AlertCircle size={11} className="text-red-400 shrink-0 mt-0.5" />;
  if (severity === 'warning') return <AlertTriangle size={11} className="text-yellow-400 shrink-0 mt-0.5" />;
  if (severity === 'note') return <Info size={11} className="text-blue-400 shrink-0 mt-0.5" />;
  return null;
};

const severityColor = (s) => {
  if (s === 'error') return 'text-red-400';
  if (s === 'warning') return 'text-yellow-400';
  if (s === 'note') return 'text-blue-400';
  return 'text-slate-400';
};

export const OutputConsole = ({ outputData, isRunning }) => {
  const compileLines = outputData?.compileError ? parseGccLines(outputData.compileError) : [];
  const runtimeLines = outputData?.runtimeError ? parseGccLines(outputData.runtimeError) : [];

  const errorCount = compileLines.filter(l => l.severity === 'error').length;
  const warnCount = compileLines.filter(l => l.severity === 'warning').length;

  return (
    <div className="h-52 bg-[#0d1117] text-slate-300 font-mono text-xs flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#21262d] border-t border-t-[#21262d] shrink-0">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
          <Terminal size={12} /> Console
        </div>
        <div className="flex items-center gap-3">
          {outputData?.time && (
            <span className="text-slate-500 text-[10px]">Exec: {outputData.time}s</span>
          )}
          {outputData?.compileError && (
            <div className="flex items-center gap-2">
              {errorCount > 0 && (
                <span className="flex items-center gap-1 text-red-400 text-[10px] font-bold">
                  <AlertCircle size={10} /> {errorCount} error{errorCount > 1 ? 's' : ''}
                </span>
              )}
              {warnCount > 0 && (
                <span className="flex items-center gap-1 text-yellow-400 text-[10px] font-bold">
                  <AlertTriangle size={10} /> {warnCount} warning{warnCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
          {outputData?.output !== undefined && !outputData?.compileError && !outputData?.runtimeError && (
            <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
              <CheckCircle size={10} /> Compiled OK
            </span>
          )}
          {isRunning && (
            <span className="flex items-center gap-1.5 text-blue-400 text-[11px]">
              <Loader2 size={10} className="animate-spin" /> Running...
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-3 overflow-y-auto space-y-0.5">
        {isRunning ? (
          <div className="flex items-center gap-2 text-blue-400 p-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Compiling and executing...
          </div>
        ) : outputData ? (
          <>
            {/* Compile Errors — parsed GCC output */}
            {outputData.compileError && (
              <div>
                <div className="text-red-500 font-bold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle size={11} /> Compilation Failed
                </div>
                <div className="space-y-0.5">
                  {compileLines.map((line) => (
                    <div key={line.key} className={`flex gap-2 leading-relaxed ${severityColor(line.severity)}`}>
                      {line.severity && <SeverityIcon severity={line.severity} />}
                      {line.lineNo ? (
                        <span>
                          <span className="text-slate-500">Line {line.lineNo}:{line.col}</span>
                          <span className={`ml-1 font-semibold ${line.severity === 'error' ? 'text-red-400' : line.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`}>
                            [{line.severity}]
                          </span>
                          <span className="ml-1 text-slate-300">{line.message}</span>
                        </span>
                      ) : (
                        <pre className="whitespace-pre-wrap text-slate-400">{line.raw}</pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Runtime Errors */}
            {outputData.runtimeError && (
              <div>
                <div className="text-orange-400 font-bold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={11} /> Runtime Error
                </div>
                <div className="space-y-0.5">
                  {runtimeLines.map((line) => (
                    <div key={line.key} className={`flex gap-2 leading-relaxed ${severityColor(line.severity)}`}>
                      {line.severity && <SeverityIcon severity={line.severity} />}
                      <pre className="whitespace-pre-wrap text-orange-300">{line.raw}</pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Successful output */}
            {outputData.output !== undefined && !outputData.compileError && !outputData.runtimeError && (
              <div>
                <div className="text-emerald-500 font-bold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle size={11} /> Program Output
                </div>
                {outputData.warnings && (
                  <div className="mb-2">
                    <div className="text-yellow-400 font-bold text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <AlertTriangle size={11} /> Compiler Warnings
                    </div>
                    {parseGccLines(outputData.warnings).map((line) => (
                      <div key={line.key} className={`flex gap-2 leading-relaxed ${severityColor(line.severity)}`}>
                        {line.severity && <SeverityIcon severity={line.severity} />}
                        {line.lineNo ? (
                          <span>
                            <span className="text-slate-500">Line {line.lineNo}:{line.col}</span>
                            <span className="ml-1 font-semibold text-yellow-400">[{line.severity}]</span>
                            <span className="ml-1 text-slate-300">{line.message}</span>
                          </span>
                        ) : (
                          <pre className="whitespace-pre-wrap text-slate-400">{line.raw}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
                  {outputData.output || <span className="text-slate-500 italic">Program ran with no output.</span>}
                </pre>
              </div>
            )}

            {/* No output */}
            {outputData.noOutput && (
              <pre className="text-slate-500 italic">Program compiled and ran with no output.</pre>
            )}

            {/* Auto Eval Test Case Results */}
            {outputData.evalResults && (
              <div>
                <div className={`font-bold text-[10px] uppercase tracking-wider mb-3 flex items-center gap-1.5 ${outputData.finalStatus === 'PASS' ? 'text-emerald-400' : outputData.finalStatus === 'PARTIAL' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {outputData.finalStatus === 'PASS' ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                  {outputData.finalStatus} — Score: {outputData.finalScore} / {outputData.maxScore}
                </div>
                <div className="space-y-2">
                  {outputData.evalResults.map((tc, idx) => (
                    <div key={idx} className={`rounded-lg border p-2.5 text-[11px] ${tc.status === 'Pass' ? 'border-emerald-800 bg-emerald-950/40' : 'border-red-800 bg-red-950/40'}`}>
                      <div className="flex justify-between font-bold mb-1.5">
                        <span className="text-slate-300">Test Case {idx + 1}</span>
                        <span className={tc.status === 'Pass' ? 'text-emerald-400' : 'text-red-400'}>{tc.status}</span>
                      </div>
                      {!tc.error && (
                        <>
                          <div className="text-slate-500">Input: <span className="text-slate-300 font-mono">{tc.input || '(none)'}</span></div>
                          <div className="text-slate-500">Expected: <span className="text-emerald-300 font-mono">{tc.expected}</span></div>
                          <div className="text-slate-500">Got: <span className={`font-mono ${tc.status === 'Pass' ? 'text-emerald-300' : 'text-red-300'}`}>{tc.actual || '(no output)'}</span></div>
                        </>
                      )}
                      {tc.error && <div className="text-red-400 font-mono">{tc.error}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <pre className="text-slate-600 p-1">{'> Ready. Click "Run Code" to compile and execute.'}</pre>
        )}
      </div>
    </div>
  );
};
