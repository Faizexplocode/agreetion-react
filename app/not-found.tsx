import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Halaman Tidak Ditemukan — TaniPro",
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--background)" }}
    >
      <div className="text-center animate-fade-in max-w-md">
        <div className="text-8xl mb-6">🌿</div>
        <h1 className="text-6xl font-bold mb-4" style={{ color: "var(--tanipro-forest)" }}>
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--tanipro-charcoal)" }}>
          Halaman Tidak Ditemukan
        </h2>
        <p className="mb-8" style={{ color: "var(--tanipro-mid-gray)" }}>
          Sepertinya halaman yang Anda cari telah dipindahkan atau tidak ada.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--tanipro-forest), var(--tanipro-moss))" }}
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-full font-semibold transition-colors hover:bg-[var(--tanipro-warm-gray)]"
            style={{ color: "var(--tanipro-forest)", border: "2px solid var(--tanipro-moss)" }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
