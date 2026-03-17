import React, { useRef, useEffect } from 'react';
import Editor, { useMonaco, loader } from '@monaco-editor/react';

// Configure Monaco to use unpkg to prevent jsdelivr network blocks
loader.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.45.0/min/vs' } });

// Parse GCC error lines: "path/main.c:10:5: error: message"
const parseGccMarkers = (text) => {
  if (!text) return [];
  const markers = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const m = line.match(/^.*?:(\d+):(\d+):\s*(error|warning|note):\s*(.+)$/);
    if (!m) continue;
    const lineNo = parseInt(m[1], 10);
    const col    = parseInt(m[2], 10);
    const sev    = m[3];
    const msg    = m[4];
    markers.push({
      startLineNumber: lineNo,
      endLineNumber:   lineNo,
      startColumn:     col,
      endColumn:       col + 1,
      message:         msg,
      severity:
        sev === 'error'   ? 8 :   // monaco.MarkerSeverity.Error
        sev === 'warning' ? 4 :   // monaco.MarkerSeverity.Warning
                            2,    // monaco.MarkerSeverity.Info (note)
    });
  }
  return markers;
};

export const CodeEditor = ({ code, setCode, language = 'c', diagnostics = null }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Apply/clear markers whenever diagnostics change
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const model = editor.getModel();
    if (!model) return;

    const markers = parseGccMarkers(diagnostics);
    monaco.editor.setModelMarkers(model, 'gcc', markers);
  }, [diagnostics]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current  = editor;
    monacoRef.current  = monaco;
  };

  const handlePreventDefault = (e) => e.preventDefault();

  return (
    <div
      className="flex-1 w-full bg-[#1e1e1e]"
      onCopy={handlePreventDefault}
      onCut={handlePreventDefault}
      onPaste={handlePreventDefault}
    >
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || '')}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          padding: { top: 16 },
          lineNumbers: 'on',
          formatOnType: true,
          autoIndent: 'full',
          contextmenu: false,
        }}
      />
    </div>
  );
};
