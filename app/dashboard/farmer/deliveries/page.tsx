'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/lib/context/AuthContext';
import { getDeliveries, updateDelivery } from '@/lib/firebase/deliveries';
import { addActivity } from '@/lib/firebase/activity';
import { formatRp, timeAgo } from '@/lib/utils/formatters';
import type { Order } from '@/types';
import type { Delivery } from '@/types';

type OrderWithDelivery = Order & { delivery: Delivery | null };

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu', confirmed: 'Dikonfirmasi', processing: 'Diproses',
  shipped: 'Dikirim', delivered: 'Diterima', completed: 'Selesai', cancelled: 'Dibatalkan',
};

const COURIERS = ['JNE', 'J&T Express', 'SiCepat', 'Anteraja', 'Ninja Xpress', 'GoSend', 'Grab Express', 'Ekspedisi Sendiri'];

export default function FarmerDeliveriesPage() {
  const { user } = useAuthContext();
  const [items, setItems] = useState<OrderWithDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ courier: '', tracking_number: '', estimated_date: '', status: 'on_the_way' });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetch = async () => {
    if (!user) return;
    const data = await getDeliveries(user.id);
    // Only show orders that are shipped/delivered/completed
    setItems(data.filter(d => ['shipped', 'delivered', 'completed', 'processing', 'confirmed'].includes(d.status)));
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getDeliveries(user.id).then((data) => {
      if (cancelled) return;
      setItems(data.filter(d => ['shipped', 'delivered', 'completed', 'processing', 'confirmed'].includes(d.status)));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const startEdit = (item: OrderWithDelivery) => {
    setEditingId(item.id);
    setForm({
      courier: item.delivery?.courier ?? '',
      tracking_number: item.delivery?.tracking_number ?? '',
      estimated_date: item.delivery?.estimated_date ?? '',
      status: item.delivery?.status ?? 'on_the_way',
    });
  };

  const handleSave = async (item: OrderWithDelivery) => {
    setSaving(true);
    try {
      await updateDelivery(item.id, {
        courier: form.courier,
        tracking_number: form.tracking_number,
        estimated_date: form.estimated_date,
        status: form.status,
      });
      await addActivity(
        user!.id, user!.full_name, 'farmer',
        'update_delivery',
        `Update pengiriman pesanan ${item.order_code} — ${form.courier} ${form.tracking_number}`,
      );
      setSuccessMsg(`Info pengiriman ${item.order_code} berhasil disimpan!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setEditingId(null);
      fetch();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>
          Pengiriman 🚚
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>
          Kelola info pengiriman untuk pesanan yang sudah dikonfirmasi.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl flex items-center gap-3 animate-fade-in"
          style={{ background: 'rgba(56,206,25,0.12)', border: '1px solid rgba(56,206,25,0.3)' }}>
          <span>✅</span>
          <p className="text-sm font-semibold" style={{ color: 'var(--tanipro-forest)' }}>{successMsg}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'var(--tanipro-warm-gray)' }} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-5xl mb-3">🚚</div>
          <p className="font-semibold" style={{ color: 'var(--tanipro-forest)' }}>Belum ada pesanan yang perlu dikirim</p>
          <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>Pesanan yang sudah dikonfirmasi akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const isEditing = editingId === item.id;
            const hasDelivery = !!item.delivery;
            return (
              <div key={item.id} className="p-5 rounded-2xl transition-shadow"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                {/* Order Info */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">{item.order_code}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(6,182,212,0.12)', color: '#0e7490' }}>
                        {ORDER_STATUS_LABEL[item.status]}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">{item.commodity_name}</p>
                    <p className="text-sm" style={{ color: 'var(--tanipro-mid-gray)' }}>
                      {item.quantity} {item.unit} · {formatRp(item.total_price)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(item.created_at)}</p>
                  </div>
                  {!isEditing && (
                    <button onClick={() => startEdit(item)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
                      style={{ background: 'rgba(56,206,25,0.12)', color: 'var(--tanipro-forest)' }}>
                      {hasDelivery ? 'Edit Info' : '+ Tambah Info Kirim'}
                    </button>
                  )}
                </div>

                {/* Delivery Info Display */}
                {!isEditing && hasDelivery && (
                  <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Kurir', value: item.delivery!.courier ?? '-' },
                        { label: 'No. Resi', value: item.delivery!.tracking_number ?? '-' },
                        { label: 'Est. Tiba', value: item.delivery!.estimated_date ? new Date(item.delivery!.estimated_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value}</p>
                        </div>
                      ))}
                    </div>
                    {/* Simulated VMS Vehicle dispatch info */}
                    <div className="p-3 bg-[rgba(74,124,89,0.04)] border border-[rgba(74,124,89,0.15)] rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🚚</span>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200">
                            VMS Smart-Dispatcher: {item.quantity > 500 ? 'CDD (Refrigerated Box)' : 'CDE (Box Truck)'}
                          </p>
                          <p className="text-[10px] text-[var(--tanipro-mid-gray)]">
                            Rute Optimal Terkunci &middot; {item.quantity > 500 ? 'Muatan Berat/Perishable' : 'Muatan Reguler'}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[var(--tanipro-moss)] text-white">
                        Rute Terkunci GPS
                      </span>
                    </div>
                  </div>
                )}


                {/* Edit Form */}
                {isEditing && (
                  <div className="pt-3 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Kurir</label>
                        <select value={form.courier} onChange={e => setForm(f => ({ ...f, courier: e.target.value }))}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--tanipro-moss)]">
                          <option value="">Pilih Kurir</option>
                          {COURIERS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">No. Resi</label>
                        <input type="text" placeholder="Contoh: JNE123456789"
                          value={form.tracking_number} onChange={e => setForm(f => ({ ...f, tracking_number: e.target.value }))}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--tanipro-moss)]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Estimasi Tiba</label>
                        <input type="date" value={form.estimated_date} onChange={e => setForm(f => ({ ...f, estimated_date: e.target.value }))}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--tanipro-moss)]" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingId(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        Batal
                      </button>
                      <button onClick={() => handleSave(item)} disabled={saving}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: 'var(--tanipro-moss)' }}>
                        {saving ? 'Menyimpan...' : 'Simpan Info Pengiriman'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
