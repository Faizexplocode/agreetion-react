import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import FirebaseInit from "@/components/FirebaseInit";

export const metadata: Metadata = {
  title: {
    default: "TaniPro — Platform Pertanian Farm-to-Business",
    template: "%s | TaniPro",
  },
  description:
    "TaniPro menghubungkan petani lokal langsung dengan pembeli industri — tanpa perantara, harga transparan, logistik teroptimasi.",
  keywords: ["pertanian", "farm-to-business", "petani", "komoditas", "agritech", "Indonesia"],
  authors: [{ name: "TaniPro Team" }],
  creator: "TaniPro",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "TaniPro",
    title: "TaniPro — Platform Pertanian Farm-to-Business",
    description:
      "Hubungkan petani dengan pembeli industri secara langsung. Harga terbaik, transaksi transparan.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <FirebaseInit />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
