'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext, createSession } from '@/lib/context/AuthContext';
import { authenticate } from '@/lib/firebase/users';
import { addActivity } from '@/lib/firebase/activity';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function getDashboardUrl(role: string): string {
  if (role === 'farmer') return '/dashboard/farmer';
  if (role === 'buyer') return '/dashboard/buyer';
  if (role === 'admin') return '/dashboard/admin';
  return '/dashboard';
}

const DEMO_CREDENTIALS = [
  { label: 'Admin', email: 'admin@tanipro.id', password: 'Admin@TaniPro2024', icon: '⚙️' },
  { label: 'Petani', email: 'sido@tanipro.id', password: 'Petani@123', icon: '🌾' },
  { label: 'Pembeli', email: 'ptjaya@tanipro.id', password: 'Buyer@123', icon: '🛒' },
];

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authenticate(email.trim(), password);
      if (!res.success || !res.user) {
        setError(res.message || 'Email atau password salah. Periksa kembali kredensial Anda.');
        return;
      }

      const sessionUser = createSession({
        id: res.user.id,
        full_name: res.user.full_name,
        email: res.user.email,
        role: res.user.role,
        status: res.user.status,
        setup_complete: res.user.setup_complete,
      });

      setUser(sessionUser);

      await addActivity(
        sessionUser.id,
        sessionUser.full_name,
        sessionUser.role,
        'login',
        `${sessionUser.full_name} berhasil masuk ke sistem`
      );

      router.push(getDashboardUrl(sessionUser.role));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred: (typeof DEMO_CREDENTIALS)[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--tanipro-warm-white)] dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--tanipro-moss)] text-white text-3xl mb-4 shadow-lg">
            🌱
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--tanipro-forest)] dark:text-white tracking-tight">
            TaniPro
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Platform Farm-to-Business Indonesia
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Masuk ke Akun
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="text-[var(--tanipro-moss)] hover:underline font-medium"
            >
              Daftar sekarang
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            <Input
              label="Password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-1">
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Demo Login (untuk keperluan demo)
            </p>
            <div className="flex flex-col gap-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.label}
                  type="button"
                  onClick={() => fillDemo(cred)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-[var(--tanipro-moss)]/10 dark:hover:bg-[var(--tanipro-moss)]/20 transition-colors text-left group"
                >
                  <span className="text-base">{cred.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 group-hover:text-[var(--tanipro-forest)] dark:group-hover:text-[var(--tanipro-leaf)]">
                      {cred.label}
                    </p>
                    <p className="text-[10px] text-gray-400">{cred.email}</p>
                  </div>
                  <span className="ml-auto text-[10px] text-[var(--tanipro-moss)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Isi otomatis →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
