'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/lib/context/AuthContext';
import { getFinanceSummary } from '@/lib/firebase/finance';
import { formatDate, formatRp } from '@/lib/utils/formatters';
import type { FinanceSummary } from '@/types';

export default function BuyerFinancePage() {
  const { user } = useAuthContext();
  const [data, setData] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getFinanceSummary(user.id, 'buyer').then((summary) => {
      if (cancelled) return;
      setData(summary);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const orders = data?.allOrders ?? [];
  const totalSpend = orders.reduce((sum, order) => sum + (order.total_price ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>
          Keuangan Pembeli
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>
          Ringkasan belanja dan riwayat transaksi pembelian.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ['Total Belanja', formatRp(totalSpend)],
          ['Pesanan Selesai', String(data?.completed ?? 0)],
          ['Pesanan Aktif', String(data?.pending ?? 0)],
        ].map(([label, value]) => (
          <div key={label} className="p-5 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-extrabold" style={{ color: 'var(--tanipro-forest)' }}>
              {loading ? '...' : value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full">
          <thead style={{ background: 'var(--tanipro-warm-gray)' }}>
            <tr>
              {['Kode', 'Komoditas', 'Total', 'Status', 'Tanggal'].map((head) => (
                <th key={head} className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--tanipro-forest)' }}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                  {loading ? 'Memuat transaksi...' : 'Belum ada transaksi.'}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{order.order_code}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{order.commodity_name}</td>
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--tanipro-forest)' }}>{formatRp(order.total_price)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{order.status}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(order.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
