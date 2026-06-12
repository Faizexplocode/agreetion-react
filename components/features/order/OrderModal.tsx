'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatRp } from '@/lib/utils/formatters';
import type { Commodity } from '@/types';

interface OrderModalProps {
  commodity: Commodity | null;
  buyerId: string;
  buyerName: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderModal({
  commodity,
  buyerId,
  buyerName,
  open,
  onClose,
  onSuccess,
}: OrderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!commodity) return null;

  const maxStock = commodity.stock ?? 999;
  const totalPrice = quantity * commodity.price;

  const handleOrder = async () => {
    if (quantity < 1) return setError('Jumlah minimal 1');
    if (quantity > maxStock) return setError(`Stok hanya ${maxStock} ${commodity.unit}`);

    setError('');
    setLoading(true);
    try {
      // Import dinamis biar ga circular
      const { createOrder } = await import('@/lib/firebase/orders');
      const { addActivity } = await import('@/lib/firebase/activity');

      const res = await createOrder({
        buyer_id: buyerId,
        farmer_id: commodity.farmer_id,
        commodity_id: commodity.id,
        commodity_name: commodity.name,
        quantity,
        unit: commodity.unit,
        total_price: totalPrice,
        notes: notes.trim() || undefined,
      });

      if (!res.success) throw new Error('Gagal membuat pesanan');

      await addActivity(
        buyerId,
        buyerName,
        'buyer',
        'order',
        `Memesan ${quantity} ${commodity.unit} ${commodity.name} — ${formatRp(totalPrice)}`,
      );

      setQuantity(1);
      setNotes('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-3">
          <span className="text-2xl">{commodity.emoji ?? '🌿'}</span>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">Pesan {commodity.name}</p>
            <p className="text-xs text-gray-500 font-normal">
              {formatRp(commodity.price)} / {commodity.unit}
            </p>
          </div>
        </div>
      }
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button variant="primary" size="sm" onClick={handleOrder} loading={loading}>
            Konfirmasi Pesanan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Stok info */}
        <div
          className="flex items-center gap-2 p-3 rounded-xl text-sm"
          style={{ background: 'rgba(56,206,25,0.08)', color: 'var(--tanipro-forest)' }}
        >
          <span>📦</span>
          <span>Stok tersedia: <strong>{maxStock} {commodity.unit}</strong></span>
          {commodity.farmer_name && (
            <span className="ml-auto text-xs text-gray-500">dari {commodity.farmer_name}</span>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Jumlah ({commodity.unit})
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              style={{ color: 'var(--tanipro-forest)' }}
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={maxStock}
              value={quantity}
              onChange={(e) => {
                const v = parseInt(e.target.value) || 1;
                setQuantity(Math.min(maxStock, Math.max(1, v)));
              }}
              className="flex-1 text-center border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--tanipro-moss)] bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              style={{ color: 'var(--tanipro-forest)' }}
            >
              +
            </button>
          </div>
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Catatan <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Misal: pengiriman ke gudang Surabaya, minta dikemas rapi, dll."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tanipro-moss)] bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
            ⚠️ {error}
          </p>
        )}

        {/* Total */}
        <div
          className="flex items-center justify-between p-4 rounded-2xl"
          style={{ background: 'var(--tanipro-warm-gray)' }}
        >
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Harga</span>
          <span className="text-xl font-extrabold" style={{ color: 'var(--tanipro-forest)' }}>
            {formatRp(totalPrice)}
          </span>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Platform fee 2% akan ditambahkan saat pembayaran
        </p>
      </div>
    </Modal>
  );
}
