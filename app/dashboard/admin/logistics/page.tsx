'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatRp } from '@/lib/utils/formatters';

interface DispatchLog {
  id: string;
  orderCode: string;
  buyer: string;
  commodity: string;
  weight: number;
  volume: number;
  vehicle: string;
  fillRate: number;
  status: 'on_the_way' | 'delivered' | 'processing';
  route: string;
  driver: string;
}

const INITIAL_DISPATCHES: DispatchLog[] = [
  {
    id: 'disp-001',
    orderCode: 'ORD-VMS-99812',
    buyer: 'PT Gading Pangan',
    commodity: 'Cabai Merah Premium',
    weight: 420,
    volume: 12.6,
    vehicle: 'CDD (Refrigerated Box) - CDD-012',
    fillRate: 84,
    status: 'on_the_way',
    route: 'Cianjur → Jakarta Pusat via Puncak Pass',
    driver: 'Budi Santoso',
  },
  {
    id: 'disp-002',
    orderCode: 'ORD-VMS-99810',
    buyer: 'Restoran Sari Rasa',
    commodity: 'Tomat Organik',
    weight: 90,
    volume: 2.16,
    vehicle: 'CDE (Box Truck) - CDE-004',
    fillRate: 48,
    status: 'delivered',
    route: 'Cipanas → Bogor Timur via Sukabumi',
    driver: 'Joko Susilo',
  },
  {
    id: 'disp-003',
    orderCode: 'ORD-VMS-99815',
    buyer: 'Supermarket Segar Abadi',
    commodity: 'Beras Premium IR64 & Jagung',
    weight: 1800,
    volume: 18.5,
    vehicle: 'Fuso (Medium Truck) - FUSO-082',
    fillRate: 92,
    status: 'processing',
    route: 'Sukabumi → Tangerang Selatan via Tol Jagorawi',
    driver: 'Arif Hidayat',
  },
  {
    id: 'disp-004',
    orderCode: 'ORD-VMS-99808',
    buyer: 'Katering Sedap Malam',
    commodity: 'Bawang Merah & Wortel',
    weight: 15,
    volume: 0.12,
    vehicle: 'Motorcycle Courier - MC-002',
    fillRate: 60,
    status: 'delivered',
    route: 'Cipanas → Cipanas Kota',
    driver: 'Dedi Kurniawan',
  },
];

