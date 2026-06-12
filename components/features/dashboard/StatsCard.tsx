'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Trend {
  value: number; // positive = up, negative = down
  label?: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: Trend;
  accentColor?: string;
  accent?: string;
  isLoading?: boolean;
}

function useCountUp(target: number, duration = 1200): number {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (typeof target !== 'number') return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor,
  accent,
  isLoading = false,
}: StatsCardProps) {
  const finalAccentColor = accentColor || (accent ? `var(--tanipro-${accent})` : 'var(--tanipro-moss)');
  const numericValue = typeof value === 'number' ? value : NaN;
  const animated = useCountUp(isNaN(numericValue) ? 0 : numericValue);

  const displayValue = isNaN(numericValue) ? value : animated;

  const trendUp = trend && trend.value > 0;
  const trendDown = trend && trend.value < 0;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700" />
          <div className="w-16 h-5 rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="w-24 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 mb-2" />
        <div className="w-32 h-4 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 relative overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ backgroundColor: finalAccentColor }}
      />

      <div className="flex items-start justify-between mb-4 relative">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
          style={{ backgroundColor: `${finalAccentColor}18`, color: finalAccentColor }}
        >
          {icon}
        </div>

        {/* Trend badge */}
        {trend && (
          <div
            className={[
              'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
              trendUp
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : trendDown
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
            ].join(' ')}
          >
            {trendUp && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17l5-5 5 5M7 7l5 5 5-5" />
              </svg>
            )}
            {trendDown && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 7l-5 5-5-5M17 17l-5-5-5 5" />
              </svg>
            )}
            {Math.abs(trend.value)}%
            {trend.label && <span className="opacity-70">{trend.label}</span>}
          </div>
        )}
      </div>

      {/* Value */}
      <p
        className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-1"
        style={{ color: typeof displayValue === 'number' ? undefined : undefined }}
      >
        {displayValue}
      </p>

      {/* Title */}
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
