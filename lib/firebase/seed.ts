import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { findByEmail } from '@/lib/firebase/users';
import { getCommodities } from '@/lib/firebase/commodities';
import { getOrders } from '@/lib/firebase/orders';
import type { Commodity, NotifType, OrderStatus, UserRole } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

type CommoditySeed = Omit<Commodity, 'id' | 'created_at' | 'is_available' | 'farmer_id'>;

const FARMER_COMMODITIES: CommoditySeed[] = [
  {
    name: 'Cabai Merah Keriting',
    category: 'sayuran',
    unit: 'kg',
    price: 45_000,
    stock: 500,
    is_preorder: false,
    emoji: '🌶️',
    description: 'Cabai merah keriting segar hasil panen pagi, kualitas ekspor.',
    harvest_date: daysFromNow(3),
  },
  {
    name: 'Tomat Hijau',
    category: 'sayuran',
    unit: 'kg',
    price: 12_000,
    stock: 800,
    is_preorder: false,
    emoji: '🍅',
    description: 'Tomat hijau ukuran sedang, cocok untuk industri pengolahan.',
    harvest_date: daysFromNow(1),
  },
  {
    name: 'Jagung Manis',
    category: 'biji-bijian',
    unit: 'kg',
    price: 8_500,
    stock: 1_200,
    is_preorder: false,
    emoji: '🌽',
    description: 'Jagung manis pipilan kering, kadar air rendah.',
    harvest_date: daysFromNow(7),
  },
  {
    name: 'Cabai Rawit',
    category: 'sayuran',
    unit: 'kg',
    price: 55_000,
    stock: 200,
    is_preorder: true,
    emoji: '🔥',
    description: 'Pre-order cabai rawit, panen minggu depan.',
    harvest_date: daysFromNow(10),
  },
  {
    name: 'Wortel',
    category: 'sayuran',
    unit: 'kg',
    price: 15_000,
    stock: 350,
    is_preorder: false,
    emoji: '🥕',
    description: 'Wortel segar ukuran seragam, cocok untuk supermarket.',
    harvest_date: daysFromNow(2),
  },
  {
    name: 'Bawang Merah',
    category: 'rempah',
    unit: 'kg',
    price: 38_000,
    stock: 600,
    is_preorder: false,
    emoji: '🧅',
    description: 'Bawang merah kualitas premium dari lahan Kebun Sido Segar.',
    harvest_date: daysFromNow(5),
  },
];

// ---------------------------------------------------------------------------
// Commodities
// ---------------------------------------------------------------------------

