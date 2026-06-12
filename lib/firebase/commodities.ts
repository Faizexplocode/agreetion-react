import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Commodity, User } from '@/types';

const COLLECTION = 'commodities';

export async function getCommodities(farmerId?: string): Promise<Commodity[]> {
  try {
    const ref = collection(db, COLLECTION);
    const q = farmerId
      ? query(ref, where('farmer_id', '==', farmerId), orderBy('created_at', 'desc'))
      : query(ref, orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Commodity));
  } catch (err) {
    console.error('[commodities] getCommodities error:', err);
    return [];
  }
}

export async function getAvailableCommodities(): Promise<Commodity[]> {
  try {
    const ref = collection(db, COLLECTION);
    const q = query(ref, where('is_available', '==', true), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    const commodities = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Commodity));

    // Join with farmer data
    const usersSnap = await getDocs(collection(db, 'users'));
    const usersMap = new Map<string, User>();
    usersSnap.docs.forEach((d) => usersMap.set(d.id, { id: d.id, ...d.data() } as User));

    return commodities.map((c) => {
      const farmer = usersMap.get(c.farmer_id);
      return {
        ...c,
        farmer_name: farmer?.full_name ?? '',
        farm_name: farmer?.farm_name ?? '',
        farmer_city: farmer?.city ?? '',
      };
    });
  } catch (err) {
    console.error('[commodities] getAvailableCommodities error:', err);
    return [];
  }
}

export async function getCommoditiesByFarmer(): Promise<(User & { items: Commodity[] })[]> {
  try {
    const [usersSnap, commoditiesSnap] = await Promise.all([
      getDocs(query(collection(db, 'users'), where('role', '==', 'farmer'))),
      getDocs(collection(db, COLLECTION)),
    ]);

    const allCommodities = commoditiesSnap.docs.map(
      (d) => ({ id: d.id, ...d.data() } as Commodity),
    );

    return usersSnap.docs.map((d) => {
      const farmer = { id: d.id, ...d.data() } as User;
      const items = allCommodities.filter((c) => c.farmer_id === farmer.id);
      return { ...farmer, items };
    });
  } catch (err) {
    console.error('[commodities] getCommoditiesByFarmer error:', err);
    return [];
  }
}

export async function addCommodity(
  data: Omit<Commodity, 'id' | 'created_at' | 'is_available'>,
): Promise<{ success: boolean; commodity?: Commodity }> {
  try {
    const now = new Date().toISOString();
    const payload = {
      ...data,
      is_available: true,
      created_at: now,
    };
    const ref = await addDoc(collection(db, COLLECTION), payload);
    const commodity: Commodity = { id: ref.id, ...payload };
    return { success: true, commodity };
  } catch (err) {
    console.error('[commodities] addCommodity error:', err);
    return { success: false };
  }
}

export async function updateCommodity(
  id: string,
  data: Partial<Commodity>,
): Promise<boolean> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('[commodities] updateCommodity error:', err);
    return false;
  }
}

export async function deleteCommodity(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    return true;
  } catch (err) {
    console.error('[commodities] deleteCommodity error:', err);
    return false;
  }
}

export function listenCommodities(
  farmerId: string | null,
  callback: (data: Commodity[]) => void,
): () => void {
  const ref = collection(db, COLLECTION);
  const q = farmerId
    ? query(ref, where('farmer_id', '==', farmerId), orderBy('created_at', 'desc'))
    : query(ref, orderBy('created_at', 'desc'));

  const unsubscribe = onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Commodity));
    callback(data);
  }, (err) => {
    // Error handler for index/permission/other Firebase errors
    console.error('[commodities] listenCommodities error:', err);
    // Return empty array to trigger fallback in hook
    callback([]);
  });

  return unsubscribe;
}
