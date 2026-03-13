import React from 'react';
import Editor from '@monaco-editor/react';

export const CodeEditor = ({ code, setCode, language = 'c' }) => {
  const handlePreventDefault = (e) => {
    e.preventDefault();
  };

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
          contextmenu: false, // disable right click in monaco
        }}
      />
    </div>
  );
};
