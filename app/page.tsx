




"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useAuthContext } from "@/lib/context/AuthContext";
import { getDashboardUrl } from "@/lib/utils/routing";
import { seedDemoDataIfEmpty } from "@/lib/firebase/users";

const features = [
  {
    emoji: "🌾",
    title: "Jual Langsung ke Industri",
    desc: "Tidak ada perantara. Petani menjual langsung ke pabrik, restoran, dan distributor dengan harga lebih adil.",
  },
  {
    emoji: "💰",
    title: "Harga Transparan",
    desc: "Setiap transaksi tercatat di platform. Petani tahu persis berapa yang akan diterima, pembeli tahu harga aslinya.",
  },
  {
    emoji: "📦",
    title: "Manajemen Pesanan",
    desc: "Dari pemesanan hingga pengiriman, semua terpantau real-time. Pre-order untuk komoditas musiman pun tersedia.",
  },
  {
    emoji: "🤝",
    title: "Verifikasi Terpercaya",
    desc: "Setiap petani dan pembeli diverifikasi admin sebelum bisa bertransaksi. Transaksi aman dan terpercaya.",
  },
];

const stats = [
  { value: "2.500+", label: "Petani Terdaftar" },
  { value: "850+", label: "Pembeli Aktif" },
  { value: "Rp 12M+", label: "Nilai Transaksi" },
  { value: "47", label: "Kabupaten/Kota" },
];

