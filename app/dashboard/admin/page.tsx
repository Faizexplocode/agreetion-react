"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/lib/context/AuthContext";
import StatsCard from "@/components/features/dashboard/StatsCard";
import ActivityFeed from "@/components/features/dashboard/ActivityFeed";
import { getUsers } from "@/lib/firebase/users";
import { getOrders } from "@/lib/firebase/orders";
import { getActivity } from "@/lib/firebase/activity";
import { getFinancialSummary } from "@/lib/firebase/finance";
import { formatRp, timeAgo } from "@/lib/utils/formatters";
import { getRoleLabel } from "@/lib/utils/routing";
import {
  PROTOTYPE_ORDERS,
  PROTOTYPE_ACTIVITIES,
  DEMO_FARMER,
  DEMO_BUYER,
  DEMO_ADMIN,
  generatePrototypeAdminFinanceSummary,
} from "@/lib/utils/prototypeData";
import type { User, Order, ActivityLog, AdminFinancialSummary } from "@/types";

export default function AdminDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user: _currentUser } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [finance, setFinance] = useState<AdminFinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);

  useEffect(() => {
    Promise.all([
      getUsers(),
      getOrders(),
      getActivity(),
      getFinancialSummary(),
    ]).then(([u, o, a, f]) => {
      // Fallback to prototype data if empty
      const userData =
        u && u.length > 0 ? u : [DEMO_FARMER, DEMO_BUYER, DEMO_ADMIN];
      const orderData = o && o.length > 0 ? o : PROTOTYPE_ORDERS;
      const activityData = a && a.length > 0 ? a : PROTOTYPE_ACTIVITIES;
      const financeData =
        f && f.totalOrders > 0 ? f : generatePrototypeAdminFinanceSummary();

      setUsers(userData);
      setOrders(orderData);
      setActivities(activityData.slice(0, 15));
      setFinance(financeData);
      setPendingUsers(userData.filter((usr) => usr.status === "pending"));
      setLoading(false);
    });
  }, []);

  const farmers = users.filter((u) => u.role === "farmer");
  const buyers = users.filter((u) => u.role === "buyer");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--tanipro-forest)" }}>
          Admin Dashboard 🛡️
        </h1>
        <p style={{ color: "var(--tanipro-mid-gray)" }}>
          Pantau seluruh aktivitas platform TaniPro secara real-time.
        </p>
      </div>

      {/* Pending Approval Alert */}
      {pendingUsers.length > 0 && (
        <div
          className="p-5 rounded-2xl flex items-center gap-4"
          style={{
            background: "rgba(232, 168, 56, 0.1)",
            border: "1px solid rgba(232, 168, 56, 0.3)",
          }}
        >
          <span className="text-3xl">⚠️</span>
          <div className="flex-1">
            <p className="font-bold" style={{ color: "var(--tanipro-harvest)" }}>
              {pendingUsers.length} Akun Menunggu Verifikasi
            </p>
            <p className="text-sm" style={{ color: "var(--tanipro-mid-gray)" }}>
              Segera tinjau dan verifikasi akun baru agar pengguna dapat bertransaksi.
            </p>
          </div>
          <a
            href="/dashboard/admin/users"
            className="px-5 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: "var(--tanipro-harvest)" }}
          >
            Tinjau Sekarang
          </a>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Total Pengguna" value={String(users.length)} subtitle="terdaftar di platform" icon="👥" />
        <StatsCard title="Petani Aktif" value={String(farmers.filter(f => f.status === 'active').length)} subtitle={`dari ${farmers.length} petani`} icon="👨‍🌾" accent="leaf" />
        <StatsCard title="Pembeli Aktif" value={String(buyers.filter(b => b.status === 'active').length)} subtitle={`dari ${buyers.length} pembeli`} icon="🏭" accent="harvest" />
        <StatsCard title="Total Transaksi" value={String(orders.length)} subtitle="semua pesanan" icon="📊" accent="forest" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Volume Transaksi" value={finance ? formatRp(finance.totalVolume) : "–"} subtitle="total nilai pesanan" icon="💰" />
        <StatsCard title="Pendapatan Platform" value={finance ? formatRp(finance.totalRevenue) : "–"} subtitle="7% fee + pre-order" icon="📈" accent="leaf" />
        <StatsCard title="Pesanan Selesai" value={String(finance?.completedOrders ?? "–")} subtitle="berhasil" icon="✅" accent="leaf" />
        <StatsCard title="Menunggu Verifikasi" value={String(pendingUsers.length)} subtitle="akun baru" icon="⏳" accent="harvest" />
      </div>

      {/* Pending Users Table */}
      {pendingUsers.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-5" style={{ color: "var(--tanipro-forest)" }}>
            Akun Menunggu Verifikasi
          </h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--tanipro-warm-gray)" }}>
                  {["Nama", "Email", "Peran", "Terdaftar", "Aksi"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-sm font-semibold"
                      style={{ color: "var(--tanipro-forest)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((u, i) => (
                  <tr
                    key={u.id}
                    style={{
                      background: i % 2 === 0 ? "var(--surface)" : "var(--tanipro-warm-gray)",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <td className="px-5 py-4 font-medium" style={{ color: "var(--tanipro-charcoal)" }}>
                      {u.full_name}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "var(--tanipro-mid-gray)" }}>
                      {u.email}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: u.role === "farmer" ? "rgba(74,124,89,0.1)" : "rgba(232,168,56,0.1)",
                          color: u.role === "farmer" ? "var(--tanipro-moss)" : "var(--tanipro-harvest)",
                        }}
                      >
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "var(--tanipro-mid-gray)" }}>
                      {timeAgo(u.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href="/dashboard/admin/users"
                        className="text-sm font-semibold hover:opacity-75 transition-opacity"
                        style={{ color: "var(--tanipro-moss)" }}
                      >
                        Tinjau →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Top Commodities */}
      {finance && finance.topCommodities.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-5" style={{ color: "var(--tanipro-forest)" }}>
            Komoditas Terpopuler
          </h2>
          <div className="space-y-3">
            {finance.topCommodities.slice(0, 5).map((c, i) => (
              <div
                key={c.name}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: "var(--tanipro-moss)" }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 font-medium" style={{ color: "var(--tanipro-charcoal)" }}>
                  {c.name}
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--tanipro-moss)" }}>
                  {c.count} pesanan
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Activity Feed */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ color: "var(--tanipro-forest)" }}>
            Log Aktivitas Platform
          </h2>
          <a
            href="/dashboard/admin/activity"
            className="text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "var(--tanipro-moss)" }}
          >
            Lihat Semua →
          </a>
        </div>
        <ActivityFeed activities={activities} loading={loading} showRole />
      </section>
    </div>
  );
}
