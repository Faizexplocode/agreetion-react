"use client";

import { useEffect, useRef, useState } from "react";
import NotificationBell from "./NotificationBell";
import type { SessionUser } from "@/types";

interface NavbarProps {
  pageTitle: string;
  user: SessionUser;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

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

function getRoleContext(role: string) {
  if (role === "farmer") return "Kelola pasokan, pesanan, dan pengiriman";
  if (role === "buyer") return "Pantau pembelian dan peluang pasokan";
  return "Pantau operasional TaniPro";
}

export default function Navbar({ pageTitle, user, onLogout, onToggleSidebar }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-slate-200/70 bg-white/82 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#07150d]/82 lg:px-8">
      <button
        className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white lg:hidden"
        onClick={onToggleSidebar}
        aria-label="Buka menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <p className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300 sm:block">
          TaniPro Workspace
        </p>
        <h1 className="truncate text-base font-black tracking-tight text-slate-950 dark:text-white lg:text-xl">
          {pageTitle}
        </h1>
      </div>

      <div className="hidden min-w-0 flex-1 justify-center xl:flex">
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 px-4 py-2 text-center text-xs font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          {getRoleContext(user.role)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((value) => !value)}
            className="flex items-center gap-2 rounded-lg border border-transparent px-1.5 py-1.5 transition-all duration-300 hover:border-slate-200 hover:bg-slate-50 dark:hover:border-white/10 dark:hover:bg-white/5 sm:px-2"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-900 to-teal-700 text-xs font-black text-white shadow-lg shadow-emerald-900/15">
              {getInitials(user.full_name)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="max-w-[140px] truncate text-xs font-bold leading-tight text-slate-950 dark:text-white">
                {user.full_name}
              </p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {roleLabel[user.role] ?? user.role}
              </p>
            </div>
            <svg className="hidden h-4 w-4 text-slate-400 sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 origin-top-right animate-scale-in rounded-lg border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/10 dark:border-white/10 dark:bg-[#0b1c12]">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/5">
                <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
                  {user.full_name}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
                className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
