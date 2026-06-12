'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/context/AuthContext';
import { completeSetup } from '@/lib/firebase/users';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const PROVINCES = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau',
  'Jambi', 'Sumatera Selatan', 'Kepulauan Bangka Belitung', 'Bengkulu', 'Lampung',
  'DKI Jakarta', 'Banten', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur',
  'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara',
  'Maluku', 'Maluku Utara', 'Papua Barat', 'Papua',
];

const BANKS = ['BCA', 'BRI', 'BNI', 'Mandiri', 'CIMB Niaga', 'BSI', 'Danamon', 'Permata', 'BTN'];

const BUSINESS_TYPES = [
  'Restoran & Katering', 'Supermarket & Ritel', 'Hotel & Hospitality',
  'Pabrik Pengolahan', 'Eksportir', 'Distributor', 'Lainnya',
];

interface FarmerData {
  farm_name: string;
  city: string;
  province: string;
  farm_size: string;
  exp_years: string;
  bank_name: string;
  bank_account: string;
}

interface BuyerData {
  company_name: string;
  business_type: string;
  company_address: string;
  npwp: string;
  bank_name: string;
  bank_account: string;
}

export default function SetupProfileForm() {
  const router = useRouter();
  const { user, setUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [farmerData, setFarmerData] = useState<FarmerData>({
    farm_name: '',
    city: '',
    province: '',
    farm_size: '',
    exp_years: '',
    bank_name: '',
    bank_account: '',
  });

  const [buyerData, setBuyerData] = useState<BuyerData>({
    company_name: '',
    business_type: '',
    company_address: '',
    npwp: '',
    bank_name: '',
    bank_account: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
          <p className="text-lg font-semibold">Mengalihkan ke halaman masuk...</p>
          <p className="text-sm text-gray-500 mt-2">Silakan masuk atau daftar terlebih dahulu.</p>
        </div>
      </div>
    );
  }

  const isFarmer = user.role === 'farmer';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = isFarmer ? farmerData : buyerData;
      await completeSetup(user.id, data);
      setUser({ ...user, setup_complete: true });
      router.push(isFarmer ? '/dashboard/farmer' : '/dashboard/buyer');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan profil. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const labelClass = 'text-sm font-medium text-gray-700 dark:text-gray-200 mb-1';
  const selectClass =
    'w-full h-10 px-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:border-[var(--tanipro-leaf)] focus:ring-2 focus:ring-[var(--tanipro-leaf)]/20 outline-none transition-all';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--tanipro-warm-white)] dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">{isFarmer ? '🌾' : '🏢'}</div>
          <h1 className="text-2xl font-extrabold text-[var(--tanipro-forest)] dark:text-white">
            Lengkapi Profil
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isFarmer
              ? 'Informasi kebun dan rekening Anda'
              : 'Informasi perusahaan dan rekening Anda'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* ---- Farmer Fields ---- */}
            {isFarmer && (
              <>
                <Input
                  label="Nama Kebun / Usaha Tani"
                  placeholder="cth. Kebun Sejahtera Pak Budi"
                  value={farmerData.farm_name}
                  onChange={(e) => setFarmerData((d) => ({ ...d, farm_name: e.target.value }))}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Kota / Kabupaten"
                    placeholder="cth. Malang"
                    value={farmerData.city}
                    onChange={(e) => setFarmerData((d) => ({ ...d, city: e.target.value }))}
                    required
                  />
                  <div>
                    <label className={labelClass}>Provinsi</label>
                    <select
                      value={farmerData.province}
                      onChange={(e) => setFarmerData((d) => ({ ...d, province: e.target.value }))}
                      required
                      className={selectClass}
                    >
                      <option value="">Pilih provinsi</option>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Luas Lahan (hektar)"
                    type="number"
                    placeholder="cth. 2.5"
                    min="0"
                    step="0.1"
                    value={farmerData.farm_size}
                    onChange={(e) => setFarmerData((d) => ({ ...d, farm_size: e.target.value }))}
                    required
                  />
                  <Input
                    label="Pengalaman Bertani (tahun)"
                    type="number"
                    placeholder="cth. 5"
                    min="0"
                    value={farmerData.exp_years}
                    onChange={(e) => setFarmerData((d) => ({ ...d, exp_years: e.target.value }))}
                    required
                  />
                </div>

                <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    💳 Informasi Rekening
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Bank</label>
                      <select
                        value={farmerData.bank_name}
                        onChange={(e) => setFarmerData((d) => ({ ...d, bank_name: e.target.value }))}
                        required
                        className={selectClass}
                      >
                        <option value="">Pilih bank</option>
                        {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <Input
                      label="Nomor Rekening"
                      placeholder="cth. 1234567890"
                      value={farmerData.bank_account}
                      onChange={(e) => setFarmerData((d) => ({ ...d, bank_account: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* ---- Buyer Fields ---- */}
            {!isFarmer && (
              <>
                <Input
                  label="Nama Perusahaan"
                  placeholder="cth. PT Jaya Makmur Sentosa"
                  value={buyerData.company_name}
                  onChange={(e) => setBuyerData((d) => ({ ...d, company_name: e.target.value }))}
                  required
                />

                <div>
                  <label className={labelClass}>Jenis Usaha</label>
                  <select
                    value={buyerData.business_type}
                    onChange={(e) => setBuyerData((d) => ({ ...d, business_type: e.target.value }))}
                    required
                    className={selectClass}
                  >
                    <option value="">Pilih jenis usaha</option>
                    {BUSINESS_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Alamat Perusahaan</label>
                  <textarea
                    value={buyerData.company_address}
                    onChange={(e) => setBuyerData((d) => ({ ...d, company_address: e.target.value }))}
                    required
                    rows={3}
                    placeholder="Jl. Contoh No. 123, Jakarta Selatan..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:border-[var(--tanipro-leaf)] focus:ring-2 focus:ring-[var(--tanipro-leaf)]/20 outline-none transition-all resize-none"
                  />
                </div>

                <Input
                  label="NPWP (opsional)"
                  placeholder="cth. 12.345.678.9-012.000"
                  value={buyerData.npwp}
                  onChange={(e) => setBuyerData((d) => ({ ...d, npwp: e.target.value }))}
                  hint="Untuk kebutuhan faktur pajak"
                />

                <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    💳 Informasi Rekening
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Bank</label>
                      <select
                        value={buyerData.bank_name}
                        onChange={(e) => setBuyerData((d) => ({ ...d, bank_name: e.target.value }))}
                        required
                        className={selectClass}
                      >
                        <option value="">Pilih bank</option>
                        {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <Input
                      label="Nomor Rekening"
                      placeholder="cth. 1234567890"
                      value={buyerData.bank_account}
                      onChange={(e) => setBuyerData((d) => ({ ...d, bank_account: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <p className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              Simpan & Lanjutkan ke Dashboard
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
