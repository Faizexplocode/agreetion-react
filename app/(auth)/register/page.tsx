import type { Metadata } from "next";
import RegisterForm from "@/components/features/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar — TaniPro",
  description: "Buat akun TaniPro baru sebagai Petani atau Pembeli",
};

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(74,124,89,0.12) 0%, transparent 70%), var(--background)",
      }}
    >
      <RegisterForm />
    </div>
  );
}
