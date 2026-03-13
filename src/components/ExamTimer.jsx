import React from 'react';
import { useExam } from '../context/ExamContext';
import { cn } from '../utils/clsx';
import { Timer } from 'lucide-react';

export const ExamTimer = () => {
  const { timeRemaining } = useExam();

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isCritical = timeRemaining > 0 && timeRemaining <= 300;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold transition-all duration-300",
      isCritical
        ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse-slow"
        : "bg-slate-900 text-emerald-400 border border-slate-700"
    )}>
      <Timer size={14} className={isCritical ? "text-white" : "text-slate-500"} />
      {formatTime(timeRemaining)}
    </div>
  );
};
