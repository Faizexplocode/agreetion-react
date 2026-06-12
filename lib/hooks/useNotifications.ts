'use client';
import { useEffect, useState } from 'react';
import { listenNotifications, markAllNotifsRead } from '@/lib/firebase/notifications';
import { Notification } from '@/types';

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const unsub = listenNotifications(userId, (data) => {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    });
    return unsub;
  }, [userId]);

  const markAllRead = async () => {
    if (userId) await markAllNotifsRead(userId);
  };

  return { notifications, unreadCount, markAllRead };
}
