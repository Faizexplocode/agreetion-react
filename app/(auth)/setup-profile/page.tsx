import type { Metadata } from "next";
import SetupProfileForm from "@/components/features/auth/SetupProfileForm";

export const metadata: Metadata = {
  title: "Lengkapi Profil — TaniPro",
  description: "Lengkapi profil TaniPro Anda untuk mulai bertransaksi",
};

export default function SetupProfilePage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(74,124,89,0.12) 0%, transparent 70%), var(--background)",
      }}
    >
      <SetupProfileForm />
    </div>
  );
}
