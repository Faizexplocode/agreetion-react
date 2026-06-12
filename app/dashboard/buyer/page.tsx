"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/lib/context/AuthContext";
import StatsCard from "@/components/features/dashboard/StatsCard";
import ActivityFeed from "@/components/features/dashboard/ActivityFeed";
import CommodityCard from "@/components/features/commodity/CommodityCard";
import { getAvailableCommodities } from "@/lib/firebase/commodities";
import { getOrders } from "@/lib/firebase/orders";
import { getUserActivity } from "@/lib/firebase/activity";
import { getFinanceSummary } from "@/lib/firebase/finance";
import { formatRp } from "@/lib/utils/formatters";
import {
  PROTOTYPE_COMMODITIES,
  PROTOTYPE_ORDERS,
  PROTOTYPE_ACTIVITIES,
  generatePrototypeBuyerFinanceSummary,
} from "@/lib/utils/prototypeData";
import type { Commodity, Order, ActivityLog, FinanceSummary } from "@/types";

export default function BuyerDashboard() {
  const { user } = useAuthContext();
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getAvailableCommodities(),
      getOrders({ buyer_id: user.id }),
      getUserActivity(user.id),
      getFinanceSummary(user.id, "buyer"),
    ]).then(([c, o, a, f]) => {
      // Fallback to prototype data if empty
      setCommodities(c && c.length > 0 ? c : PROTOTYPE_COMMODITIES);
      const buyerOrders = o && o.length > 0 ? o : PROTOTYPE_ORDERS.filter((ord) => ord.buyer_id === user.id);
      setOrders(buyerOrders);
      const buyerActivities = a && a.length > 0 ? a : PROTOTYPE_ACTIVITIES;
      setActivities(buyerActivities.slice(0, 10));
      const financeData = f && f.allOrders.length > 0 ? f : generatePrototypeBuyerFinanceSummary();
      setFinance(financeData);
      setLoading(false);
    });
  }, [user]);

  const activeOrders = orders.filter((o) =>
    ["pending", "confirmed", "processing", "shipped"].includes(o.status)
  );
  const completedOrders = orders.filter((o) =>
    ["completed", "delivered"].includes(o.status)
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--tanipro-forest)" }}>
          Selamat Datang, {user?.full_name?.split(" ")[0]} 🏭
        </h1>
        <p style={{ color: "var(--tanipro-mid-gray)" }}>
          Temukan komoditas segar langsung dari petani terpercaya.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Komoditas Tersedia"
          value={String(commodities.length)}
          subtitle="produk dari petani"
          icon="🛒"
        />
        <StatsCard
          title="Pesanan Aktif"
          value={String(activeOrders.length)}
          subtitle="sedang diproses"
          icon="📦"
          accent="harvest"
        />
        <StatsCard
          title="Pesanan Selesai"
          value={String(completedOrders.length)}
          subtitle="transaksi berhasil"
          icon="✅"
          accent="leaf"
        />
        <StatsCard
          title="Total Belanja"
          value={finance ? formatRp(finance.totalRevenue) : "–"}
          subtitle="nilai pembelian"
          icon="💳"
          accent="forest"
        />
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold" style={{ color: "var(--tanipro-forest)" }}>
              Pesanan Aktif 📬
            </h2>
            <a
              href="/dashboard/buyer/orders"
              className="text-sm font-semibold hover:opacity-80 transition-opacity"
              style={{ color: "var(--tanipro-moss)" }}
            >
              Lihat Semua →
            </a>
          </div>
          <div className="space-y-3">
            {activeOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-5 rounded-2xl"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div>
                  <p className="font-semibold" style={{ color: "var(--tanipro-forest)" }}>
                    {order.order_code} — {order.commodity_name}
                  </p>
                  <p className="text-sm" style={{ color: "var(--tanipro-mid-gray)" }}>
                    {order.quantity} {order.unit} · {formatRp(order.total_price)}
                  </p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(74,124,89,0.1)",
                    color: "var(--tanipro-moss)",
                  }}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Commodity Catalog */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ color: "var(--tanipro-forest)" }}>
            Komoditas Tersedia
          </h2>
          <a
            href="/dashboard/buyer/catalog"
            className="text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "var(--tanipro-moss)" }}
          >
            Lihat Katalog Lengkap →
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl animate-pulse"
                style={{ background: "var(--tanipro-warm-gray)" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {commodities.slice(0, 6).map((c) => (
              <CommodityCard key={c.id} commodity={c} mode="buyer" />
            ))}
          </div>
        )}
      </section>

      {/* Activity Feed */}
      <section>
        <h2 className="text-xl font-bold mb-5" style={{ color: "var(--tanipro-forest)" }}>
          Aktivitas Terbaru
        </h2>
        <ActivityFeed activities={activities} loading={loading} />
      </section>
    </div>
  );
}
