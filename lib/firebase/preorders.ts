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
import { PreOrder } from '@/types';

const COLLECTION = 'preorders';

export async function createPreOrder(
  data: Omit<PreOrder, 'id' | 'status' | 'created_at'>,
): Promise<{ success: boolean; preorder?: PreOrder }> {
  try {
    const now = new Date().toISOString();
    const payload = {
      ...data,
      status: 'pending' as const,
      created_at: now,
    };
    const ref = await addDoc(collection(db, COLLECTION), payload);
    const preorder: PreOrder = { id: ref.id, ...payload };
    return { success: true, preorder };
  } catch (err) {
    console.error('[preorders] createPreOrder error:', err);
    return { success: false };
  }
}

export async function getPreOrders(filter?: {
  farmer_id?: string;
  buyer_id?: string;
}): Promise<PreOrder[]> {
  try {
    const ref = collection(db, COLLECTION);
    let q = query(ref, orderBy('created_at', 'desc'));

    if (filter?.farmer_id) {
      q = query(ref, where('farmer_id', '==', filter.farmer_id), orderBy('created_at', 'desc'));
    } else if (filter?.buyer_id) {
      q = query(ref, where('buyer_id', '==', filter.buyer_id), orderBy('created_at', 'desc'));
    }

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PreOrder));
  } catch (err) {
    console.error('[preorders] getPreOrders error:', err);
    return [];
  }
}

export async function updatePreOrderStatus(
  id: string,
  status: PreOrder['status'],
): Promise<boolean> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      status,
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('[preorders] updatePreOrderStatus error:', err);
    return false;
  }
}

export function listenPreOrders(
  filter: { farmer_id?: string; buyer_id?: string } | null,
  callback: (data: PreOrder[]) => void,
): () => void {
  const ref = collection(db, COLLECTION);
  let q = query(ref, orderBy('created_at', 'desc'));

  if (filter?.farmer_id) {
    q = query(ref, where('farmer_id', '==', filter.farmer_id), orderBy('created_at', 'desc'));
  } else if (filter?.buyer_id) {
    q = query(ref, where('buyer_id', '==', filter.buyer_id), orderBy('created_at', 'desc'));
  }

  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PreOrder));
    callback(data);
  });
}
