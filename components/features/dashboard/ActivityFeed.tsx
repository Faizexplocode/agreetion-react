import React from 'react';
import { timeAgo } from '@/lib/utils/formatters';
import type { ActivityLog } from '@/types';

const actionConfig: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  login: { icon: '🔑', color: 'bg-blue-100 dark:bg-blue-900/30', label: 'Masuk' },
  logout: { icon: '🚪', color: 'bg-gray-100 dark:bg-gray-800', label: 'Keluar' },
  create_commodity: { icon: '🌾', color: 'bg-green-100 dark:bg-green-900/30', label: 'Tambah Komoditas' },
  update_commodity: { icon: '✏️', color: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Edit Komoditas' },
  delete_commodity: { icon: '🗑️', color: 'bg-red-100 dark:bg-red-900/30', label: 'Hapus Komoditas' },
  create_order: { icon: '📦', color: 'bg-purple-100 dark:bg-purple-900/30', label: 'Buat Pesanan' },
  update_order: { icon: '🔄', color: 'bg-orange-100 dark:bg-orange-900/30', label: 'Update Pesanan' },
  payment: { icon: '💰', color: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Pembayaran' },
  register: { icon: '👤', color: 'bg-teal-100 dark:bg-teal-900/30', label: 'Registrasi' },
  delivery: { icon: '🚚', color: 'bg-indigo-100 dark:bg-indigo-900/30', label: 'Pengiriman' },
};

const fallback = { icon: '⚡', color: 'bg-gray-100 dark:bg-gray-800', label: 'Aktivitas' };

interface ActivityFeedProps {
  activities: ActivityLog[];
  maxHeight?: string;
  showEmpty?: boolean;
  loading?: boolean;
  showRole?: boolean;
}

export default function ActivityFeed({
  activities,
  maxHeight = '400px',
  showEmpty = true,
  loading = false,
  showRole = false,
}: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-800" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (activities.length === 0 && showEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-3xl mb-3">📋</p>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Belum ada aktivitas
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Aktivitas akan muncul di sini setelah ada transaksi
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800"
      style={{ maxHeight }}
    >
      {activities.map((activity, idx) => {
        const config = actionConfig[activity.action] ?? fallback;

        return (
          <div
            key={activity.id ?? idx}
            className="flex items-start gap-3 py-3 px-1 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
          >
            {/* Icon */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${config.color}`}
            >
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
                    {activity.user_name ?? 'Pengguna'}
                    {showRole && activity.role && (
                      <span className="ml-2 text-xs font-normal text-gray-500">({activity.role})</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {activity.detail ?? config.label}
                  </p>
                </div>
                <time className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">
                  {activity.created_at ? timeAgo(activity.created_at) : '—'}
                </time>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
