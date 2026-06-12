import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ActivityLog, UserRole } from '@/types';

const COLLECTION = 'activity';

export async function getActivity(filter?: {
  user_id?: string;
  role?: UserRole;
  action?: string;
}): Promise<ActivityLog[]> {
  try {
    const ref = collection(db, COLLECTION);
    const snap = await getDocs(query(ref, orderBy('created_at', 'desc')));
    let logs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog));

    if (filter?.user_id) {
      logs = logs.filter((l) => l.user_id === filter.user_id);
    }
    if (filter?.role) {
      logs = logs.filter((l) => l.role === filter.role);
    }
    if (filter?.action) {
      logs = logs.filter((l) => l.action === filter.action);
    }

    return logs;
  } catch (err) {
    console.error('[activity] getActivity error:', err);
    return [];
  }
}

export async function addActivity(
  userId: string,
  userName: string,
  role: UserRole,
  action: string,
  detail: string,
): Promise<void> {
  try {
    await addDoc(collection(db, COLLECTION), {
      user_id: userId,
      user_name: userName,
      role,
      action,
      detail,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[activity] addActivity error:', err);
  }
}

export async function getUserActivity(userId: string): Promise<ActivityLog[]> {
  try {
    const ref = collection(db, COLLECTION);
    const q = query(ref, where('user_id', '==', userId), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog));
  } catch (err) {
    console.error('[activity] getUserActivity error:', err);
    return [];
  }
}
