'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { timeAgo } from '@/lib/utils/formatters';
import { useAuthContext } from '@/lib/context/AuthContext';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useAuthContext();
  const { notifications, unreadCount, markAllRead } = useNotifications(user?.id);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayed = notifications.slice(0, 5);

  const typeIcon: Record<string, string> = {
    order: '📦',
    payment: '💰',
    system: '⚙️',
    preorder: '📋',
    delivery: '🚚',
    info: 'ℹ️',
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifikasi"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Notifikasi
              </h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-400">{unreadCount} belum dibaca</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[var(--tanipro-moss)] hover:underline font-medium"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
            {displayed.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                <p className="text-2xl mb-2">🔔</p>
                Belum ada notifikasi
              </div>
            ) : (
              displayed.map((n) => (
                <div
                  key={n.id}
                  className={[
                    'flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                    !n.read ? 'bg-[var(--tanipro-leaf)]/5' : '',
                  ].join(' ')}
                >
                  <span className="text-xl shrink-0 mt-0.5">
                    {typeIcon[n.type] ?? '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {n.text}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {n.created_at ? timeAgo(n.created_at) : '—'}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[var(--tanipro-moss)] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 5 && (
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 text-center">
              <button className="text-xs text-[var(--tanipro-moss)] hover:underline font-medium">
                Lihat semua notifikasi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
