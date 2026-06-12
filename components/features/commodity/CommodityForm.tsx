'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Commodity } from '@/types';

type CategoryKey =
  | 'sayuran'
  | 'buah'
  | 'biji-bijian'
  | 'umbi'
  | 'rempah'
  | 'perikanan'
  | 'peternakan'
  | 'lainnya';

const CATEGORIES: { value: CategoryKey; label: string; icon: string }[] = [
  { value: 'sayuran', label: 'Sayuran', icon: '🥬' },
  { value: 'buah', label: 'Buah-buahan', icon: '🍎' },
  { value: 'biji-bijian', label: 'Biji-bijian & Padi', icon: '🌾' },
  { value: 'umbi', label: 'Umbi-umbian', icon: '🥔' },
  { value: 'rempah', label: 'Rempah & Bumbu', icon: '🌶️' },
  { value: 'perikanan', label: 'Perikanan', icon: '🐟' },
  { value: 'peternakan', label: 'Peternakan', icon: '🐄' },
  { value: 'lainnya', label: 'Lainnya', icon: '🌿' },
];

const UNITS = ['kg', 'ton', 'kwintal', 'ikat', 'buah', 'liter', 'karung', 'box'];

const EMOJI_OPTIONS = ['🌾', '🥬', '🍅', '🥕', '🧅', '🌽', '🥔', '🍇', '🍉', '🍌', '🌶️', '🐟', '🥚', '🐄', '🌿', '🫛'];

interface CommodityFormProps {
  initial?: Partial<Commodity>;
  onSubmit: (data: Partial<Commodity>) => Promise<void>;
  onCancel?: () => void;
}

export default function CommodityForm({ initial, onSubmit, onCancel }: CommodityFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    category: (initial?.category ?? 'sayuran') as CategoryKey,
    unit: initial?.unit ?? 'kg',
    price: String(initial?.price ?? ''),
    stock: String(initial?.stock ?? ''),
    emoji: initial?.emoji ?? '🌾',
    is_preorder: initial?.is_preorder ?? false,
    harvest_date: initial?.harvest_date ?? '',
    description: initial?.description ?? '',
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Nama komoditas wajib diisi.'); return; }
    if (!form.price || Number(form.price) <= 0) { setError('Harga harus lebih dari 0.'); return; }
    if (!form.is_preorder && (!form.stock || Number(form.stock) < 0)) {
      setError('Stok wajib diisi untuk komoditas reguler.');
      return;
    }
    if (form.is_preorder && !form.harvest_date) {
      setError('Tanggal panen wajib diisi untuk pre-order.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        category: form.category,
        unit: form.unit,
        price: Number(form.price),
        stock: form.is_preorder ? 0 : Number(form.stock),
        emoji: form.emoji,
        is_preorder: form.is_preorder,
        harvest_date: form.is_preorder ? form.harvest_date : undefined,
        description: form.description.trim() || undefined,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const selectClass =
    'w-full h-10 px-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:border-[var(--tanipro-leaf)] focus:ring-2 focus:ring-[var(--tanipro-leaf)]/20 outline-none transition-all';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Emoji picker */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Icon Komoditas
        </p>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => set('emoji', em)}
              className={[
                'w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all border-2',
                form.emoji === em
                  ? 'border-[var(--tanipro-moss)] bg-[var(--tanipro-moss)]/10 scale-110'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600',
              ].join(' ')}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <Input
        label="Nama Komoditas"
        placeholder="cth. Cabai Merah Keriting"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        required
      />

      {/* Category */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Kategori</p>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => set('category', cat.value)}
              className={[
                'flex flex-col items-center gap-0.5 p-2 rounded-xl border-2 text-xs transition-all',
                form.category === cat.value
                  ? 'border-[var(--tanipro-moss)] bg-[var(--tanipro-moss)]/5 text-[var(--tanipro-forest)] dark:text-[var(--tanipro-leaf)]'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300',
              ].join(' ')}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="font-medium text-center leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price + Unit */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Harga (Rp)"
          type="number"
          placeholder="cth. 15000"
          min="0"
          value={form.price}
          onChange={(e) => set('price', e.target.value)}
          required
        />
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">Satuan</p>
          <select
            value={form.unit}
            onChange={(e) => set('unit', e.target.value)}
            className={selectClass}
          >
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {/* Stok (tanpa pre-order) */}
      <Input
        label="Stok Tersedia"
        type="number"
        placeholder="cth. 500"
        min="0"
        value={form.stock}
        onChange={(e) => set('stock', e.target.value)}
        hint={`Dalam satuan ${form.unit}`}
        required
      />


      {/* Description */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 block">
          Deskripsi (opsional)
        </label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          placeholder="Ceritakan tentang komoditas Anda, kualitas, cara budidaya, dll."
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:border-[var(--tanipro-leaf)] focus:ring-2 focus:ring-[var(--tanipro-leaf)]/20 outline-none transition-all resize-none placeholder:text-gray-400"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="ghost" size="md" onClick={onCancel} className="flex-1">
            Batal
          </Button>
        )}
        <Button type="submit" variant="primary" size="md" loading={loading} className="flex-1">
          {initial ? 'Simpan Perubahan' : 'Tambah Komoditas'}
        </Button>
      </div>
    </form>
  );
}
