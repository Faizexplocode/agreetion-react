"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import { getDashboardUrl } from "@/lib/utils/routing";

/**
 * /dashboard → redirect ke dashboard sesuai role user
 */
export default function DashboardIndexPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace(getDashboardUrl(user.role));
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div
          className="w-10 h-10 rounded-full border-[3px] border-t-transparent animate-spin mx-auto mb-4"
          style={{ borderColor: "var(--tanipro-moss)", borderTopColor: "transparent" }}
        />
        <p style={{ color: "var(--tanipro-mid-gray)" }}>Mengalihkan...</p>
      </div>
    </div>
  );
}
