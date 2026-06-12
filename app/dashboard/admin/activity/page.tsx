'use client';

import { useEffect, useState } from 'react';
import { getActivity } from '@/lib/firebase/activity';
import { timeAgo } from '@/lib/utils/formatters';
import type { ActivityLog } from '@/types';

const ROLE_EMOJI: Record<string, string> = {
  admin:  '🛡️',
  farmer: '🌾',
  buyer:  '🏭',
};

const ACTION_COLOR: Record<string, string> = {
  login:         'var(--tanipro-moss)',
  logout:        'var(--tanipro-mid-gray)',
  order:         '#4338ca',
  update_order:  '#0e7490',
  cancel_order:  '#dc2626',
  approve_user:  'var(--tanipro-forest)',
  suspend_user:  '#dc2626',
  commodity_add: 'var(--tanipro-moss)',
};

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<'all' | 'farmer' | 'buyer' | 'admin'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getActivity().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const filtered = logs.filter((l) => {
    const matchRole = filterRole === 'all' || l.role === filterRole;
    const matchSearch =
      search.trim() === '' ||
      l.user_name.toLowerCase().includes(search.toLowerCase()) ||
      l.detail.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>
          Log Aktivitas Platform 📋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>
          {loading ? 'Memuat...' : `${filtered.length} dari ${logs.length} aktivitas`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Cari nama, aksi, atau detail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tanipro-moss)] text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'admin', 'farmer', 'buyer'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={
                filterRole === r
                  ? { background: 'var(--tanipro-moss)', color: 'white' }
                  : { background: 'var(--tanipro-warm-gray)', color: 'var(--tanipro-mid-gray)' }
              }
            >
              {r === 'all' ? 'Semua' : `${ROLE_EMOJI[r]} ${r.charAt(0).toUpperCase() + r.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--tanipro-warm-gray)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-14 rounded-3xl border border-dashed"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="text-4xl mb-3">📭</div>
          <p className="font-semibold" style={{ color: 'var(--tanipro-forest)' }}>
            Tidak ada aktivitas ditemukan
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          {filtered.map((log, i) => (
            <div
              key={log.id}
              className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[var(--tanipro-warm-gray)]"
              style={{
                background: i % 2 === 0 ? 'var(--surface)' : 'transparent',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 mt-0.5"
                style={{ background: 'var(--tanipro-warm-gray)' }}
              >
                {ROLE_EMOJI[log.role] ?? '👤'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    {log.user_name}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      background: `color-mix(in srgb, ${ACTION_COLOR[log.action] ?? 'var(--tanipro-moss)'} 15%, transparent)`,
                      color: ACTION_COLOR[log.action] ?? 'var(--tanipro-moss)',
                    }}
                  >
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm mt-0.5" style={{ color: 'var(--tanipro-mid-gray)' }}>
                  {log.detail}
                </p>
              </div>

              {/* Time */}
              <span className="text-xs text-gray-400 shrink-0 mt-1">
                {timeAgo(log.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
