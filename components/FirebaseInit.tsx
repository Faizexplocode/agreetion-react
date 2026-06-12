'use client';

import { useEffect } from 'react';
import { seedDemoDataIfEmpty } from '@/lib/firebase/users';
import { seedDemoContent } from '@/lib/firebase/seed';

/**
 * Komponen ini dijalankan satu kali saat app pertama kali load.
 * Jika Firestore kosong (project baru), otomatis seed demo accounts & konten:
 *   - admin@tanipro.id / Admin@TaniPro2024
 *   - sido@tanipro.id  / Petani@123
 *   - ptjaya@tanipro.id / Buyer@123
 *   + komoditas, pesanan, pengiriman, notifikasi, aktivitas
 */
export default function FirebaseInit() {
  useEffect(() => {
    seedDemoDataIfEmpty()
      .then(() => seedDemoContent())
      .then(() => {
        console.log('[TaniPro] Firebase init check complete.');
      })
      .catch((err) => {
        console.error('[TaniPro] Firebase init error:', err);
      });
  }, []);

  // Tidak render apapun ke UI
  return null;
}
