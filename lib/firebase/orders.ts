import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order, OrderStatus } from '@/types';

const COLLECTION = 'orders';

/** Generate a human-readable order code, e.g. ORD-20240601-A3F2 */
function generateOrderCode(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${date}-${rand}`;
}

export async function getOrders(filter?: {
  farmer_id?: string;
  buyer_id?: string;
  status?: OrderStatus;
}): Promise<Order[]> {
  try {
    const ref = collection(db, COLLECTION);
    let q = query(ref, orderBy('created_at', 'desc'));

    if (filter?.farmer_id) {
      q = query(ref, where('farmer_id', '==', filter.farmer_id), orderBy('created_at', 'desc'));
    } else if (filter?.buyer_id) {
      q = query(ref, where('buyer_id', '==', filter.buyer_id), orderBy('created_at', 'desc'));
    }

    const snap = await getDocs(q);
    let orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));

    if (filter?.status) {
      orders = orders.filter((o) => o.status === filter.status);
    }

    return orders;
  } catch (err) {
    console.error('[orders] getOrders error:', err);
    return [];
  }
}

export async function createOrder(
  data: Omit<Order, 'id' | 'order_code' | 'platform_fee' | 'status' | 'payment_status' | 'created_at'>,
): Promise<{ success: boolean; order?: Order }> {
  try {
    const PLATFORM_FEE_RATE = 0.02; // 2%
    const now = new Date().toISOString();
    const payload = {
      ...data,
      order_code: generateOrderCode(),
      platform_fee: Math.round(data.total_price * PLATFORM_FEE_RATE),
      status: 'pending' as const,
      payment_status: 'unpaid' as const,
      created_at: now,
    };
    const ref = await addDoc(collection(db, COLLECTION), payload);
    const order: Order = { id: ref.id, ...payload };
    return { success: true, order };
  } catch (err) {
    console.error('[orders] createOrder error:', err);
    return { success: false };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<boolean> {
  try {
    await updateDoc(doc(db, COLLECTION, orderId), {
      status,
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('[orders] updateOrderStatus error:', err);
    return false;
  }
}

export function listenOrders(
  filter: { farmer_id?: string; buyer_id?: string } | null,
  callback: (data: Order[]) => void,
): () => void {
  const ref = collection(db, COLLECTION);
  let q = query(ref, orderBy('created_at', 'desc'));

  if (filter?.farmer_id) {
    q = query(ref, where('farmer_id', '==', filter.farmer_id), orderBy('created_at', 'desc'));
  } else if (filter?.buyer_id) {
    q = query(ref, where('buyer_id', '==', filter.buyer_id), orderBy('created_at', 'desc'));
  }

  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    callback(data);
  });
}