async function seedFarmerCommodities(farmerId: string): Promise<Map<string, Commodity>> {
  const existing = await getCommodities(farmerId);
  const byName = new Map(existing.map((c) => [c.name, c]));

  for (const item of FARMER_COMMODITIES) {
    if (byName.has(item.name)) continue;

    const now = new Date().toISOString();
    const payload = {
      ...item,
      farmer_id: farmerId,
      is_available: true,
      created_at: now,
    };
    const ref = await addDoc(collection(db, 'commodities'), payload);
    byName.set(item.name, { id: ref.id, ...payload });
  }

  return byName;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

interface OrderSeed {
  commodity_name: string;
  quantity: number;
  status: OrderStatus;
  payment_status: 'unpaid' | 'paid';
  notes?: string;
  created_at: string;
  order_code: string;
}

async function seedDemoOrders(
  farmerId: string,
  buyerId: string,
  commodities: Map<string, Commodity>,
): Promise<void> {
  const existing = await getOrders({ farmer_id: farmerId });
  const existingCodes = new Set(existing.map((o) => o.order_code));

  const templates: OrderSeed[] = [
    {
      order_code: 'DEMO-ORD-001',
      commodity_name: 'Cabai Merah Keriting',
      quantity: 50,
      status: 'pending',
      payment_status: 'unpaid',
      notes: 'Mohon dikirim pagi hari, butuh kualitas A.',
      created_at: daysAgo(1),
    },
    {
      order_code: 'DEMO-ORD-002',
      commodity_name: 'Tomat Hijau',
      quantity: 100,
      status: 'confirmed',
      payment_status: 'unpaid',
      notes: 'Untuk produksi saus tomat minggu ini.',
      created_at: daysAgo(3),
    },
    {
      order_code: 'DEMO-ORD-003',
      commodity_name: 'Jagung Manis',
      quantity: 200,
      status: 'processing',
      payment_status: 'paid',
      created_at: daysAgo(5),
    },
    {
      order_code: 'DEMO-ORD-004',
      commodity_name: 'Cabai Rawit',
      quantity: 30,
      status: 'shipped',
      payment_status: 'paid',
      notes: 'Pre-order batch pertama.',
      created_at: daysAgo(7),
    },
    {
      order_code: 'DEMO-ORD-005',
      commodity_name: 'Tomat Hijau',
      quantity: 80,
      status: 'completed',
      payment_status: 'paid',
      created_at: daysAgo(14),
    },
    {
      order_code: 'DEMO-ORD-006',
      commodity_name: 'Jagung Manis',
      quantity: 150,
      status: 'completed',
      payment_status: 'paid',
      created_at: daysAgo(21),
    },
    {
      order_code: 'DEMO-ORD-007',
      commodity_name: 'Wortel',
      quantity: 40,
      status: 'cancelled',
      payment_status: 'unpaid',
      notes: 'Dibatalkan karena stok tidak mencukupi.',
      created_at: daysAgo(10),
    },
  ];

  for (const tpl of templates) {
    if (existingCodes.has(tpl.order_code)) continue;

    const commodity = commodities.get(tpl.commodity_name);
    if (!commodity) continue;

    const total_price = tpl.quantity * commodity.price;
    const payload = {
      order_code: tpl.order_code,
      buyer_id: buyerId,
      farmer_id: farmerId,
      commodity_id: commodity.id,
      commodity_name: commodity.name,
      quantity: tpl.quantity,
      unit: commodity.unit,
      total_price,
      platform_fee: Math.round(total_price * 0.02),
      status: tpl.status,
      payment_status: tpl.payment_status,
      notes: tpl.notes ?? '',
      created_at: tpl.created_at,
    };

    await addDoc(collection(db, 'orders'), payload);
  }
}

// ---------------------------------------------------------------------------
// Deliveries
// ---------------------------------------------------------------------------

async function seedDemoDeliveries(farmerId: string): Promise<void> {
  const orders = await getOrders({ farmer_id: farmerId });
  const shipped = orders.find((o) => o.order_code === 'DEMO-ORD-004');
  if (!shipped) return;

  const ref = doc(db, 'deliveries', shipped.id);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  await setDoc(
    ref,
    {
      order_id: shipped.id,
      status: 'on_the_way',
      courier: 'JNE',
      tracking_number: 'JNE8829102834',
      estimated_date: daysFromNow(2),
      updated_at: new Date().toISOString(),
    },
    { merge: true },
  );
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

async function seedDemoNotifications(farmerId: string, buyerId: string): Promise<void> {
  const ref = collection(db, 'notifications');
  const snap = await getDocs(query(ref, where('user_id', '==', farmerId)));
  if (snap.size >= 3) return;

  const now = new Date().toISOString();
  const items: { user_id: string; text: string; type: NotifType; read: boolean; created_at: string }[] = [
    {
      user_id: farmerId,
      text: 'Pesanan baru DEMO-ORD-001 masuk — 50 kg Cabai Merah Keriting menunggu konfirmasi.',
      type: 'warning',
      read: false,
      created_at: daysAgo(1),
    },
    {
      user_id: farmerId,
      text: 'Pesanan DEMO-ORD-004 sudah dikirim via JNE. Update resi jika ada perubahan.',
      type: 'info',
      read: false,
      created_at: daysAgo(2),
    },
    {
      user_id: farmerId,
      text: 'Selamat! Pendapatan Rp 960.000 dari pesanan DEMO-ORD-005 telah masuk.',
      type: 'success',
      read: true,
      created_at: daysAgo(5),
    },
    {
      user_id: buyerId,
      text: 'Pesanan DEMO-ORD-002 dikonfirmasi petani. Siap diproses.',
      type: 'success',
      read: false,
      created_at: daysAgo(2),
    },
    {
      user_id: buyerId,
      text: 'Pesanan DEMO-ORD-004 sedang dalam perjalanan — estimasi tiba 2 hari lagi.',
      type: 'info',
      read: false,
      created_at: daysAgo(1),
    },
  ];

  for (const item of items) {
    await addDoc(ref, { ...item, created_at: item.created_at ?? now });
  }
}

// ---------------------------------------------------------------------------
// Activity logs
// ---------------------------------------------------------------------------

async function seedDemoActivity(
  farmerId: string,
  buyerId: string,
  farmerName: string,
  buyerName: string,
): Promise<void> {
  const ref = collection(db, 'activity');
  const snap = await getDocs(query(ref, where('user_id', '==', farmerId)));
  if (snap.size >= 3) return;

  const logs: {
    user_id: string;
    user_name: string;
    role: UserRole;
    action: string;
    detail: string;
    created_at: string;
  }[] = [
    {
      user_id: farmerId,
      user_name: farmerName,
      role: 'farmer',
      action: 'add_commodity',
      detail: 'Menambahkan komoditas Cabai Merah Keriting ke katalog',
      created_at: daysAgo(30),
    },
    {
      user_id: farmerId,
      user_name: farmerName,
      role: 'farmer',
      action: 'update_order',
      detail: 'Mengkonfirmasi pesanan DEMO-ORD-002 — Tomat Hijau 100 kg',
      created_at: daysAgo(3),
    },
    {
      user_id: farmerId,
      user_name: farmerName,
      role: 'farmer',
      action: 'update_delivery',
      detail: 'Update pengiriman DEMO-ORD-004 — JNE JNE8829102834',
      created_at: daysAgo(2),
    },
    {
      user_id: buyerId,
      user_name: buyerName,
      role: 'buyer',
      action: 'create_order',
      detail: 'Membuat pesanan DEMO-ORD-001 — Cabai Merah Keriting 50 kg',
      created_at: daysAgo(1),
    },
  ];

  for (const log of logs) {
    await addDoc(ref, log);
  }
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

/** Seed commodities, orders, deliveries, notifications & activity for demo accounts. */
export async function seedDemoContent(): Promise<void> {
  try {
    const farmer = await findByEmail('sido@tanipro.id');
    const buyer = await findByEmail('ptjaya@tanipro.id');

    if (!farmer || !buyer) {
      console.warn('[seed] Demo users not found — skipping content seed.');
      return;
    }

    const commodities = await seedFarmerCommodities(farmer.id);
    await seedDemoOrders(farmer.id, buyer.id, commodities);
    await seedDemoDeliveries(farmer.id);
    await seedDemoNotifications(farmer.id, buyer.id);
    await seedDemoActivity(
      farmer.id,
      buyer.id,
      farmer.full_name,
      buyer.full_name,
    );

    console.log('[TaniPro] Demo content seeded successfully.');
  } catch (err) {
    console.error('[seed] seedDemoContent error:', err);
  }
}
