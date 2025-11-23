// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/context/AuthContext"; // Pastikan ini diimport

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  themeColor: "#84CC16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Meal Planner PWA",
  description: "Rencanakan makanan sehatmu mingguan",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${poppins.className} bg-gray-50 text-gray-800`}>
        {/* Provider membungkus seluruh aplikasi */}
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 md:ml-20 min-h-screen relative w-full transition-all duration-300 ease-in-out">
              <div className="px-4 py-6 md:px-10 md:py-10 max-w-7xl mx-auto">
                {children}
              </div>
              <div className="h-24 md:hidden"></div>
            </main>
          </div>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
