"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useCommodities } from "@/lib/hooks/useCommodities";
import { getOrders } from "@/lib/firebase/orders";
import { getUserActivity } from "@/lib/firebase/activity";
import { getFinanceSummary } from "@/lib/firebase/finance";
import { formatRp } from "@/lib/utils/formatters";
import {
  PROTOTYPE_COMMODITIES,
  PROTOTYPE_ORDERS,
  PROTOTYPE_ACTIVITIES,
  generatePrototypeFinanceSummary,
} from "@/lib/utils/prototypeData";
import type { ActivityLog, Commodity, FinanceSummary, Order } from "@/types";

function Icon({ name }: { name: "leaf" | "box" | "wallet" | "truck" | "spark" | "arrow" }) {
  const paths = {
    leaf: <path d="M5 19c9 0 14-6 14-16C9 3 4 8 4 14c0 2 1 4 3 5Zm0 0c3-5 6-8 11-10" />,
    box: <path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10" />,
    wallet: <path d="M4 7h16v12H4a2 2 0 0 1-2-2V5a2 2 0 0 0 2 2Zm14 5h4v4h-4a2 2 0 0 1 0-4Z" />,
    truck: <path d="M3 6h11v10H3V6Zm11 4h4l3 3v3h-7v-6ZM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
    spark: <path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Zm6 13 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  };

  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function MetricCard({
  title,
  value,
  caption,
  icon,
  tone,
}: {
  title: string;
  value: string;
  caption: string;
  icon: "leaf" | "box" | "wallet" | "truck";
  tone: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-white/70 bg-white/88 p-4 shadow-sm shadow-emerald-950/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10 dark:border-white/10 dark:bg-white/[0.06]">
      <div className={`absolute inset-x-0 top-0 h-1 ${tone}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white transition-transform duration-300 group-hover:scale-105 dark:bg-white dark:text-slate-950">
          <Icon name={icon} />
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">{caption}</p>
    </div>
  );
}

function CommodityPreview({ commodity }: { commodity: Commodity }) {
  return (
    <div className="group rounded-lg border border-slate-200/80 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/10 dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-emerald-400/40">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-50 text-sm font-black text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
          {commodity.emoji?.slice(0, 2) || commodity.name.charAt(0)}
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {commodity.is_preorder ? "Pre-order" : "Ready"}
        </span>
      </div>
      <h3 className="mt-4 line-clamp-1 text-base font-black text-slate-950 dark:text-white">
        {commodity.name}
      </h3>
      <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-500 dark:text-slate-400">
        {commodity.description ?? `${commodity.category} siap untuk pembeli bisnis.`}
      </p>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/10">
        <div>
          <p className="text-xs font-semibold text-slate-400">Harga</p>
          <p className="text-sm font-black text-emerald-800 dark:text-emerald-200">
            {formatRp(commodity.price)}
            <span className="font-semibold text-slate-400"> / {commodity.unit}</span>
          </p>
        </div>
        <p className="text-right text-xs font-bold text-slate-500 dark:text-slate-400">
          {commodity.stock} {commodity.unit}
        </p>
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-200/70 bg-amber-50/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-950/10 dark:border-amber-300/20 dark:bg-amber-300/10 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-black text-slate-950 dark:text-white">
          {order.order_code} - {order.commodity_name}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
          {order.quantity} {order.unit} senilai {formatRp(order.total_price)}
        </p>
      </div>
      <Link
        href="/dashboard/farmer/orders"
        className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-800 dark:bg-white dark:text-slate-950"
      >
        Konfirmasi
      </Link>
    </div>
  );
}

export default function FarmerDashboard() {
  const { user } = useAuthContext();
  const { commodities, loading: commoditiesLoading } = useCommodities(user?.id);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getOrders({ farmer_id: user.id }),
      getUserActivity(user.id),
      getFinanceSummary(user.id, "farmer"),
    ]).then(([orderData, activityData, financeData]) => {
      // Use real data if available, fallback to prototype
      setOrders(orderData && orderData.length > 0 ? orderData : PROTOTYPE_ORDERS);
      setActivities(
        activityData && activityData.length > 0
          ? activityData.slice(0, 10)
          : PROTOTYPE_ACTIVITIES
      );
      setFinance(
        financeData && financeData.allOrders.length > 0
          ? financeData
          : generatePrototypeFinanceSummary()
      );
      setLoading(false);
    });
  }, [user]);

  const pendingOrders = orders.filter((order) => order.status === "pending");
  const activeOrders = orders.filter((order) =>
    ["confirmed", "processing", "shipped"].includes(order.status),
  );
  const displayCommodities =
    commodities.length > 0 ? commodities : PROTOTYPE_COMMODITIES;
  const displayActivities = useMemo(
    () =>
      activities.length > 0
        ? activities.slice(0, 4).map((activity) => activity.detail)
        : PROTOTYPE_ACTIVITIES.slice(0, 4).map((activity) => activity.detail),
    [activities],
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="relative overflow-hidden rounded-lg bg-slate-950 p-5 text-white shadow-2xl shadow-emerald-950/20 sm:p-7 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(45,190,169,0.32),transparent_28%),radial-gradient(circle_at_15%_90%,rgba(239,205,36,0.20),transparent_24%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">
              Dashboard Petani
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
              Selamat datang, {user?.full_name?.split(" ")[0] ?? "Mitra"}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Pantau komoditas, pesanan aktif, dan proyeksi pendapatan dari satu ruang kerja yang siap dipakai harian.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/farmer/commodities"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-black text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-100"
              >
                Kelola Komoditas <Icon name="arrow" />
              </Link>
              <Link
                href="/dashboard/farmer/orders"
                className="inline-flex items-center rounded-lg border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
              >
                Lihat Pesanan
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-200">Prioritas hari ini</p>
              <span className="rounded-full bg-emerald-300/20 px-2.5 py-1 text-xs font-bold text-emerald-100">
                Live
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {displayActivities.slice(0, 3).map((item) => (
                <div key={item} className="flex gap-3 rounded-lg bg-white/8 p-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                  <p className="text-sm font-medium text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Komoditas" value={String(commodities.length || displayCommodities.length)} caption="produk aktif dalam etalase" icon="leaf" tone="bg-emerald-600" />
        <MetricCard title="Pesanan Baru" value={String(pendingOrders.length)} caption="menunggu konfirmasi" icon="box" tone="bg-amber-500" />
        <MetricCard title="Pesanan Aktif" value={String(activeOrders.length)} caption="sedang diproses" icon="truck" tone="bg-teal-500" />
        <MetricCard title="Pendapatan" value={finance ? formatRp(finance.totalRevenue) : loading ? "..." : formatRp(0)} caption="dari pesanan selesai" icon="wallet" tone="bg-slate-900" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                Etalase Petani
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white">
                Komoditas unggulan
              </h2>
            </div>
            <Link href="/dashboard/farmer/commodities" className="text-sm font-black text-emerald-800 transition-colors hover:text-slate-950 dark:text-emerald-200 dark:hover:text-white">
              Lihat semua
            </Link>
          </div>
          {commoditiesLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-56 animate-pulse rounded-lg bg-white/80 dark:bg-white/10" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {displayCommodities.slice(0, 3).map((commodity) => (
                <CommodityPreview key={commodity.id} commodity={commodity} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white/88 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
              <Icon name="spark" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-950 dark:text-white">Sinyal Operasional</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Ringkasan untuk keputusan cepat</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-white/5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Rasio aktif</p>
              <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                {orders.length ? Math.round((activeOrders.length / orders.length) * 100) : 0}%
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-400/10">
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                Fokuskan stok pada komoditas dengan permintaan berulang dan harga stabil.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
            Pesanan menunggu konfirmasi
          </h2>
          <Link href="/dashboard/farmer/orders" className="text-sm font-black text-emerald-800 hover:text-slate-950 dark:text-emerald-200 dark:hover:text-white">
            Buka pesanan
          </Link>
        </div>
        <div className="space-y-3">
          {pendingOrders.length > 0 ? (
            pendingOrders.slice(0, 4).map((order) => <OrderRow key={order.id} order={order} />)
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-6 text-center dark:border-white/15 dark:bg-white/[0.04]">
              <p className="font-black text-slate-950 dark:text-white">Tidak ada pesanan tertunda.</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Dashboard tetap siap menampilkan prioritas baru begitu pesanan masuk.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
