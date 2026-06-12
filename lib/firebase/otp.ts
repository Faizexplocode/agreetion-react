import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { OtpRecord } from '@/types';

const COLLECTION = 'otps';
const OTP_TTL_MINUTES = 10;

function randomDigits(length: number): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

export async function generateOTP(email: string): Promise<string> {
  const code = randomDigits(6);
  const expires = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

  // Use email as doc ID so each email has only one active OTP
  const ref = doc(db, COLLECTION, email);
  await setDoc(ref, {
    email,
    code,
    expires,
    used: false,
  } satisfies OtpRecord);

  return code;
}

export async function verifyOTP(
  email: string,
  code: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const ref = doc(db, COLLECTION, email);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return { success: false, message: 'Kode OTP tidak ditemukan.' };
    }

    const record = snap.data() as OtpRecord;

    if (record.used) {
      return { success: false, message: 'Kode OTP sudah digunakan.' };
    }

    if (new Date() > new Date(record.expires)) {
      return { success: false, message: 'Kode OTP sudah kadaluarsa.' };
    }

    if (record.code !== code) {
      return { success: false, message: 'Kode OTP tidak valid.' };
    }

    // Mark as used
    await updateDoc(ref, { used: true });

    return { success: true };
  } catch (err) {
    console.error('[otp] verifyOTP error:', err);
    return { success: false, message: 'Terjadi kesalahan. Coba lagi.' };
  }
}

export async function sendOTPEmail(
  email: string,
  name: string,
  code: string,
): Promise<void> {
  // Always log the code for debugging / local dev
  console.log(`[TaniPro OTP] ${name} <${email}> — kode: ${code}`);

  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn(
      '[TaniPro OTP] EmailJS belum dikonfigurasi. ' +
        'Set NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, ' +
        'dan NEXT_PUBLIC_EMAILJS_PUBLIC_KEY di .env.local',
    );
    return;
  }

  try {
    // Dynamic import to avoid SSR issues
    const emailjs = await import('@emailjs/browser');
    await emailjs.send(
      serviceId,
      templateId,
      { to_email: email, to_name: name, otp_code: code },
      publicKey,
    );
  } catch (err) {
    console.error('[otp] sendOTPEmail error:', err);
    throw new Error('Gagal mengirim email OTP. Coba lagi.');
  }
}
