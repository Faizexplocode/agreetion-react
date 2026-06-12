'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/lib/context/AuthContext';
import { useCommodities } from '@/lib/hooks/useCommodities';
import { addCommodity, deleteCommodity, updateCommodity } from '@/lib/firebase/commodities';
import { PROTOTYPE_COMMODITIES } from '@/lib/utils/prototypeData';
import type { Commodity } from '@/types';
import CommodityForm from '@/components/features/commodity/CommodityForm';
import CommodityCard from '@/components/features/commodity/CommodityCard';

export default function FarmerCommoditiesPage() {
  const { user } = useAuthContext();
  const farmerId = user?.id ?? null;

  const { commodities, loading } = useCommodities(farmerId ?? undefined);

  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<Commodity | null>(null);

  const sorted = useMemo(() => {
    // Use prototype data as fallback
    const displayCommodities = commodities.length > 0 ? commodities : PROTOTYPE_COMMODITIES;
    return [...displayCommodities].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
  }, [commodities]);

  const handleAdd = async (payload: Partial<Commodity>) => {
    if (!user) return;
    const { success, commodity } = await addCommodity({
      ...(payload as Omit<Commodity, 'id' | 'created_at' | 'is_available'>),
      farmer_id: user.id,
    });
    if (!success || !commodity) throw new Error('Gagal menyimpan komoditas');
    setIsAdding(false);
  };

  const handleUpdate = async (payload: Partial<Commodity>) => {
    if (!editing) return;
    const ok = await updateCommodity(editing.id, {
      ...(payload as Partial<Commodity>),
    });
    if (!ok) throw new Error('Gagal menyimpan perubahan');
    setEditing(null);
  };

  const handleDelete = async (c: Commodity) => {
    const ok = await deleteCommodity(c.id);
    if (!ok) throw new Error('Gagal menghapus komoditas');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6">
        <div className="max-w-3xl w-full rounded-3xl border border-gray-200 bg-white p-10 shadow-xl">
          <h1 className="text-3xl font-bold text-[var(--tanipro-forest)]">Komoditas Saya</h1>
          <p className="mt-4 text-gray-600">Silakan login untuk mengelola komoditas.</p>
          <Link
            href="/dashboard/farmer"
            className="mt-8 inline-flex rounded-full bg-[var(--tanipro-moss)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--tanipro-forest)]"
          >
            Kembali ke Dashboard Petani
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>
              Komoditas Saya
            </h1>
            <p className="text-sm" style={{ color: 'var(--tanipro-mid-gray)' }}>
              Real-time dari Firestore. Tambah, ubah, dan hapus komoditas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setIsAdding((v) => !v);
            }}
            className="px-5 py-2 rounded-full text-sm font-semibold"
            style={{ background: 'var(--tanipro-moss)', color: 'white' }}
          >
            {isAdding ? 'Batal' : '+ Tambah Komoditas'}
          </button>
        </div>

        {isAdding && (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <CommodityForm
              onCancel={() => {
                setIsAdding(false);
              }}
              onSubmit={handleAdd}
            />
          </div>
        )}

        {editing && (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <CommodityForm
              initial={editing}
              onCancel={() => setEditing(null)}
              onSubmit={handleUpdate}
            />
          </div>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: 'var(--tanipro-forest)' }}>
              Daftar Komoditas
            </h2>
            <span className="text-sm" style={{ color: 'var(--tanipro-mid-gray)' }}>
              {loading ? 'Memuat...' : `${sorted.length} item`}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl animate-pulse"
                  style={{ background: 'var(--tanipro-warm-gray)' }}
                />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div
              className="text-center py-14 rounded-3xl border border-dashed"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="text-5xl mb-3">🌱</div>
              <p className="font-semibold mb-1" style={{ color: 'var(--tanipro-forest)' }}>
                Belum ada komoditas
              </p>
              <p className="text-sm" style={{ color: 'var(--tanipro-mid-gray)' }}>
                Tambahkan komoditas pertama Anda.
              </p>
            </div>
          ) : commodities.length === 0 ? (
            // Show prototype data with informational badge
            <>
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  📋 Menampilkan data prototype untuk demo. Data akan terganti saat Anda menambahkan komoditas baru.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sorted.map((c) => (
                  <div key={c.id} className="relative">
                    <CommodityCard commodity={c} mode="farmer" showFarmerInfo={false} />

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(c)}
                        className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold"
                        style={{ background: 'rgba(232, 168, 56, 0.15)', color: 'var(--tanipro-moss)' }}
                        disabled
                      >
                        Edit (Demo)
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await handleDelete(c);
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="px-3 py-2 rounded-xl text-sm font-semibold"
                        style={{ background: 'rgba(255, 60, 60, 0.12)', color: '#ff4d4d' }}
                        disabled
                      >
                        Hapus (Demo)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sorted.map((c) => (
                <div key={c.id} className="relative">
                  <CommodityCard commodity={c} mode="farmer" showFarmerInfo={false} />

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(c)}
                      className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(232, 168, 56, 0.15)', color: 'var(--tanipro-moss)' }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await handleDelete(c);
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="px-3 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(255, 60, 60, 0.12)', color: '#ff4d4d' }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

