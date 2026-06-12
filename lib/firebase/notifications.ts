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
import { Notification, NotifType } from '@/types';

const COLLECTION = 'notifications';

export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const ref = collection(db, COLLECTION);
    const q = query(
      ref,
      where('user_id', '==', userId),
      orderBy('created_at', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
  } catch (err) {
    console.error('[notifications] getNotifications error:', err);
    return [];
  }
}

export async function addNotification(
  userId: string,
  text: string,
  type: NotifType = 'info',
): Promise<void> {
  try {
    await addDoc(collection(db, COLLECTION), {
      user_id: userId,
      text,
      type,
      read: false,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[notifications] addNotification error:', err);
  }
}

export async function markNotifRead(notifId: string): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, notifId);
    await updateDoc(ref, { read: true });
  } catch (err) {
    console.error('[notifications] markNotifRead error:', err);
  }
}

export async function markAllNotifsRead(userId: string): Promise<void> {
  try {
    const ref = collection(db, COLLECTION);
    const q = query(ref, where('user_id', '==', userId), where('read', '==', false));
    const snap = await getDocs(q);
    const updates = snap.docs.map((d) => updateDoc(doc(db, COLLECTION, d.id), { read: true }));
    await Promise.all(updates);
  } catch (err) {
    console.error('[notifications] markAllNotifsRead error:', err);
  }
}

export function listenNotifications(
  userId: string,
  callback: (data: Notification[]) => void,
): () => void {
  const ref = collection(db, COLLECTION);
  const q = query(
    ref,
    where('user_id', '==', userId),
    orderBy('created_at', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
    callback(data);
  });
}
