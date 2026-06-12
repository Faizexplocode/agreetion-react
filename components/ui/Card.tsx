import React from 'react';

type CardVariant = 'default' | 'elevated' | 'bordered';

interface CardProps {
  variant?: CardVariant;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  default:
    'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm',
  elevated:
    'bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl',
  bordered:
    'bg-transparent border-2 border-[var(--tanipro-moss)]/30 dark:border-[var(--tanipro-leaf)]/20',
};

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-4 border-b border-gray-100 dark:border-gray-800 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-4 border-t border-gray-100 dark:border-gray-800 ${className}`}>
      {children}
    </div>
  );
}

export default function Card({
  variant = 'default',
  header,
  footer,
  children,
  className = '',
  noPadding = false,
}: CardProps) {
  return (
    <div
      className={[
        'rounded-lg overflow-hidden transition-all duration-300 ease-out',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {header && (
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          {header}
        </div>
      )}

      <div className={noPadding ? '' : 'p-5'}>{children}</div>

      {footer && (
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
          {footer}
        </div>
      )}
    </div>
  );
}
