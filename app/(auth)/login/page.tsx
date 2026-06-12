import type { Metadata } from "next";
import LoginForm from "@/components/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Masuk — TaniPro",
  description: "Masuk ke akun TaniPro Anda untuk mulai bertransaksi",
};

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(74,124,89,0.12) 0%, transparent 70%), var(--background)",
      }}
    >
      <LoginForm />
    </div>
  );
}
