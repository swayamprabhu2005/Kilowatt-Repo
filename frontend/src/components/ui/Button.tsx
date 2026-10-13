import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-terracotta-500 via-[#C85A32] to-terracotta-600 hover:from-terracotta-600 hover:to-terracotta-700 text-white focus:ring-terracotta-500 shadow-warm hover:shadow-warm-md border border-terracotta-600/30',
    secondary: 'bg-surface-muted hover:bg-surface-subtle text-ink border border-surface-border focus:ring-terracotta-400',
    outline: 'border border-surface-border-strong hover:bg-surface-muted text-ink focus:ring-terracotta-400',
    ghost: 'text-ink-secondary hover:text-ink hover:bg-surface-muted focus:ring-terracotta-400',
    danger: 'bg-danger text-white hover:bg-red-700 focus:ring-red-500 shadow-warm',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
      transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...(props as any)}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </motion.button>
  );
};
