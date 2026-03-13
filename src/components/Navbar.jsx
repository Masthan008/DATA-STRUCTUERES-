import React from 'react';
import { Code2 } from 'lucide-react';

export const Navbar = ({ title = "Secure Exam Portal", rightContent }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex bg-gradient-to-br from-brand-primary to-brand-accent text-white p-2 rounded-lg shadow-sm">
            <Code2 size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
              {title}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Secure Platform</p>
          </div>
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