export default function AdminLogisticsPage() {
  const [dispatches, setDispatches] = useState<DispatchLog[]>(INITIAL_DISPATCHES);
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchLog | null>(INITIAL_DISPATCHES[0]);

  // Statistics
  const activeCount = dispatches.filter((d) => d.status === 'on_the_way').length;
  const avgFillRate = Math.round(dispatches.reduce((acc, d) => acc + d.fillRate, 0) / dispatches.length);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>
              Logistics Command Center 🛡️
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>
              Pemantauan VMS Route Optimization & Auto Dispatcher TaniPro secara real-time.
            </p>
          </div>
          <Link
            href="/dashboard/admin"
            className="px-4 py-2 border rounded-full text-xs font-semibold text-gray-500 hover:bg-gray-50 bg-white"
          >
            Kembali ke Dashboard
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Total Armada Aktif</span>
            <span className="text-2xl font-black text-gray-900 block mt-2">12 Truk</span>
            <span className="text-xs text-emerald-600 font-semibold block mt-1">100% Siap Beroperasi</span>
          </div>
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Pengiriman Berjalan</span>
            <span className="text-2xl font-black text-gray-900 block mt-2">{activeCount} Rute</span>
            <span className="text-xs text-[var(--tanipro-mid-gray)] block mt-1">Dalam pantauan GPS VMS</span>
          </div>
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Avg. Load Fill Rate</span>
            <span className="text-2xl font-black text-gray-900 block mt-2">{avgFillRate}%</span>
            <span className="text-xs text-emerald-600 font-semibold block mt-1">Target 3D Packing Terpenuhi</span>
          </div>
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Efisiensi Bahan Bakar</span>
            <span className="text-2xl font-black text-emerald-600 block mt-2">24.8%</span>
            <span className="text-xs text-[var(--tanipro-mid-gray)] block mt-1">Berkat optimasi rute VRPTW</span>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispatch Feed (Left & Middle Columns) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border p-6 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-gray-900">Live Delivery Feed</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-xs uppercase text-gray-400">
                    <th className="pb-3 font-semibold">Kode & Buyer</th>
                    <th className="pb-3 font-semibold">Armada</th>
                    <th className="pb-3 font-semibold text-center">Fill Rate</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {dispatches.map((disp) => (
                    <tr
                      key={disp.id}
                      onClick={() => setSelectedDispatch(disp)}
                      className={`cursor-pointer transition-colors ${
                        selectedDispatch?.id === disp.id ? 'bg-[rgba(74,124,89,0.04)] font-semibold' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-4">
                        <div className="font-mono text-xs text-[var(--tanipro-moss)]">{disp.orderCode}</div>
                        <div className="text-gray-900 font-medium">{disp.buyer}</div>
                      </td>
                      <td className="py-4">
                        <div className="text-gray-800">{disp.vehicle.split('-')[0]}</div>
                        <div className="text-[10px] text-gray-400">{disp.route}</div>
                      </td>
                      <td className="py-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-xs font-bold text-gray-700">
                          {disp.fillRate}%
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            disp.status === 'on_the_way'
                              ? 'bg-blue-50 text-blue-700'
                              : disp.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {disp.status === 'on_the_way' ? 'DIJALAN' : disp.status === 'delivered' ? 'TIBA' : 'DIPROSES'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Route Details (Right Column) */}
          <div className="bg-white rounded-3xl border p-6 shadow-sm space-y-5">
            <h3 className="text-md font-bold text-gray-900">Detail Live GPS & VMS</h3>

            {selectedDispatch ? (
              <div className="space-y-4">
                {/* Simulated Visual Map */}
                <div className="h-44 bg-emerald-50 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Styled Grid/Path background */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,black_1px,transparent_1px)] bg-[size:10px_10px]" />
                  {/* Simulated Route Polyline */}
                  <svg className="w-full h-full absolute inset-0 text-[var(--tanipro-moss)]" viewBox="0 0 200 100">
                    <path
                      d="M 30,80 Q 90,20 170,30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="4 2"
                      className="animate-[dash_2s_linear_infinite]"
                    />
                    <circle cx="30" cy="80" r="5" fill="var(--tanipro-harvest)" />
                    <circle cx="170" cy="30" r="5" fill="var(--tanipro-forest)" />
                  </svg>
                  <span className="absolute bottom-2 left-2 text-[8px] bg-white px-2 py-0.5 rounded shadow border text-gray-500">
                    📍 Gapoktan Cianjur
                  </span>
                  <span className="absolute top-2 right-2 text-[8px] bg-white px-2 py-0.5 rounded shadow border text-gray-500">
                    🏢 Buyer Jakarta
                  </span>
                  <span className="text-[10px] bg-[var(--tanipro-moss)] text-white px-3 py-1 rounded-full font-bold shadow-md z-10 animate-bounce">
                    Armada Berjalan 🚛
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-gray-400 block">Status Rute VMS</span>
                    <span className="font-bold text-emerald-600">Teroptimasi (Bebas Hambatan)</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Mitra Pengemudi</span>
                    <span className="font-semibold text-gray-800">{selectedDispatch.driver}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Jalur Optimal</span>
                    <span className="font-semibold text-gray-800">{selectedDispatch.route}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Volume Keterisian Truk</span>
                    <span className="font-bold text-[var(--tanipro-moss)]">
                      {selectedDispatch.fillRate}% Keterisian Ruang
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border space-y-1">
                    <span className="text-gray-500 block font-bold text-[10px] uppercase">Rincian Muatan</span>
                    <p className="text-gray-700">
                      {selectedDispatch.commodity} ({selectedDispatch.weight} Kg &middot; {selectedDispatch.volume} m³)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                Pilih salah satu pengiriman untuk melihat detail live GPS & VMS.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
