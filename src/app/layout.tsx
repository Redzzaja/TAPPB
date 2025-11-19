import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meal Planner PWA",
  description: "Rencanakan makanan sehatmu mingguan",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#84cc16", // Warna status bar HP
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Mencegah zoom saat input di HP
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-50 text-gray-800`}>
        {/* Komponen Navigasi (Sidebar / Bottom Bar) */}
        <Navigation />

        {/* Area Konten Utama:
          - md:ml-64 : Memberi jarak kiri 64 unit di Desktop (karena ada Sidebar)
          - pb-24    : Memberi jarak bawah di Mobile (agar tidak tertutup Bottom Bar)
        */}
        <main className="md:ml-64 min-h-screen pb-24 md:pb-8 pt-6 px-4 md:px-8 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
