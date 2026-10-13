import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, gradientBorder = true, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-surface-card/95 backdrop-blur-xs rounded-xl border border-surface-border shadow-warm overflow-hidden transition-all',
        gradientBorder && 'gradient-border-top',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={clsx('p-4 sm:p-5 border-b border-surface-border', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => (
  <h3 className={clsx('text-sm sm:text-base font-semibold text-ink', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => (
  <p className={clsx('text-xs text-ink-secondary mt-1', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={clsx('p-4 sm:p-5', className)} {...props}>
    {children}
  </div>
);
