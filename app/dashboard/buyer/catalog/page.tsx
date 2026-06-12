'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/lib/context/AuthContext';
import { getAvailableCommodities } from '@/lib/firebase/commodities';
import { PROTOTYPE_COMMODITIES } from '@/lib/utils/prototypeData';
import CommodityCard from '@/components/features/commodity/CommodityCard';
import OrderModal from '@/components/features/order/OrderModal';
import type { Commodity } from '@/types';

const CATEGORIES = ['Semua', 'sayuran', 'buah', 'biji-bijian', 'rempah', 'lainnya'];

export default function BuyerCatalogPage() {
  const { user } = useAuthContext();
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [orderTarget, setOrderTarget] = useState<Commodity | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCommodities = async () => {
    try {
      const data = await getAvailableCommodities();
      setCommodities(data && data.length > 0 ? data : PROTOTYPE_COMMODITIES);
    } catch (e) {
      console.error(e);
      // Fallback to prototype
      setCommodities(PROTOTYPE_COMMODITIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    getAvailableCommodities()
      .then((data) => {
        if (!cancelled) {
          setCommodities(data && data.length > 0 ? data : PROTOTYPE_COMMODITIES);
        }
      })
      .catch(() => {
        if (!cancelled) setCommodities(PROTOTYPE_COMMODITIES);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = commodities.filter((c) => {
    const matchSearch =
      search.trim() === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.farmer_name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Semua' || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleOrderSuccess = () => {
    setSuccessMsg('Pesanan berhasil dibuat! 🎉 Petani akan segera mengkonfirmasi.');
    setTimeout(() => setSuccessMsg(''), 4000);
    fetchCommodities();
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>
          Katalog Komoditas 🛒
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>
          {loading ? 'Memuat...' : `${filtered.length} komoditas tersedia dari petani terpercaya`}
        </p>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div
          className="p-4 rounded-2xl flex items-center gap-3 animate-fade-in"
          style={{ background: 'rgba(56,206,25,0.12)', border: '1px solid rgba(56,206,25,0.3)' }}
        >
          <span className="text-2xl">✅</span>
          <p className="font-semibold text-sm" style={{ color: 'var(--tanipro-forest)' }}>
            {successMsg}
          </p>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Cari komoditas atau petani..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tanipro-moss)] text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize"
              style={
                activeCategory === cat
                  ? { background: 'var(--tanipro-moss)', color: 'white' }
                  : { background: 'var(--tanipro-warm-gray)', color: 'var(--tanipro-mid-gray)' }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-52 rounded-2xl animate-pulse"
              style={{ background: 'var(--tanipro-warm-gray)' }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 rounded-3xl border border-dashed"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="text-5xl mb-3">🔍</div>
          <p className="font-semibold" style={{ color: 'var(--tanipro-forest)' }}>
            Tidak ada komoditas ditemukan
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>
            Coba ubah kata kunci atau kategori
          </p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('Semua'); }}
            className="mt-4 px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: 'var(--tanipro-moss)' }}
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <CommodityCard
              key={c.id}
              commodity={c}
              mode="buyer"
              onOrder={(commodity) => setOrderTarget(commodity)}
            />
          ))}
        </div>
      )}

      {/* Order Modal */}
      <OrderModal
        open={orderTarget !== null}
        commodity={orderTarget}
        buyerId={user.id}
        buyerName={user.full_name}
        onClose={() => setOrderTarget(null)}
        onSuccess={handleOrderSuccess}
      />
    </div>
  );
}
