import React from 'react';
import { cn } from '../utils/clsx';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', ...props }, ref) => {
  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-blue-700 shadow-md hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]',
    secondary: 'bg-brand-secondary text-white hover:bg-slate-800 shadow-md active:scale-[0.98]',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-red-500/20 active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-emerald-500/20 active:scale-[0.98]',
  };

  const sizes = {
    default: 'h-10 px-5 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-12 px-8 text-base',
    icon: 'h-10 w-10',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = 'Button';
