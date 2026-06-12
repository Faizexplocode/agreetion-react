"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import type { SessionUser } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: "home" | "crop" | "box" | "truck" | "wallet" | "spark" | "cart" | "users" | "chart";
}

const farmerNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/farmer", icon: "home" },
  { label: "Komoditas", href: "/dashboard/farmer/commodities", icon: "crop" },
  { label: "Pesanan", href: "/dashboard/farmer/orders", icon: "box" },
  { label: "Pengiriman", href: "/dashboard/farmer/deliveries", icon: "truck" },
  { label: "Keuangan", href: "/dashboard/farmer/finance", icon: "wallet" },
  { label: "AI Konsultan", href: "/dashboard/farmer/ai", icon: "spark" },
];

const buyerNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/buyer", icon: "home" },
  { label: "Katalog", href: "/dashboard/buyer/catalog", icon: "cart" },
  { label: "Pesanan Saya", href: "/dashboard/buyer/orders", icon: "box" },
  { label: "Simulasi Logistik", href: "/dashboard/buyer/checkout-demo", icon: "truck" },
  { label: "Keuangan", href: "/dashboard/buyer/finance", icon: "wallet" },
  { label: "AI Konsultan", href: "/dashboard/buyer/ai", icon: "spark" },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/admin", icon: "home" },
  { label: "Pengguna", href: "/dashboard/admin/users", icon: "users" },
  { label: "Transaksi", href: "/dashboard/admin/orders", icon: "box" },
  { label: "Komoditas", href: "/dashboard/admin/commodities", icon: "crop" },
  { label: "Logistik VMS", href: "/dashboard/admin/logistics", icon: "truck" },
  { label: "Keuangan", href: "/dashboard/admin/finance", icon: "wallet" },
  { label: "Aktivitas", href: "/dashboard/admin/activity", icon: "chart" },
];

const roleLabel: Record<string, string> = {
  farmer: "Petani",
  buyer: "Pembeli",
  admin: "Admin",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Icon({ name }: { name: NavItem["icon"] }) {
  const paths: Record<NavItem["icon"], React.ReactNode> = {
    home: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3V10.5Z" />,
    crop: <path d="M12 21V8m0 0C8 8 5 5.5 5 2c4 0 7 2.5 7 6Zm0 0c4 0 7-2.5 7-6-4 0-7 2.5-7 6Zm-7 7h14" />,
    box: <path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10" />,
    truck: <path d="M3 6h11v10H3V6Zm11 4h4l3 3v3h-7v-6ZM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
    wallet: <path d="M4 7h16v12H4a2 2 0 0 1-2-2V5a2 2 0 0 0 2 2Zm14 5h4v4h-4a2 2 0 0 1 0-4Z" />,
    spark: <path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Zm6 13 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" />,
    cart: <path d="M4 5h2l2 10h10l2-7H7m3 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />,
    users: <path d="M16 11a4 4 0 1 0-8 0m8 0a4 4 0 1 1 4-4m-4 4c2.8 0 5 1.8 5 4v2H3v-2c0-2.2 2.2-4 5-4" />,
    chart: <path d="M4 19V5m0 14h16M8 16V9m4 7V7m4 9v-4" />,
  };

  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

interface SidebarProps {
  user: SessionUser;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout: () => void;
}

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => {
        const section = `/dashboard/${pathname.split("/")[2]}`;
        const isActive =
          pathname === item.href ||
          (item.href !== section && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={[
              "group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300",
              isActive
                ? "bg-slate-950 text-white shadow-[0_14px_32px_rgba(15,23,42,0.18)] dark:bg-white dark:text-slate-950"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
            ].join(" ")}
          >
            <span
              className={[
                "grid h-8 w-8 place-items-center rounded-lg transition-all duration-300",
                isActive
                  ? "bg-white/14 text-white dark:bg-slate-950/10 dark:text-slate-950"
                  : "bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 dark:bg-white/5 dark:text-slate-400",
              ].join(" ")}
            >
              <Icon name={item.icon} />
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar({ user, isOpen = false, onClose, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const navItems =
    user.role === "farmer" ? farmerNav : user.role === "buyer" ? buyerNav : adminNav;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200/70 px-5 py-5 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-900 text-white shadow-lg shadow-emerald-900/15">
            <span className="text-base font-black">TP</span>
          </div>
          <div className="min-w-0">
            <span className="block text-lg font-black tracking-tight text-slate-950 dark:text-white">
              TaniPro
            </span>
            <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Farm-to-Business Indonesia
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <NavLinks items={navItems} pathname={pathname} onNavigate={onClose} />
      </div>

      <div className="border-t border-slate-200/70 p-3 dark:border-white/10">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-900 to-teal-700 text-sm font-bold text-white">
              {getInitials(user.full_name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {user.full_name}
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {roleLabel[user.role] ?? user.role}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 transition-all duration-300 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
        >
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-dvh w-64 shrink-0 border-r border-slate-200/70 bg-white/88 shadow-[16px_0_50px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-[#09180f]/92 lg:flex">
        {sidebarContent}
      </aside>

      <div
        className={[
          "fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
      />
      <aside
        className={[
          "fixed left-0 top-0 z-50 h-dvh w-[min(19rem,86vw)] border-r border-slate-200/70 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-white/10 dark:bg-[#09180f] lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <button
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
