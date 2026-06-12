'use client';

import { useEffect, useState } from 'react';
import CommodityCard from '@/components/features/commodity/CommodityCard';
import { getAvailableCommodities } from '@/lib/firebase/commodities';
import type { Commodity } from '@/types';

export default function AdminCommoditiesPage() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAvailableCommodities().then((data) => {
      if (cancelled) return;
      setCommodities(data);
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
          Komoditas Platform
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>
          {loading ? 'Memuat...' : `${commodities.length} komoditas tersedia`}
        </p>
      </div>

      {commodities.length === 0 ? (
        <div className="text-center py-14 rounded-3xl border border-dashed" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="font-semibold" style={{ color: 'var(--tanipro-forest)' }}>
            {loading ? 'Memuat komoditas...' : 'Belum ada komoditas tersedia'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {commodities.map((commodity) => (
            <CommodityCard key={commodity.id} commodity={commodity} mode="farmer" />
          ))}
        </div>
      )}
    </div>
  );
}
