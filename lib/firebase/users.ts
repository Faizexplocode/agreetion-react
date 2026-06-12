import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, UserRole, UserStatus } from '@/types';
import { addActivity } from '@/lib/firebase/activity';

const COLLECTION = 'users';

/** Demo accounts that are always treated as active regardless of status */
const DEMO_EMAILS = ['sido@tanipro.id', 'ptjaya@tanipro.id', 'admin@tanipro.id'];
const DEMO_PASSWORDS: Record<string, string> = {
  'admin@tanipro.id': 'Admin@TaniPro2024',
  'sido@tanipro.id': 'Petani@123',
  'ptjaya@tanipro.id': 'Buyer@123',
};

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getUsers(): Promise<User[]> {
  try {
    const snap = await getDocs(query(collection(db, COLLECTION), orderBy('created_at', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
  } catch (err) {
    console.error('[users] getUsers error:', err);
    return [];
  }
}

export async function findByEmail(email: string): Promise<User | null> {
  try {
    const q = query(collection(db, COLLECTION), where('email', '==', email.toLowerCase().trim()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as User;
  } catch (err) {
    console.error('[users] findByEmail error:', err);
    return null;
  }
}

export async function findById(id: string): Promise<User | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as User;
  } catch (err) {
    console.error('[users] findById error:', err);
    return null;
  }
}

export async function getUsersByRole(role: UserRole): Promise<User[]> {
  try {
    const q = query(collection(db, COLLECTION), where('role', '==', role));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
  } catch (err) {
    console.error('[users] getUsersByRole error:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export async function createUser(
  userData: Partial<User> & { email: string; password: string; role: UserRole },
): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const existing = await findByEmail(userData.email);
    if (existing) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }

    const now = new Date().toISOString();
    const { password, email, full_name, role, ...rest } = userData;
    const payload: Omit<User, 'id'> = {
      full_name: full_name ?? '',
      role: role,
      status: 'active',
      setup_complete: false,
      email_verified: true,
      created_at: now,
      ...rest,
      // Ensure sensitive field is always encoded
      password: btoa(password),
      email: email.toLowerCase().trim(),
    };

    const ref = await addDoc(collection(db, COLLECTION), payload);
    const user: User = { id: ref.id, ...payload };
    return { success: true, user };
  } catch (err) {
    console.error('[users] createUser error:', err);
    return { success: false, message: 'Gagal membuat akun. Coba lagi.' };
  }
}

export async function authenticate(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const user = await findByEmail(email);
    if (!user) {
      return { success: false, message: 'Email tidak ditemukan.' };
    }

    const normalizedEmail = user.email.toLowerCase().trim();
    const isDemo = DEMO_EMAILS.includes(normalizedEmail);
    const encodedPassword = btoa(password);
    const matchesCurrentPassword = user.password === encodedPassword;
    const matchesDemoPassword = isDemo && DEMO_PASSWORDS[normalizedEmail] === password;

    // Password check (btoa legacy)
    if (!matchesCurrentPassword && !matchesDemoPassword) {
      return { success: false, message: 'Password salah.' };
    }

    if (matchesDemoPassword && !matchesCurrentPassword) {
      await updateDoc(doc(db, COLLECTION, user.id), {
        password: encodedPassword,
        status: 'active',
        setup_complete: true,
        email_verified: true,
        updated_at: new Date().toISOString(),
      });
      user.password = encodedPassword;
      user.status = 'active';
      user.setup_complete = true;
      user.email_verified = true;
    }

    // Demo accounts bypass all status checks
    if (!isDemo) {
      if (!user.email_verified) {
        return { success: false, message: 'Email belum diverifikasi.' };
      }
      if (user.status === 'pending') {
        return { success: false, message: 'Akun menunggu persetujuan admin.' };
      }
      if (user.status === 'suspended') {
        return { success: false, message: 'Akun Anda ditangguhkan.' };
      }
    }

    await addActivity(user.id, user.full_name, user.role, 'login', `Login dari ${user.email}`);

    return { success: true, user };
  } catch (err) {
    console.error('[users] authenticate error:', err);
    return { success: false, message: 'Terjadi kesalahan. Coba lagi.' };
  }
}

export async function updateUser(userId: string, data: Partial<User>): Promise<boolean> {
  try {
    await updateDoc(doc(db, COLLECTION, userId), {
      ...data,
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('[users] updateUser error:', err);
    return false;
  }
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<boolean> {
  return updateUser(userId, { status });
}

export async function completeSetup(userId: string, data: Partial<User>): Promise<boolean> {
  return updateUser(userId, { ...data, setup_complete: true });
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

export async function seedDemoDataIfEmpty(): Promise<void> {
  try {
    const now = new Date().toISOString();

    const demoUsers: Omit<User, 'id'>[] = [
      {
        full_name: 'Admin TaniPro',
        email: 'admin@tanipro.id',
        phone: '021-5550100',
        password: btoa(DEMO_PASSWORDS['admin@tanipro.id']),
        role: 'admin',
        status: 'active',
        setup_complete: true,
        email_verified: true,
        created_at: now,
      },
      {
        full_name: 'Sido Muncul',
        email: 'sido@tanipro.id',
        phone: '081234567890',
        password: btoa(DEMO_PASSWORDS['sido@tanipro.id']),
        role: 'farmer',
        status: 'active',
        setup_complete: true,
        email_verified: true,
        created_at: now,
        farm_name: 'Kebun Sido Segar',
        city: 'Semarang',
        province: 'Jawa Tengah',
        farm_size: '2 ha',
        exp_years: '10',
        commodities: ['Cabai', 'Tomat', 'Jagung', 'Wortel', 'Bawang Merah'],
        bank_name: 'BCA',
        bank_account: '1234567890',
      },
      {
        full_name: 'PT Jaya Makmur',
        email: 'ptjaya@tanipro.id',
        phone: '031-5550123',
        password: btoa(DEMO_PASSWORDS['ptjaya@tanipro.id']),
        role: 'buyer',
        status: 'active',
        setup_complete: true,
        email_verified: true,
        created_at: now,
        company_name: 'PT Jaya Makmur Nusantara',
        business_type: 'Distributor',
        company_address: 'Jl. Industri No. 7, Surabaya, Jawa Timur',
        npwp: '01.234.567.8-901.000',
        bank_name: 'Mandiri',
        bank_account: '9876543210',
      },
    ];

    await Promise.all(
      demoUsers.map(async (u) => {
        const existing = await findByEmail(u.email);
        if (existing) {
          await updateDoc(doc(db, COLLECTION, existing.id), {
            ...u,
            created_at: existing.created_at ?? u.created_at,
            updated_at: now,
          });
          return;
        }
        await addDoc(collection(db, COLLECTION), u);
      }),
    );
    console.log('[TaniPro] Demo accounts checked successfully.');
  } catch (err) {
    console.error('[users] seedDemoDataIfEmpty error:', err);
  }
}
