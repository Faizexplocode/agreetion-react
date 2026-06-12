'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/lib/context/AuthContext';
import { getFinanceSummary } from '@/lib/firebase/finance';
import { formatRp, formatDate } from '@/lib/utils/formatters';
import type { FinanceSummary, Order } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu', confirmed: 'Dikonfirmasi', processing: 'Diproses',
  shipped: 'Dikirim', delivered: 'Diterima', completed: 'Selesai', cancelled: 'Dibatalkan',
};
const STATUS_COLOR: Record<string, string> = {
  completed: '#16a34a', pending: '#d97706', confirmed: '#2563eb',
  processing: '#7c3aed', shipped: '#0891b2', delivered: '#059669', cancelled: '#dc2626',
};

export default function FarmerFinancePage() {
  const { user } = useAuthContext();
  const [data, setData] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    getFinanceSummary(user.id, 'farmer').then(d => {
      setData(d);
      setLoading(false);
    });
  }, [user]);

  const orders: Order[] = data?.allOrders ?? [];
  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  const platformFee = Math.round((data?.totalRevenue ?? 0) * 0.02);
  const netRevenue = (data?.totalRevenue ?? 0) - platformFee;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>
          Laporan Keuangan 💰
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>
          Ringkasan pendapatan dari semua transaksi kamu.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'var(--tanipro-warm-gray)' }} />)}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Pendapatan', value: formatRp(data?.totalRevenue ?? 0), sub: 'dari pesanan selesai', icon: '💰', accent: 'var(--tanipro-forest)' },
              { label: 'Bersih (setelah fee)', value: formatRp(netRevenue), sub: 'setelah platform fee 2%', icon: '✅', accent: 'var(--tanipro-moss)' },
              { label: 'Pesanan Selesai', value: String(data?.completed ?? 0), sub: 'transaksi berhasil', icon: '📊', accent: '#2563eb' },
              { label: 'Menunggu Pembayaran', value: formatRp(data?.pendingAmount ?? 0), sub: `${data?.pending ?? 0} pesanan aktif`, icon: '⏳', accent: '#d97706' },
            ].map(({ label, value, sub, icon, accent }) => (
              <div key={label} className="p-5 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{icon}</span>
                  <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
                </div>
                <p className="text-xl font-extrabold" style={{ color: accent }}>{value}</p>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-1">{label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Platform Fee Info */}
          <div className="p-4 rounded-2xl flex items-start gap-3"
            style={{ background: 'rgba(255,214,0,0.1)', border: '1px solid rgba(255,214,0,0.3)' }}>
            <span className="text-xl">ℹ️</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#92400e' }}>Info Platform Fee</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                TaniPro memotong <strong>2% platform fee</strong> dari setiap transaksi selesai.
                Total fee terpotong: <strong>{formatRp(platformFee)}</strong>.
                Pendapatan bersihmu: <strong>{formatRp(netRevenue)}</strong>.
              </p>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--tanipro-forest)' }}>
                Riwayat Transaksi
              </h2>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--tanipro-moss)]">
                <option value="all">Semua Status</option>
                {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-dashed"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <p className="text-gray-500">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'var(--tanipro-warm-gray)' }}>
                      {['Kode', 'Komoditas', 'Jumlah', 'Total', 'Status', 'Tanggal'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                          style={{ color: 'var(--tanipro-forest)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o, i) => (
                      <tr key={o.id} style={{
                        background: i % 2 === 0 ? 'var(--surface)' : 'var(--tanipro-warm-gray)',
                        borderTop: '1px solid var(--border)',
                      }}>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{o.order_code}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{o.commodity_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{o.quantity} {o.unit}</td>
                        <td className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--tanipro-forest)' }}>
                          {o.status === 'completed' ? formatRp(o.total_price) : <span className="text-gray-400">{formatRp(o.total_price)}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: `${STATUS_COLOR[o.status] ?? '#6b7280'}22`, color: STATUS_COLOR[o.status] ?? '#6b7280' }}>
                            {STATUS_LABEL[o.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{formatDate(o.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
