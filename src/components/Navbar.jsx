import React from 'react';
import { Code2 } from 'lucide-react';

export const Navbar = ({ title = "Secure Exam Portal", rightContent }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex bg-brand-primary text-white p-2 rounded-lg">
            <Code2 size={24} />
          </div>
          <h1 className="text-xl font-bold flex items-center text-slate-900 tracking-tight">
            {title}
          </h1>
        </div>
        {rightContent && (
          <div className="flex items-center gap-4">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
};
