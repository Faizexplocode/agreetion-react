"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { addActivity } from "@/lib/firebase/activity";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8f4] dark:bg-[#07150d]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-[3px] border-emerald-700 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Memuat ruang kerja...
        </p>
      </div>
    </div>
  );
}

function getPageTitle(role?: string) {
  if (role === "farmer") return "Ruang Petani";
  if (role === "buyer") return "Ruang Pembeli";
  if (role === "admin") return "Ruang Admin";
  return "Dashboard";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuthContext();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (!loading && user && !user.setup_complete) {
      router.push(`/setup-profile?role=${user.role}`);
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    if (user) {
      await addActivity(
        user.id,
        user.full_name,
        user.role,
        "logout",
        "Logged out from dashboard",
      );
    }
    logout();
    router.push("/login");
  };

  if (!mounted || loading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  return (
    <div className="flex h-dvh overflow-hidden bg-[#f6f8f4] text-slate-950 dark:bg-[#07150d] dark:text-white">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          pageTitle={getPageTitle(user.role)}
          user={user}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(20,107,58,0.10),transparent_30%),linear-gradient(180deg,#f7faf5_0%,#eef4ed_100%)] p-4 sm:p-6 lg:p-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(45,190,169,0.13),transparent_28%),linear-gradient(180deg,#07150d_0%,#0d2115_100%)]">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
