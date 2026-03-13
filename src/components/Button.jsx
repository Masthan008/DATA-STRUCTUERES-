import React from 'react';
import { cn } from '../utils/clsx';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', ...props }, ref) => {
  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-blue-700 shadow-sm',
    secondary: 'bg-brand-secondary text-white hover:bg-slate-800 shadow-sm',
    outline: 'border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8 text-lg',
    icon: 'h-10 w-10',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = 'Button';
