import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-blue-600 text-white shadow-xs hover:bg-blue-700',
  destructive: 'bg-red-600 text-white shadow-xs hover:bg-red-700',
  outline:
    'border border-slate-300 bg-white shadow-2xs hover:bg-slate-50 hover:text-slate-900',
  secondary: 'bg-slate-100 text-slate-900 shadow-2xs hover:bg-slate-200',
  ghost: 'hover:bg-slate-100 hover:text-slate-900',
  link: 'text-blue-600 underline-offset-4 hover:underline',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'h-9 w-9',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
