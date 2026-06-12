'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/lib/context/AuthContext';
import { getOrders, updateOrderStatus } from '@/lib/firebase/orders';
import { addActivity } from '@/lib/firebase/activity';
import { formatRp, timeAgo } from '@/lib/utils/formatters';
import { PROTOTYPE_ORDERS } from '@/lib/utils/prototypeData';
import type { Order, OrderStatus } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu Konfirmasi',
  confirmed: 'Dikonfirmasi',
  processing: 'Diproses',
  shipped: 'Dikirim',
  delivered: 'Diterima',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  pending:   { bg: 'rgba(255,214,0,0.15)',   text: '#b45309' },
  confirmed: { bg: 'rgba(56,206,25,0.12)',   text: 'var(--tanipro-forest)' },
  processing:{ bg: 'rgba(99,102,241,0.12)',  text: '#4338ca' },
  shipped:   { bg: 'rgba(6,182,212,0.12)',   text: '#0e7490' },
  delivered: { bg: 'rgba(16,185,129,0.12)',  text: '#065f46' },
  completed: { bg: 'rgba(20,107,58,0.12)',   text: 'var(--tanipro-forest)' },
  cancelled: { bg: 'rgba(239,68,68,0.12)',   text: '#dc2626' },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:    'confirmed',
  confirmed:  'processing',
  processing: 'shipped',
  shipped:    'delivered',
  delivered:  'completed',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending:    'Konfirmasi ✅',
  confirmed:  'Mulai Proses 🔧',
  processing: 'Tandai Dikirim 🚚',
  shipped:    'Tandai Diterima 📦',
  delivered:  'Selesaikan ✔️',
};

export default function FarmerOrdersPage() {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'done'>('active');
  const [updating, setUpdating] = useState<string | null>(null);
  const [isPrototypeData, setIsPrototypeData] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    const data = await getOrders({ farmer_id: user.id });
    if (data && data.length > 0) {
      setOrders(data);
      setIsPrototypeData(false);
    } else {
      // Use prototype data as fallback
      setOrders(PROTOTYPE_ORDERS);
      setIsPrototypeData(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getOrders({ farmer_id: user.id }).then((data) => {
      if (cancelled) return;
      if (data && data.length > 0) {
        setOrders(data);
        setIsPrototypeData(false);
      } else {
        setOrders(PROTOTYPE_ORDERS);
        setIsPrototypeData(true);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleUpdate = async (order: Order, newStatus: OrderStatus) => {
    setUpdating(order.id);
    try {
      await updateOrderStatus(order.id, newStatus);
      await addActivity(
        user!.id, user!.full_name, 'farmer',
        'update_order',
        `Update pesanan ${order.order_code} → ${STATUS_LABEL[newStatus]}`,
      );
      fetchOrders();
    } finally {
      setUpdating(null);
    }
  };

  const handleCancel = async (order: Order) => {
    setUpdating(order.id);
    try {
      await updateOrderStatus(order.id, 'cancelled');
      await addActivity(
        user!.id, user!.full_name, 'farmer',
        'cancel_order',
        `Menolak pesanan ${order.order_code}`,
      );
      fetchOrders();
    } finally {
      setUpdating(null);
    }
  };

  const DONE_STATUSES = ['completed', 'cancelled'];
  const activeOrders = orders.filter((o) => !DONE_STATUSES.includes(o.status));
  const doneOrders   = orders.filter((o) => DONE_STATUSES.includes(o.status));
  const displayed    = activeTab === 'active' ? activeOrders : doneOrders;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>
          Pesanan Masuk 📬
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>
          Kelola semua pesanan dari pembeli — konfirmasi, proses, dan kirim.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['active', 'done'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={
              activeTab === tab
                ? { background: 'var(--tanipro-moss)', color: 'white' }
                : { background: 'var(--tanipro-warm-gray)', color: 'var(--tanipro-mid-gray)' }
            }
          >
            {tab === 'active' ? `Aktif (${activeOrders.length})` : `Selesai (${doneOrders.length})`}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'var(--tanipro-warm-gray)' }} />
          ))}
        </div>
      ) : isPrototypeData && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            📋 Menampilkan data prototype untuk demo. Tab dan fitur akan aktif saat ada pesanan nyata.
          </p>
        </div>
      )}
      {displayed.length === 0 ? (
        <div
          className="text-center py-16 rounded-3xl border border-dashed"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="text-5xl mb-3">{activeTab === 'active' ? '📭' : '📋'}</div>
          <p className="font-semibold" style={{ color: 'var(--tanipro-forest)' }}>
            {activeTab === 'active' ? 'Belum ada pesanan aktif' : 'Belum ada pesanan selesai'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((order) => {
            const statusStyle = STATUS_COLOR[order.status] ?? STATUS_COLOR.pending;
            const nextStatus  = NEXT_STATUS[order.status as OrderStatus];
            const nextLabel   = NEXT_LABEL[order.status as OrderStatus];
            const isUpdating  = updating === order.id;

            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl transition-shadow hover:shadow-md"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: statusStyle.bg, color: statusStyle.text }}
                      >
                        {STATUS_LABEL[order.status]}
                      </span>
                      <span className="text-xs font-mono font-semibold text-gray-500">
                        {order.order_code}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {order.commodity_name}
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--tanipro-mid-gray)' }}>
                      {order.quantity} {order.unit} · {formatRp(order.total_price)}
                      {order.notes && <span className="ml-2 italic">· &quot;{order.notes}&quot;</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(order.created_at)}</p>
                  </div>

                  {/* Actions */}
                  {activeTab === 'active' && (
                    <div className="flex gap-2 shrink-0">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(order)}
                          disabled={isUpdating || isPrototypeData}
                          className="px-3 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}
                          title={isPrototypeData ? 'Tidak tersedia untuk data demo' : undefined}
                        >
                          {isUpdating ? '...' : 'Tolak ✕'}
                        </button>
                      )}
                      {nextStatus && nextLabel && (
                        <button
                          onClick={() => handleUpdate(order, nextStatus)}
                          disabled={isUpdating || isPrototypeData}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                          style={{ background: 'var(--tanipro-moss)' }}
                          title={isPrototypeData ? 'Tidak tersedia untuk data demo' : undefined}
                        >
                          {isUpdating ? 'Memperbarui...' : nextLabel}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
