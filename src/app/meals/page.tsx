import { supabase } from "@/lib/supabase";
import { CalendarDays, Plus } from "lucide-react";
import Link from "next/link";
import MealItem from "@/components/MealItem";

// Helper untuk format tanggal (Jumat, 21 Nov)
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "short",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

export default async function MealsPage() {
  // 1. Fetch Data (Join meal_plans dengan foods)
  const { data: plans, error } = await supabase
    .from("meal_plans")
    .select("*, foods(*)")
    .order("date", { ascending: true }) // Urutkan tanggal terdekat
    .order("created_at", { ascending: true });

  if (error) console.error(error);

  // 2. Grouping Logic (Mengelompokkan per Tanggal)
  const groupedMeals: { [key: string]: any[] } = {};

  if (plans) {
    plans.forEach((plan) => {
      if (!groupedMeals[plan.date]) {
        groupedMeals[plan.date] = [];
      }
      groupedMeals[plan.date].push(plan);
    });
  }

  // Ambil list tanggal yang ada (Object keys)
  const dates = Object.keys(groupedMeals);

  return (
    <div className="pb-24 space-y-6">
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 pt-4 pb-2 z-30 px-1">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Jadwal Makan</h1>
          <Link
            href="/foods"
            className="p-2 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-600/30 hover:bg-primary-700 transition"
          >
            <Plus size={20} />
          </Link>
        </div>
        <p className="text-sm text-gray-500">Rencana nutrisi mingguan Anda</p>
      </div>

      {/* Empty State (Jika belum ada jadwal) */}
      {dates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
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

      {/* List Per Tanggal */}
      <div className="space-y-8">
        {dates.map((date) => {
          // Hitung Total Kalori Harian
          const dailyCalories = groupedMeals[date].reduce(
            (acc, curr) => acc + (curr.foods?.calories || 0),
            0
          );

          return (
            <section
              key={date}
              className="animate-in slide-in-from-bottom-4 duration-500"
            >
              {/* Header Tanggal */}
              <div className="flex justify-between items-end mb-3 px-1">
                <h2 className="text-lg font-bold text-gray-800 capitalize border-l-4 border-primary-500 pl-3">
                  {formatDate(date)}
                </h2>
                <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-lg border border-gray-100 text-gray-500 shadow-sm">
                  Total: {dailyCalories} Kcal
                </span>
              </div>

              {/* Group per Waktu Makan (Breakfast, Lunch, etc) */}
              <div className="bg-white p-4 rounded-3xl shadow-soft space-y-4">
                {["Breakfast", "Lunch", "Dinner", "Snack"].map((type) => {
                  // Filter menu berdasarkan waktu makan
                  const mealsByType = groupedMeals[date].filter(
                    (m) => m.meal_type === type
                  );

                  if (mealsByType.length === 0) return null; // Jangan tampilkan jika kosong

                  return (
                    <div key={type}>
                      {/* Label Waktu (Pagi/Siang/Malam) */}
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        {type === "Breakfast" && "☕ Sarapan"}
                        {type === "Lunch" && "🥗 Makan Siang"}
                        {type === "Dinner" && "🌙 Makan Malam"}
                        {type === "Snack" && "🍎 Camilan"}
                      </h3>

                      {/* List Makanan */}
                      <div className="space-y-2">
                        {mealsByType.map((meal) => (
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
    </div>
  );
}
