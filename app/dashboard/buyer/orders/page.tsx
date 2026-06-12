'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/lib/context/AuthContext';
import { getOrders } from '@/lib/firebase/orders';
import { formatRp, timeAgo } from '@/lib/utils/formatters';
import type { Order } from '@/types';
import Link from 'next/link';

const STATUS_LABEL: Record<string, string> = {
  pending:    'Menunggu Konfirmasi',
  confirmed:  'Dikonfirmasi',
  processing: 'Diproses',
  shipped:    'Dikirim',
  delivered:  'Diterima',
  completed:  'Selesai',
  cancelled:  'Dibatalkan',
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  pending:    { bg: 'rgba(255,214,0,0.15)',   text: '#b45309' },
  confirmed:  { bg: 'rgba(56,206,25,0.12)',   text: 'var(--tanipro-forest)' },
  processing: { bg: 'rgba(99,102,241,0.12)',  text: '#4338ca' },
  shipped:    { bg: 'rgba(6,182,212,0.12)',   text: '#0e7490' },
  delivered:  { bg: 'rgba(16,185,129,0.12)',  text: '#065f46' },
  completed:  { bg: 'rgba(20,107,58,0.12)',   text: 'var(--tanipro-forest)' },
  cancelled:  { bg: 'rgba(239,68,68,0.12)',   text: '#dc2626' },
};

// Progress steps for tracking
const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed'];

function OrderTracker({ status }: { status: string }) {
  const currentIndex = STEPS.indexOf(status);
  if (status === 'cancelled') {
    return (
      <p className="text-xs text-red-500 font-semibold mt-2">❌ Pesanan dibatalkan</p>
    );
  }
  return (
    <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-1 shrink-0">
          <div
            className="w-2 h-2 rounded-full shrink-0 transition-all"
            style={{
              background: i <= currentIndex ? 'var(--tanipro-moss)' : 'var(--tanipro-warm-gray)',
            }}
          />
          {i < STEPS.length - 1 && (
            <div
              className="w-6 h-0.5 shrink-0 transition-all"
              style={{
                background: i < currentIndex ? 'var(--tanipro-moss)' : 'var(--tanipro-warm-gray)',
              }}
            />
          )}
        </div>
      ))}
      <span className="ml-2 text-[10px] font-semibold shrink-0" style={{ color: 'var(--tanipro-moss)' }}>
        {STATUS_LABEL[status] ?? status}
      </span>
    </div>
  );
}

