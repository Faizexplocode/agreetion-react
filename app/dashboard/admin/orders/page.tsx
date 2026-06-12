'use client';

import { useEffect, useState } from 'react';
import { getOrders } from '@/lib/firebase/orders';
import { formatDate, formatRp } from '@/lib/utils/formatters';
import type { Order } from '@/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getOrders().then((data) => {
      if (cancelled) return;
      setOrders(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>
          Transaksi
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>
          {loading ? 'Memuat...' : `${orders.length} pesanan tercatat di platform`}
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <table className="w-full">
          <thead style={{ background: 'var(--tanipro-warm-gray)' }}>
            <tr>
              {['Kode', 'Komoditas', 'Jumlah', 'Total', 'Status', 'Tanggal'].map((head) => (
                <th key={head} className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--tanipro-forest)' }}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                  {loading ? 'Memuat transaksi...' : 'Belum ada transaksi.'}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{order.order_code}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{order.commodity_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{order.quantity} {order.unit}</td>
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
