'use client';
import { useEffect, useState } from 'react';
import { listenCommodities } from '@/lib/firebase/commodities';
import { PROTOTYPE_COMMODITIES } from '@/lib/utils/prototypeData';
import { Commodity } from '@/types';

export function useCommodities(farmerId?: string) {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    try {
      unsub = listenCommodities(farmerId ?? null, (data) => {
        setCommodities(data);
        setLoading(false);
        setError(null);
      });
    } catch (err: any) {
      // Handle Firebase index errors and other errors gracefully
      console.warn('[useCommodities] Firebase error, using fallback:', err?.message);
      
      // If farmerId matches prototype, use it; otherwise empty
      if (farmerId && PROTOTYPE_COMMODITIES.some(c => c.farmer_id === farmerId)) {
        setCommodities(PROTOTYPE_COMMODITIES);
      } else {
        setCommodities([]);
      }
      
      setLoading(false);
      setError(err?.message || 'Firebase query error');
    }

    return () => {
      if (unsub) unsub();
    };
  }, [farmerId]);

  return { commodities, loading, error };
}
