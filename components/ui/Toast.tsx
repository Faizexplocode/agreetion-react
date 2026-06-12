'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const typeConfig: Record<
  ToastType,
  { icon: string; bg: string; border: string; iconColor: string }
> = {
  success: {
    icon: '✓',
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-l-4 border-l-emerald-500',
    iconColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
  },
  error: {
    icon: '✕',
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-l-4 border-l-red-500',
    iconColor: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
  },
  info: {
    icon: 'ℹ',
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-l-4 border-l-blue-500',
    iconColor: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  },
  warning: {
    icon: '⚠',
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-l-4 border-l-amber-500',
    iconColor: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
  },
};

function ToastItem({
  toast: t,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const config = typeConfig[t.type];
  const duration = t.duration ?? 3000;

  useEffect(() => {
    // Trigger slide-in
    const showTimer = setTimeout(() => setVisible(true), 10);
    // Start dismiss
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(t.id), 350);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [t.id, duration, onRemove]);

  return (
    <div
      className={[
        'flex items-start gap-3 w-full max-w-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-800',
        'p-3.5 transition-all duration-350 ease-out',
        config.bg,
        config.border,
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4',
      ].join(' ')}
    >
      <span
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${config.iconColor}`}
      >
        {config.icon}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
          {t.title}
        </p>
        {t.message && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
            {t.message}
          </p>
        )}
      </div>

      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onRemove(t.id), 350);
        }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mt-0.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${counterRef.current++}`;
    setToasts((prev) => [...prev, { ...opts, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue: ToastContextValue = {
    toast: addToast,
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container — bottom-center */}
      <div
        aria-live="polite"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center w-full px-4 pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full max-w-sm">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}
