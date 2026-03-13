import React from 'react';
import { useExam } from '../context/ExamContext';
import { cn } from '../utils/clsx';
import { Clock } from 'lucide-react';

export const ExamTimer = () => {
  const { timeRemaining } = useExam();

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isCritical = timeRemaining > 0 && timeRemaining <= 300; // < 5 mins

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold shadow-sm transition-colors",
      isCritical ? "bg-red-100 text-red-700 border border-red-200" : "bg-slate-100 text-slate-700 border border-slate-200"
    )}>
      <Clock size={20} className={isCritical ? "text-red-600 animate-pulse" : "text-slate-500"} />
      {formatTime(timeRemaining)}
    </div>
  );
};
