import { UserRole } from '@/types';

export function getDashboardUrl(role: UserRole): string {
  const map: Record<UserRole, string> = {
    farmer: '/dashboard/farmer',
    buyer: '/dashboard/buyer',
    admin: '/dashboard/admin',
  };
  return map[role] ?? '/login';
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    farmer: 'Petani',
    buyer: 'Pembeli',
    admin: 'Admin',
  };
  return labels[role] ?? role;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Menunggu',
    active: 'Aktif',
    suspended: 'Ditangguhkan',
    confirmed: 'Dikonfirmasi',
    processing: 'Diproses',
    shipped: 'Dikirim',
    delivered: 'Terkirim',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };
  return labels[status] ?? status;
}