const testimonials = [
  {
    name: "Pak Budi Santoso",
    role: "Petani Cabai, Malang",
    text: "Sejak pakai TaniPro, penghasilan saya naik 40%. Tidak perlu lagi jual ke tengkulak dengan harga murah.",
    emoji: "👨‍🌾",
  },
  {
    name: "PT Jaya Foods Indonesia",
    role: "Perusahaan Pengolahan Pangan",
    text: "Kami bisa mendapatkan bahan baku segar langsung dari petani dengan kualitas terjamin dan harga konsisten.",
    emoji: "🏭",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuthContext();
  const seeded = useRef(false);

  useEffect(() => {
    // Seed demo data ke Firestore jika belum ada (hanya sekali)
    if (!seeded.current) {
      seeded.current = true;
      seedDemoDataIfEmpty().catch(console.error);
    }
  }, []);

  // Jika user sudah login, redirect ke dashboard
  useEffect(() => {
    if (!loading && user) {
      window.location.href = getDashboardUrl(user.role);
    }
  }, [loading, user]);

  return (
    <div className="min-h-screen gradient-hero">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 glass border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-xl shadow-md"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              🌱
            </div>
            <span
              className="text-2xl font-bold"
              style={{ color: "var(--tanipro-forest)" }}
            >
              TaniPro
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-[var(--tanipro-warm-gray)]"
              style={{ color: "var(--tanipro-forest)" }}
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, var(--tanipro-forest), var(--tanipro-moss))",
                boxShadow: "var(--shadow-md)",
              }}
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="animate-fade-in">
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
            style={{
              background: "rgba(56, 206, 25, 0.08)",
              color: "var(--tanipro-forest)",
              border: "1px solid rgba(56, 206, 25, 0.15)",
            }}
          >
            🚀 Platform Agritech #1 untuk Petani Indonesia
          </span>

          <h1
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
            style={{ color: "var(--tanipro-forest)" }}
          >
            Pasar Langsung,{" "}
            <span className="text-gradient">Harga Lebih Baik</span>
          </h1>

          <p
            className="text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: "var(--tanipro-mid-gray)" }}
          >
            TaniPro menghubungkan petani lokal langsung dengan pembeli industri
            — tanpa perantara, harga transparan, logistik teroptimasi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, var(--tanipro-forest), var(--tanipro-moss))",
                boxShadow: "0 8px 32px rgba(20, 107, 58, 0.25)",
              }}
            >
              🌱 Mulai Sekarang — Gratis
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 hover:bg-[var(--tanipro-warm-gray)]"
              style={{
                color: "var(--tanipro-forest)",
                border: "2px solid var(--tanipro-moss)",
              }}
            >
              Sudah punya akun? Masuk
            </Link>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div
          className="mt-10 inline-block px-6 py-3 rounded-2xl text-sm animate-slide-up delay-300"
          style={{
            background: "rgba(255, 214, 0, 0.10)",
            border: "1px solid rgba(255, 214, 0, 0.25)",
            color: "var(--tanipro-ocean)",
          }}
        >
          💡 <strong>Demo:</strong> Login sebagai Admin, Petani, atau Pembeli untuk menjelajahi fitur
        </div>
      </section>

      {/* ── Stats ── */}
      <section
        className="py-16"
        style={{ background: "linear-gradient(135deg, var(--tanipro-forest), #00cc94)" }}
      >
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center animate-scale-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm" style={{ color: "var(--tanipro-mint)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: "var(--tanipro-forest)" }}
          >
            Kenapa Pilih TaniPro?
          </h2>
          <p className="text-lg" style={{ color: "var(--tanipro-mid-gray)" }}>
            Solusi lengkap untuk rantai pasok pertanian yang lebih efisien
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl transition-all duration-300 hover:scale-[1.02] animate-fade-in"
              style={{
                background: "var(--surface)",
                boxShadow: "var(--shadow-md)",
                border: "1px solid var(--border)",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
                style={{
                  background: "rgba(56, 206, 25, 0.08)",
                  border: "1px solid rgba(56, 206, 25, 0.12)",
                }}
              >
                {f.emoji}
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: "var(--tanipro-forest)" }}
              >
                {f.title}
              </h3>
              <p style={{ color: "var(--tanipro-mid-gray)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        className="py-24"
        style={{ background: "var(--tanipro-warm-gray)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: "var(--tanipro-forest)" }}
            >
              Cara Kerja TaniPro
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Daftar & Verifikasi", desc: "Buat akun sebagai Petani atau Pembeli. Tim kami akan memverifikasi identitasmu.", emoji: "📝" },
              { step: "02", title: "Tambah Produk / Cari Komoditas", desc: "Petani listing komoditas. Pembeli mencari dan memesan langsung dari petani pilihan.", emoji: "🔍" },
              { step: "03", title: "Transaksi & Pengiriman", desc: "Pesanan dikonfirmasi, pembayaran diproses, pengiriman dipantau hingga selesai.", emoji: "🚚" },
            ].map((step, i) => (
              <div key={i} className="text-center animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 text-white"
                  style={{ background: "var(--tanipro-moss)" }}
                >
                  {step.step}
                </div>
                <div className="text-4xl mb-4">{step.emoji}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--tanipro-forest)" }}>
                  {step.title}
                </h3>
                <p style={{ color: "var(--tanipro-mid-gray)" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ color: "var(--tanipro-forest)" }}>
            Kata Mereka
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl animate-fade-in"
              style={{
                background: "var(--surface)",
                boxShadow: "var(--shadow-md)",
                border: "1px solid var(--border)",
                animationDelay: `${i * 0.15}s`,
              }}
            >
              <p className="text-lg italic mb-6" style={{ color: "var(--tanipro-dark-gray)" }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: "rgba(56, 206, 25, 0.08)" }}
                >
                  {t.emoji}
                </div>
                <div>
                  <div className="font-bold" style={{ color: "var(--tanipro-forest)" }}>{t.name}</div>
                  <div className="text-sm" style={{ color: "var(--tanipro-mid-gray)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Bottom ── */}
      <section className="py-24" style={{ background: "linear-gradient(135deg, var(--tanipro-forest) 0%, #00cc94 100%)" }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Siap Bergabung dengan TaniPro?
          </h2>
          <p className="text-xl mb-10" style={{ color: "var(--tanipro-mint)" }}>
            Daftarkan diri sekarang dan mulai bertransaksi lebih cerdas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 rounded-full text-lg font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{
                background: "var(--tanipro-harvest)",
                boxShadow: "0 8px 24px rgba(255, 214, 0, 0.35)",
              }}
            >
              Daftar sebagai Petani 👨‍🌾
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200"
              style={{
                border: "2px solid var(--tanipro-mint)",
                color: "var(--tanipro-mint)",
              }}
            >
              Daftar sebagai Pembeli 🏭
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-10 border-t"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-base">
              🌱
            </div>
            <span className="font-bold" style={{ color: "var(--tanipro-forest)" }}>
              TaniPro
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--tanipro-mid-gray)" }}>
            © 2024 TaniPro. Platform Pertanian Farm-to-Business Indonesia.
          </p>
          <div className="flex gap-6 text-sm" style={{ color: "var(--tanipro-mid-gray)" }}>
            <Link href="/login" className="hover:text-[var(--tanipro-moss)] transition-colors">Masuk</Link>
            <Link href="/register" className="hover:text-[var(--tanipro-moss)] transition-colors">Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
