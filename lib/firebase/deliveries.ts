import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Delivery, Order } from '@/types';

const COLLECTION = 'deliveries';

export async function updateDelivery(
  orderId: string,
  data: Partial<Delivery>,
): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTION, orderId);
    await setDoc(
      ref,
      { ...data, order_id: orderId, updated_at: new Date().toISOString() },
      { merge: true },
    );
    return true;
  } catch (err) {
    console.error('[deliveries] updateDelivery error:', err);
    return false;
  }
}

export async function getDelivery(orderId: string): Promise<Delivery | null> {
  try {
    const ref = doc(db, COLLECTION, orderId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as Delivery;
  } catch (err) {
    console.error('[deliveries] getDelivery error:', err);
    return null;
  }
}

export async function getDeliveries(
  farmerId: string,
): Promise<(Order & { delivery: Delivery | null })[]> {
  try {
    const ordersSnap = await getDocs(
      query(
        collection(db, 'orders'),
        where('farmer_id', '==', farmerId),
        orderBy('created_at', 'desc'),
      ),
    );
    const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));

    const deliveriesSnap = await getDocs(collection(db, COLLECTION));
    const deliveryMap = new Map<string, Delivery>();
    deliveriesSnap.docs.forEach((d) => deliveryMap.set(d.id, d.data() as Delivery));

    return orders.map((order) => ({
      ...order,
      delivery: deliveryMap.get(order.id) ?? null,
    }));
  } catch (err) {
    console.error('[deliveries] getDeliveries error:', err);
    return [];
  }
}

export async function updateDeliveryStatus(
  orderId: string,
  status: string,
  extra?: Partial<Delivery>,
): Promise<boolean> {
  return updateDelivery(orderId, { status, ...extra });
}
