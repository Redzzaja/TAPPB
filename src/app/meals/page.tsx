"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Plus, Loader2, Wand2, Lock } from "lucide-react";
import Link from "next/link";
import MealItem from "@/components/MealItem";
import { useRouter } from "next/navigation";

// Helper untuk format tanggal (Contoh: "Jumat, 22 Nov")
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "short",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

export default function MealsPage() {
  const [groupedMeals, setGroupedMeals] = useState<{ [key: string]: any[] }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      // 1. Cek Session User
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      // 2. Fetch Data Jadwal Milik User
      const { data: plans, error } = await supabase
        .from("meal_plans")
        .select("*, foods(*)")
        .eq("user_id", session.user.id)
        .order("date", { ascending: true }); // Urutkan tanggal terdekat dulu

      if (error) {
        console.error("Error fetching meal plans:", error);
      }

      // 3. Grouping Data per Tanggal
      const groups: any = {};
      if (plans) {
        plans.forEach((plan) => {
          if (!groups[plan.date]) {
            groups[plan.date] = [];
          }
          groups[plan.date].push(plan);
        });
      }

      setGroupedMeals(groups);
      setLoading(false);
    };

    init();
  }, []);

  // --- TAMPILAN UNTUK TAMU (Akses Terbatas) ---
  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <Lock size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Terbatas</h2>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
          Silakan login untuk melihat dan mengatur jadwal makan mingguanmu.
        </p>
        <Link
          href="/login"
          className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-primary-700 transition"
        >
          Login Sekarang
        </Link>
      </div>
    );
  }

  // --- TAMPILAN LOADING ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-32">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  const dates = Object.keys(groupedMeals);

  // --- TAMPILAN UTAMA (User Login) ---
  return (
    <div className="pb-24 space-y-6">
      {/* HEADER STICKY */}
      <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm pt-4 pb-2 z-30 px-1 transition-all">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Jadwal Makan</h1>
            <p className="text-xs text-gray-500 mt-1">
              Rencana nutrisi mingguan Anda
            </p>
          </div>

          <div className="flex gap-2">
            {/* Tombol Auto Plan (AI Generator) */}
            <Link
              href="/meals/generate"
              className="p-2 bg-white border border-gray-200 text-purple-600 rounded-full shadow-sm hover:bg-purple-50 transition flex items-center gap-2 px-3 active:scale-95"
            >
              <Wand2 size={18} />
              <span className="text-xs font-bold hidden md:block">
                Auto Plan
              </span>
            </Link>

            {/* Tombol Tambah Manual */}
            <Link
              href="/foods"
              className="p-2 bg-primary-600 text-white rounded-full shadow-md hover:bg-primary-700 transition active:scale-95"
            >
              <Plus size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* STATE KOSONG */}
      {dates.length === 0 && (
        <div className="text-center py-20 opacity-60 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <CalendarDays size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Belum ada jadwal.</p>
          <Link
            href="/foods"
            className="mt-4 text-primary-600 font-bold text-sm hover:underline"
          >
            + Mulai tambah makanan
          </Link>
        </div>
      )}

      {/* LIST JADWAL (Grouped by Date) */}
      {dates.map((date) => {
        // Hitung Total Kalori Harian
        const dailyCalories = groupedMeals[date].reduce(
          (acc, curr) => acc + (curr.foods?.calories || 0),
          0
        );

        return (
          <section
            key={date}
            className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md"
          >
            {/* Header Tanggal & Total Kalori */}
            <div className="flex justify-between items-end mb-4 pb-2 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-800 capitalize border-l-4 border-primary-500 pl-3">
                {formatDate(date)}
              </h2>
              <span className="text-[10px] font-bold bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 text-gray-500">
                Total: {dailyCalories} Kcal
              </span>
            </div>

            {/* List Menu per Waktu Makan */}
            <div className="space-y-5">
              {["Breakfast", "Lunch", "Dinner", "Snack"].map((type) => {
                // Filter menu berdasarkan waktu makan
                const mealsByType = groupedMeals[date].filter(
                  (m: any) => m.meal_type === type
                );

                if (!mealsByType.length) return null; // Sembunyikan jika kosong

                return (
                  <div key={type}>
                    {/* Label Waktu (Pagi/Siang/Malam) */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          type === "Breakfast"
                            ? "bg-orange-400"
                            : type === "Lunch"
                            ? "bg-primary-500"
                            : type === "Dinner"
                            ? "bg-blue-500"
                            : "bg-purple-400"
                        }`}
                      ></span>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {type === "Breakfast" && "Sarapan"}
                        {type === "Lunch" && "Makan Siang"}
                        {type === "Dinner" && "Makan Malam"}
                        {type === "Snack" && "Camilan"}
                      </h3>
                    </div>

                    {/* Item Makanan */}
                    <div className="space-y-2 pl-3 border-l border-gray-100 ml-1">
                      {mealsByType.map((meal: any) => (
                        <MealItem key={meal.id} meal={meal} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
