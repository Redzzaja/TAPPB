// src/app/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext"; // Gunakan Context Custom
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Utensils,
  Loader2,
  Activity,
  ShieldCheck,
  Clock,
  ChevronRight,
} from "lucide-react";
import DashboardView from "@/components/DashboardView";

// --- KOMPONEN LANDING PAGE ---
function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* HERO SECTION */}
      <section className="relative w-full min-h-[600px] flex items-center justify-center overflow-hidden pt-10 pb-40">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop"
            alt="Healthy Food"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-gray-50/95"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs md:text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
            Meal Planner PWA
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
            Makan Sehat <br />
            <span className="text-primary-400">Tanpa Ribet</span>
          </h1>

          <p className="text-base md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-light">
            Rencanakan menu mingguan, pantau nutrisi harian, dan capai target
            tubuh idealmu.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-primary-600 text-white text-lg font-bold rounded-2xl shadow-lg hover:bg-primary-700 flex items-center justify-center gap-2"
            >
              Mulai Sekarang <ArrowRight size={20} />
            </Link>
            <Link
              href="/foods"
              className="px-8 py-4 bg-white text-gray-900 text-lg font-bold rounded-2xl shadow-md hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              <Utensils size={20} className="text-primary-600" /> Lihat Menu
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <div className="max-w-6xl mx-auto px-6 -mt-24 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-200 p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
              Kenapa Pakai Meal Planner?
            </h2>
            <p className="text-gray-500">
              Solusi cerdas untuk gaya hidup modern.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-gray-50 border border-gray-100">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <Activity size={32} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Kontrol Kalori
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Pantau asupan harianmu dengan grafik visual.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-gray-50 border border-gray-100">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Nutrisi Terjaga
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Pastikan makro nutrisi seimbang setiap harinya.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-gray-50 border border-gray-100">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <Clock size={32} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Hemat Waktu
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Rencanakan sekali, belanja efisien.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <section className="max-w-4xl mx-auto px-6 mt-20 text-center">
        <div className="bg-primary-900 rounded-[2.5rem] p-10 md:p-16 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Siap Hidup Lebih Sehat?
            </h2>
            <p className="text-primary-100 text-lg max-w-lg mx-auto">
              Aplikasi ini gratis selamanya untuk fitur dasar.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white text-primary-900 font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition shadow-md"
              >
                Buat Akun Gratis <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-12 text-gray-400 text-sm">&copy; 2025 MealPlan PWA.</p>
      </section>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return user ? <DashboardView user={user} /> : <LandingPage />;
}
