import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  variant?: 'neutral' | 'terracotta' | 'warning' | 'danger' | 'success';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className,
  icon,
}) => {
  const variantStyles = {
    neutral: 'bg-surface-muted text-ink-secondary border border-surface-border',
    terracotta: 'bg-terracotta-50 text-terracotta-700 border border-terracotta-200',
    warning: 'bg-warning-subtle text-amber-800 border border-warning-border',
    danger: 'bg-danger-subtle text-red-800 border border-danger-border',
    success: 'bg-surface-subtle text-ink border border-surface-border-strong font-medium', // Avoid green! Uses high-contrast neutral badge
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide',
        variantStyles[variant],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
};