export default function BuyerOrdersPage() {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'done'>('active');
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;
    getOrders({ buyer_id: user.id }).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, [user]);

  const DONE_STATUSES = ['completed', 'cancelled'];
  const activeOrders = orders.filter((o) => !DONE_STATUSES.includes(o.status));
  const doneOrders   = orders.filter((o) => DONE_STATUSES.includes(o.status));
  const displayed    = activeTab === 'active' ? activeOrders : doneOrders;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>
            Pesanan Saya 📦
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>
            Pantau status semua pesanan kamu di sini.
          </p>
        </div>
        <Link
          href="/dashboard/buyer/catalog"
          className="px-4 py-2 rounded-full text-sm font-semibold text-white"
          style={{ background: 'var(--tanipro-moss)' }}
        >
          + Pesan Lagi
        </Link>
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
            {tab === 'active' ? `Sedang Berjalan (${activeOrders.length})` : `Selesai (${doneOrders.length})`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'var(--tanipro-warm-gray)' }} />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div
          className="text-center py-16 rounded-3xl border border-dashed"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="text-5xl mb-3">{activeTab === 'active' ? '🛒' : '✅'}</div>
          <p className="font-semibold mb-2" style={{ color: 'var(--tanipro-forest)' }}>
            {activeTab === 'active' ? 'Belum ada pesanan aktif' : 'Belum ada pesanan selesai'}
          </p>
          {activeTab === 'active' && (
            <Link
              href="/dashboard/buyer/catalog"
              className="inline-block px-5 py-2.5 rounded-full text-sm font-semibold text-white mt-2"
              style={{ background: 'var(--tanipro-moss)' }}
            >
              Lihat Katalog Komoditas →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((order) => {
            const statusStyle = STATUS_COLOR[order.status] ?? STATUS_COLOR.pending;
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
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: statusStyle.bg, color: statusStyle.text }}
                      >
                        {STATUS_LABEL[order.status]}
                      </span>
                      <span className="text-xs font-mono text-gray-500">{order.order_code}</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">{order.commodity_name}</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--tanipro-mid-gray)' }}>
                      {order.quantity} {order.unit} · {formatRp(order.total_price)}
                    </p>
                    {order.notes && (
                      <p className="text-xs text-gray-400 mt-1 italic">💬 &quot;{order.notes}&quot;</p>
                    )}
                    <OrderTracker status={order.status} />
                    
                    {/* Lacak VMS Button for active orders */}
                    {!DONE_STATUSES.includes(order.status) && (
                      <button
                        onClick={() => setSelectedOrderForTracking(order)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
                        style={{ background: 'var(--tanipro-moss)' }}
                      >
                        Lacak Rute VMS 📍
                      </button>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">{timeAgo(order.created_at)}</p>
                    <p className="text-lg font-extrabold mt-1" style={{ color: 'var(--tanipro-forest)' }}>
                      {formatRp(order.total_price)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VMS Live Tracking Modal */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div>
                <h3 className="text-md font-bold text-gray-900">
                  Pelacakan Rute VMS &mdash; {selectedOrderForTracking.order_code}
                </h3>
                <p className="text-xs text-gray-500">Live GPS tracking armada TaniPro</p>
              </div>
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-sm text-gray-500 hover:bg-gray-100 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Stylized SVG Map */}
            <div className="h-44 bg-emerald-50 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,black_1px,transparent_1px)] bg-[size:10px_10px]" />
              <svg className="w-full h-full absolute inset-0 text-[var(--tanipro-moss)]" viewBox="0 0 200 100">
                <path
                  d="M 30,80 Q 90,20 170,30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="4 2"
                  className="animate-[dash_2s_linear_infinite]"
                />
                <circle cx="30" cy="80" r="5" fill="var(--tanipro-harvest)" />
                <circle cx="170" cy="30" r="5" fill="var(--tanipro-forest)" />
                {/* Truck animation on path */}
                <g className="animate-[move_6s_ease-in-out_infinite]">
                  <rect x="-8" y="-4" width="16" height="8" rx="2" fill="var(--tanipro-forest)" />
                  <circle cx="4" cy="4" r="2" fill="black" />
                  <circle cx="-4" cy="4" r="2" fill="black" />
                </g>
              </svg>
              <span className="absolute bottom-2 left-2 text-[8px] bg-white px-2 py-0.5 rounded shadow border text-gray-500">
                📍 Gapoktan Cianjur
              </span>
              <span className="absolute top-2 right-2 text-[8px] bg-white px-2 py-0.5 rounded shadow border text-gray-500">
                🏢 Gudang Anda
              </span>
              <span className="absolute top-2 left-2 text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                🛰️ VMS Live
              </span>
            </div>

            {/* VMS Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-gray-400">Driver</span>
                  <span className="font-semibold text-gray-800">Budi Santoso (3PL Partner)</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-gray-400">Kontak Driver</span>
                  <span className="font-mono text-gray-800">+62 812-9981-0021</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Armada VMS</span>
                  <span className="font-semibold text-gray-800">
                    {selectedOrderForTracking.quantity > 100 ? 'CDD (Refrigerated Box)' : 'CDE (Box Truck)'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-gray-400">Estimasi Tiba</span>
                  <span className="font-bold text-[var(--tanipro-moss)]">2-3 Jam</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-gray-400">Suhu Box Truk</span>
                  <span className={`font-semibold ${selectedOrderForTracking.quantity > 100 ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                    {selectedOrderForTracking.quantity > 100 ? '🧊 Dingin Terjaga (4°C)' : '🌡️ Suhu Ruang (27°C)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Optimasi Rute</span>
                  <span className="font-bold text-emerald-600">VRPTW Optimal (Tol Jagorawi)</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="w-full py-2.5 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
                style={{ background: 'var(--tanipro-moss)' }}
              >
                Tutup Pelacakan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
