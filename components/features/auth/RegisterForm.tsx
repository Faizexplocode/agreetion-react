'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthContext, createSession } from '@/lib/context/AuthContext';
import { createUser } from '@/lib/firebase/users';
import { generateOTP, sendOTPEmail, verifyOTP } from '@/lib/firebase/otp';

type Role = 'farmer' | 'buyer';

interface Step1Data {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

const roleOptions: { value: Role; label: string; desc: string; icon: string }[] = [
  { value: 'farmer', label: 'Petani', desc: 'Jual hasil panen ke pembeli bisnis', icon: '🌾' },
  { value: 'buyer', label: 'Pembeli Bisnis', desc: 'Beli komoditas langsung dari petani', icon: '🏢' },
];

export default function RegisterForm() {
  const router = useRouter();
  const { setUser } = useAuthContext();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 state
  const [form, setForm] = useState<Step1Data>({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
  });

  // Step 2 state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    setLoading(true);
    try {
      const generatedOTP = await generateOTP(form.email);
      await sendOTPEmail(form.email, form.name, generatedOTP);
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim OTP. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);

    // Auto-focus next
    if (value && index < 5) {
      const nextEl = document.getElementById(`otp-${index + 1}`);
      nextEl?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevEl = document.getElementById(`otp-${index - 1}`);
      prevEl?.focus();
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const enteredOTP = otpDigits.join('');

    if (enteredOTP.length !== 6) {
      setError('Masukkan 6 digit kode OTP.');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(form.email, enteredOTP);
      if (!result.success) {
        setError(result.message || 'Kode OTP tidak valid atau sudah kadaluarsa.');
        return;
      }

      const created = await createUser({
        email: form.email,
        full_name: form.name,
        password: form.password,
        role: form.role,
      });

      if (!created.success || !created.user) {
        setError(created.message || 'Gagal membuat akun. Coba lagi.');
        return;
      }

      const sessionUser = createSession({
        id: created.user.id,
        full_name: created.user.full_name,
        email: created.user.email,
        role: created.user.role,
        status: created.user.status,
        setup_complete: created.user.setup_complete,
      });

      setUser(sessionUser);
      router.push('/setup-profile');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registrasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--tanipro-warm-white)] dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--tanipro-moss)] text-white text-2xl mb-3 shadow-lg">
            🌱
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--tanipro-forest)] dark:text-white">
            Daftar ke TaniPro
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Platform Farm-to-Business Indonesia
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 px-1">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-1.5">
                <div
                  className={[
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                    step >= s
                      ? 'bg-[var(--tanipro-moss)] text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400',
                  ].join(' ')}
                >
                  {step > s ? '✓' : s}
                </div>
                <span className={`text-xs font-medium ${step >= s ? 'text-[var(--tanipro-forest)] dark:text-[var(--tanipro-leaf)]' : 'text-gray-400'}`}>
                  {s === 1 ? 'Data Akun' : 'Verifikasi OTP'}
                </span>
              </div>
              {s < 2 && (
                <div className={`flex-1 h-0.5 rounded ${step > s ? 'bg-[var(--tanipro-moss)]' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          {/* Step 1 */}
          {step === 1 && (
            <>
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">
                Informasi Akun
              </h2>

              <form onSubmit={handleStep1} className="flex flex-col gap-4">
                {/* Role selection */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Daftar sebagai
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {roleOptions.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                        className={[
                          'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center',
                          form.role === r.value
                            ? 'border-[var(--tanipro-moss)] bg-[var(--tanipro-moss)]/5'
                            : 'border-gray-200 dark:border-gray-700 hover:border-[var(--tanipro-leaf)]',
                        ].join(' ')}
                      >
                        <span className="text-2xl">{r.icon}</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {r.label}
                        </span>
                        <span className="text-[10px] text-gray-400 leading-tight">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Nama Lengkap"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Min. 8 karakter"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />

                <Input
                  label="Konfirmasi Password"
                  type="password"
                  placeholder="Ulangi password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  required
                />

                {error && (
                  <p className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" loading={loading} className="w-full">
                  Lanjutkan
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Sudah punya akun?{' '}
                  <Link href="/login" className="text-[var(--tanipro-moss)] hover:underline font-medium">
                    Masuk
                  </Link>
                </p>
              </form>
            </>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali
              </button>

              <div className="text-center mb-6">
                <div className="text-4xl mb-3">📧</div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Verifikasi Email
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Kode OTP telah dikirim ke{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-200">{form.email}</span>
                </p>
              </div>

              <form onSubmit={handleStep2} className="flex flex-col gap-5">
                <div className="flex gap-2 justify-center">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-10 h-12 text-center text-lg font-bold rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[var(--tanipro-leaf)] focus:ring-2 focus:ring-[var(--tanipro-leaf)]/20 outline-none transition-all"
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" loading={loading} className="w-full">
                  Verifikasi & Daftar
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Tidak menerima kode?{' '}
                  <button
                    type="button"
                    className="text-[var(--tanipro-moss)] hover:underline font-medium"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const newOTP = await generateOTP(form.email);
                        await sendOTPEmail(form.email, form.name, newOTP);
                        setOtpDigits(['', '', '', '', '', '']);
                        setError('');
                      } catch {
                        setError('Gagal mengirim ulang OTP.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    Kirim ulang
                  </button>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
