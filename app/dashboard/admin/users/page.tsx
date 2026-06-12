'use client';

import { useEffect, useState } from 'react';
import { getUsers, updateUserStatus } from '@/lib/firebase/users';
import { addActivity } from '@/lib/firebase/activity';
import { useAuthContext } from '@/lib/context/AuthContext';
import { timeAgo } from '@/lib/utils/formatters';
import type { User, UserStatus } from '@/types';

const ROLE_LABEL: Record<string, string> = {
  farmer: 'Petani',
  buyer: 'Pembeli',
  admin: 'Admin',
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  active:    { bg: 'rgba(56,206,25,0.12)',   text: 'var(--tanipro-forest)' },
  pending:   { bg: 'rgba(255,214,0,0.15)',   text: '#b45309' },
  suspended: { bg: 'rgba(239,68,68,0.12)',   text: '#dc2626' },
};

const STATUS_LABEL: Record<string, string> = {
  active:    'Aktif',
  pending:   'Menunggu',
  suspended: 'Ditangguhkan',
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<'all' | 'farmer' | 'buyer' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | UserStatus>('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    getUsers().then((data) => {
      if (cancelled) return;
      setUsers(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStatus = async (user: User, status: UserStatus) => {
    setUpdating(user.id);
    try {
      await updateUserStatus(user.id, status);
      await addActivity(
        currentUser!.id, currentUser!.full_name, 'admin',
        status === 'active' ? 'approve_user' : 'suspend_user',
        `${status === 'active' ? 'Menyetujui' : 'Menangguhkan'} akun ${user.full_name} (${user.email})`,
      );
      setSuccessMsg(`Akun ${user.full_name} berhasil di-${status === 'active' ? 'approve' : 'suspend'}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchUsers();
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchRole   = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    const matchSearch =
      search.trim() === '' ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  const pendingCount = users.filter((u) => u.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>
          Manajemen Pengguna 👥
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>
          {loading ? 'Memuat...' : `${users.length} pengguna terdaftar`}
          {pendingCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
              {pendingCount} perlu verifikasi
            </span>
          )}
        </p>
      </div>

      {/* Success */}
      {successMsg && (
        <div
          className="p-4 rounded-2xl flex items-center gap-3 animate-fade-in"
          style={{ background: 'rgba(56,206,25,0.12)', border: '1px solid rgba(56,206,25,0.3)' }}
        >
          <span>✅</span>
          <p className="text-sm font-semibold" style={{ color: 'var(--tanipro-forest)' }}>
            {successMsg}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tanipro-moss)] text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'farmer', 'buyer', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize"
              style={
                filterRole === r
                  ? { background: 'var(--tanipro-moss)', color: 'white' }
                  : { background: 'var(--tanipro-warm-gray)', color: 'var(--tanipro-mid-gray)' }
              }
            >
              {r === 'all' ? 'Semua' : ROLE_LABEL[r]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'active', 'suspended'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={
                filterStatus === s
                  ? { background: 'var(--tanipro-forest)', color: 'white' }
                  : { background: 'var(--tanipro-warm-gray)', color: 'var(--tanipro-mid-gray)' }
              }
            >
              {s === 'all' ? 'Semua Status' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--tanipro-warm-gray)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-14 rounded-3xl border border-dashed"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-semibold" style={{ color: 'var(--tanipro-forest)' }}>
            Tidak ada pengguna ditemukan
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--tanipro-warm-gray)' }}>
                  {['Nama', 'Email', 'Peran', 'Status', 'Terdaftar', 'Aksi'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--tanipro-forest)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const statusStyle = STATUS_STYLE[u.status] ?? STATUS_STYLE.pending;
                  const isUpdating = updating === u.id;
                  const isSelf = u.id === currentUser?.id;

                  return (
                    <tr
                      key={u.id}
                      style={{
                        background: i % 2 === 0 ? 'var(--surface)' : 'var(--tanipro-warm-gray)',
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: 'var(--tanipro-moss)' }}
                          >
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">
                            {u.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={
                            u.role === 'farmer'
                              ? { background: 'rgba(74,124,89,0.1)', color: 'var(--tanipro-moss)' }
                              : u.role === 'admin'
                              ? { background: 'rgba(99,102,241,0.1)', color: '#4338ca' }
                              : { background: 'rgba(232,168,56,0.1)', color: 'var(--tanipro-harvest)' }
                          }
                        >
                          {ROLE_LABEL[u.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                        >
                          {STATUS_LABEL[u.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {timeAgo(u.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <span className="text-xs text-gray-400 italic">Anda</span>
                        ) : (
                          <div className="flex gap-1.5">
                            {u.status !== 'active' && (
                              <button
                                onClick={() => handleStatus(u, 'active')}
                                disabled={isUpdating}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                                style={{ background: 'rgba(56,206,25,0.15)', color: 'var(--tanipro-forest)' }}
                              >
                                {isUpdating ? '...' : '✓ Approve'}
                              </button>
                            )}
                            {u.status !== 'suspended' && (
                              <button
                                onClick={() => handleStatus(u, 'suspended')}
                                disabled={isUpdating}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                                style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626' }}
                              >
                                {isUpdating ? '...' : 'Suspend'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div
            className="px-4 py-2 text-xs text-gray-400 border-t"
            style={{ borderColor: 'var(--border)', background: 'var(--tanipro-warm-gray)' }}
          >
            Menampilkan {filtered.length} dari {users.length} pengguna
          </div>
        </div>
      )}
    </div>
  );
}
