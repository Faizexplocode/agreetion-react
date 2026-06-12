'use client';

import React, { useState, useMemo } from 'react';
import type { CartItemWithDimensions, ShippingOption } from '@/types';
import { PROTOTYPE_CART_ITEMS, calculateCartVolume, calculateShippingOptions } from '@/lib/utils/logisticsData';
import FleetRecommendationWidget from '@/components/features/shipping/FleetRecommendationWidget';
import { formatRp } from '@/lib/utils/formatters';
import Link from 'next/link';

export default function BuyerCheckoutDemoPage() {
  const [cartItems, setCartItems] = useState<CartItemWithDimensions[]>(PROTOTYPE_CART_ITEMS);
  const [distance, setDistance] = useState<number>(35); // default distance Cipanas to Jakarta ~35km
  const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchStep, setDispatchStep] = useState<number>(0);
  const [dispatchStatus, setDispatchStatus] = useState<string>('');
  const [showInvoice, setShowInvoice] = useState<boolean>(false);

  // Calculate Subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.pricePerUnit * item.quantity, 0);
  }, [cartItems]);

  // Calculate total volume/weight
  const cartVolume = useMemo(() => {
    return calculateCartVolume(cartItems);
  }, [cartItems]);

  // Adjust item quantity
  const handleQuantityChange = (id: string, val: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, val);
          return {
            ...item,
            quantity: newQty,
            totalPrice: item.pricePerUnit * newQty,
          };
        }
        return item;
      })
    );
    // Reset selected option so they re-choose or it recalculates
    setSelectedOption(null);
  };

  // Dispatch Simulator
  const handleCheckout = () => {
    if (!selectedOption) return;
    setIsDispatching(true);
    setDispatchStep(1);
    setDispatchStatus('Menganalisis kecocokan pesanan dengan mitra pengemudi terdekat...');

    setTimeout(() => {
      setDispatchStep(2);
      setDispatchStatus(`VMS Auto-Dispatcher: Mencocokkan armada ${selectedOption.vehicleName}...`);
    }, 1500);

    setTimeout(() => {
      setDispatchStep(3);
      setDispatchStatus('Rute optimal berhasil dikunci! Driver telah menerima notifikasi GPS navigasi.');
    }, 3000);

    setTimeout(() => {
      setIsDispatching(false);
      setShowInvoice(true);
    }, 4500);
  };

  const shippingCost = selectedOption ? selectedOption.estimatedTotalCost : 0;
  const totalCost = subtotal + shippingCost;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--tanipro-forest)' }}>
              Checkout & Smart Logistics 📦
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--tanipro-mid-gray)' }}>
              Simulasi Checkout B2B dengan Rekomendasi Armada & VMS Routing.
            </p>
          </div>
          <Link
            href="/dashboard/buyer"
            className="px-4 py-2 border rounded-full text-xs font-semibold text-gray-500 hover:bg-gray-50 bg-white"
          >
            Kembali ke Dashboard
          </Link>
        </div>

        {showInvoice ? (
          /* Invoice & VMS GPS Tracker Success View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            {/* Left Column: Invoice summary */}
            <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm text-center space-y-5">
              <div className="w-14 h-14 bg-emerald-100 text-[var(--tanipro-moss)] rounded-full flex items-center justify-center text-2xl mx-auto">
                🎉
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Pesanan Dibuat!</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Pembayaran berhasil dikonfirmasi.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 text-left text-xs space-y-2.5">
                <div className="flex justify-between border-b pb-2 border-gray-200">
                  <span className="text-gray-500">Kode Pesanan</span>
                  <span className="font-mono font-bold">ORD-VMS-99812</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-gray-200">
                  <span className="text-gray-500">Armada Terpilih</span>
                  <span className="font-bold">{selectedOption?.vehicleName}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-gray-200">
                  <span className="text-gray-500">Kapasitas Muatan</span>
                  <span className="text-gray-700">
                    W: {selectedOption?.weightUtilization}% | V: {selectedOption?.volumeUtilization}%
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2 border-gray-200">
                  <span className="text-gray-500">Biaya Kirim</span>
                  <span className="font-bold">{formatRp(shippingCost)}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-black text-[var(--tanipro-forest)]">{formatRp(totalCost)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowInvoice(false);
                    setSelectedOption(null);
                    setCartItems(PROTOTYPE_CART_ITEMS);
                  }}
                  className="w-full py-2.5 rounded-full text-xs font-semibold border text-gray-600 hover:bg-gray-50"
                >
                  Simulasi Ulang Checkout
                </button>
                <Link
                  href="/dashboard/buyer/orders"
                  className="w-full py-2.5 rounded-full text-xs font-semibold text-white text-center"
                  style={{ background: 'var(--tanipro-moss)' }}
                >
                  Lihat Pesanan Saya
                </Link>
              </div>
            </div>

            {/* Right Column: VMS Live Tracking Console */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-bold text-gray-900">Pelacakan Logistik VMS (Real-Time)</h3>
                  <p className="text-xs text-[var(--tanipro-mid-gray)]">Truk Anda sedang dalam perjalanan & rute teroptimasi GPS.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                  🛰️ GPS VMS Aktif
                </span>
              </div>

              {/* Simulated Map */}
              <div className="h-52 bg-emerald-50 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,black_1px,transparent_1px)] bg-[size:10px_10px]" />
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
                  {/* Truck animation on path */}
                  <g className="animate-[move_6s_ease-in-out_infinite]">
                    <rect x="-8" y="-4" width="16" height="8" rx="2" fill="var(--tanipro-forest)" />
                    <circle cx="4" cy="4" r="2" fill="black" />
                    <circle cx="-4" cy="4" r="2" fill="black" />
                  </g>
                </svg>
                <span className="absolute bottom-2 left-2 text-[8px] bg-white px-2 py-0.5 rounded shadow border text-gray-500">
                  📍 Asal: Gapoktan Cianjur
                </span>
                <span className="absolute top-2 right-2 text-[8px] bg-white px-2 py-0.5 rounded shadow border text-gray-500">
                  🏢 Tujuan: Gudang B2B Anda
                </span>
              </div>

              {/* GPS Tracker Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2.5">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-gray-400">Driver</span>
                    <span className="font-semibold text-gray-800">Budi Santoso (Mitra 3PL)</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-gray-400">Kontak Driver</span>
                    <span className="font-mono text-gray-800">+62 812-9981-0021</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Jalur Terpilih (VRPTW)</span>
                    <span className="font-semibold text-gray-800">Tol Jagorawi (Bebas Macet)</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-gray-400">Estimasi ETA</span>
                    <span className="font-bold text-[var(--tanipro-moss)]">{selectedOption?.estimatedDeliveryTime}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-gray-400">Status Suhu Box</span>
                    <span className={`font-semibold ${selectedOption?.vehicleName.includes('CDD') ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                      {selectedOption?.vehicleName.includes('CDD') ? '🧊 Dingin Terjaga (4°C)' : '🌡️ Suhu Ruang (27°C)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Efisiensi Rute</span>
                    <span className="font-bold text-emerald-600">Mengurangi Carbon Footprint ~22%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Checkout View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column: Cart & Distance Adjuster */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Keranjang Belanja B2B 🛒</h2>
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{item.commodityName}</h4>
                        <p className="text-xs text-[var(--tanipro-mid-gray)] mt-0.5">
                          {formatRp(item.pricePerUnit)} / {item.unit} · Dimensi Box: 25x20x15cm
                        </p>
                        {item.isPerishable && (
                          <span className="mt-1 inline-block px-2 py-0.5 rounded bg-emerald-50 text-[10px] font-bold text-[var(--tanipro-moss)]">
                            🥬 Komoditas Segar
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 10)}
                          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-14 text-center font-bold text-sm text-gray-900">
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 10)}
                          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Distance */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-gray-700">Jarak ke Lokasi Buyer (Km)</span>
                    <span className="text-[var(--tanipro-moss)] font-bold">{distance} Km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    value={distance}
                    onChange={(e) => {
                      setDistance(Number(e.target.value));
                      setSelectedOption(null);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--tanipro-moss)]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>5 Km (Lokal/Cianjur)</span>
                    <span>75 Km (Regional)</span>
                    <span>150 Km (Luar Provinsi)</span>
                  </div>
                </div>
              </div>

              {/* Load Specification Overview */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-md font-bold text-gray-900 mb-4">Dimensi Kubikasi & Tonase Keranjang 📦</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-2xl border">
                    <span className="text-xs text-gray-400 block">Total Kuantitas</span>
                    <span className="text-lg font-black text-gray-800">{cartVolume.totalItems} kg</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl border">
                    <span className="text-xs text-gray-400 block">Total Volume</span>
                    <span className="text-lg font-black text-gray-800">
                      {(cartVolume.totalVolume / 1000000).toFixed(2)} m³
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl border">
                    <span className="text-xs text-gray-400 block">Total Berat</span>
                    <span className="text-lg font-black text-gray-800">{cartVolume.totalWeight} Kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Fleet Recommendation Widget & Order Summary */}
            <div className="space-y-6">
              {/* Recommendation Widget */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                <FleetRecommendationWidget
                  items={cartItems}
                  distance={distance}
                  selectedOptionId={selectedOption?.id ?? null}
                  onSelectOption={(opt) => setSelectedOption(opt)}
                />
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
                <h3 className="text-md font-bold text-gray-900">Ringkasan Pembayaran</h3>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal Produk</span>
                    <span className="font-semibold text-gray-800">{formatRp(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Biaya Pengiriman</span>
                    <span className="font-semibold text-gray-800">
                      {selectedOption ? formatRp(shippingCost) : 'Pilih armada'}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Armada Terpilih</span>
                    <span className="font-bold text-gray-800">
                      {selectedOption ? selectedOption.vehicleName : '-'}
                    </span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="flex justify-between text-base">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-black text-[var(--tanipro-forest)]">{formatRp(totalCost)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!selectedOption}
                  onClick={handleCheckout}
                  className={`w-full py-3.5 rounded-full text-sm font-semibold text-white transition-opacity ${
                    selectedOption
                      ? 'bg-[var(--tanipro-moss)] hover:opacity-90 cursor-pointer'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {selectedOption ? 'Buat Pesanan & Dispatch Armada' : 'Pilih Armada untuk Lanjut'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dispatch Simulator Loading Modal */}
        {isDispatching && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-scale-up">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-[var(--tanipro-moss)] border-t-transparent animate-spin"></div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">Sistem Dispatch Logistik Pintar</h3>
                <p className="text-xs text-slate-400 mt-0.5">Mencocokkan rute & armada optimal</p>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 text-xs font-semibold text-[var(--tanipro-moss)] min-h-[4rem] flex items-center justify-center">
                {dispatchStatus}
              </div>

              {/* Stepper indicator */}
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      dispatchStep >= i ? 'w-8 bg-[var(--tanipro-moss)]' : 'w-2 bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
