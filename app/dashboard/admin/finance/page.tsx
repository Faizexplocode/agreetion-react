'use client';

import { useEffect, useState } from 'react';
import { getFinancialSummary } from '@/lib/firebase/finance';
import { formatRp } from '@/lib/utils/formatters';
import type { AdminFinancialSummary } from '@/types';

export default function AdminFinancePage() {
  const [finance, setFinance] = useState<AdminFinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getFinancialSummary().then((summary) => {
      if (cancelled) return;
      setFinance(summary);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    ['Volume Transaksi', formatRp(finance?.totalVolume ?? 0)],
    ['Volume Selesai', formatRp(finance?.completedVolume ?? 0)],
    ['Pendapatan Platform', formatRp(finance?.totalRevenue ?? 0)],
    ['Platform Fee', formatRp(finance?.platformFee ?? 0)],
    ['Pre-order Fee', formatRp(finance?.preorderFee ?? 0)],
    ['Total Pesanan', String(finance?.totalOrders ?? 0)],
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>
          Keuangan Platform
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>
          Ringkasan volume transaksi dan estimasi pendapatan platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(([label, value]) => (
          <div key={label} className="p-5 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-extrabold" style={{ color: 'var(--tanipro-forest)' }}>
              {loading ? '...' : value}
            </p>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--tanipro-forest)' }}>
          Status Pesanan
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(finance?.statusBreakdown ?? {}).map(([status, count]) => (
            <div key={status} className="rounded-xl p-3" style={{ background: 'var(--tanipro-warm-gray)' }}>
              <p className="text-xs text-gray-500 capitalize">{status}</p>
              <p className="text-xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>{count}</p>
            </div>
          ))}
          {!loading && Object.keys(finance?.statusBreakdown ?? {}).length === 0 && (
            <p className="text-sm text-gray-500">Belum ada pesanan.</p>
          )}
        </div>
      </div>
    </div>
  );
}
