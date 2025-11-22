"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Wand2,
  Save,
  RefreshCw,
  Flame,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Food } from "@/types";

interface DailyPlan {
  date: string;
  breakfast: Food | null;
  lunch: Food | null;
  dinner: Food | null;
  snack: Food | null;
  totalCalories: number;
}

export default function GenerateMealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [targetCalories, setTargetCalories] = useState(2000);
  const [generatedPlan, setGeneratedPlan] = useState<DailyPlan[]>([]);

  // 1. Algoritma Generator Cerdas
  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedPlan([]);

    try {
      // Fetch semua makanan dari DB
      const { data: foods, error } = await supabase.from("foods").select("*");

      if (error || !foods || foods.length < 4) {
        toast.error(
          "Data makanan terlalu sedikit untuk di-generate. Tambahkan minimal 4 makanan (Breakfast, Lunch, Dinner, Snack)."
        );
        setLoading(false);
        return;
      }

      const foodList = foods as Food[];

      // Pisahkan kategori
      const breakfastItems = foodList.filter((f) => f.category === "Breakfast");
      const lunchItems = foodList.filter((f) => f.category === "Lunch");
      const dinnerItems = foodList.filter((f) => f.category === "Dinner");
      const snackItems = foodList.filter((f) => f.category === "Snack");

      // Helper: Ambil item acak
      const getRandom = (arr: Food[]) =>
        arr[Math.floor(Math.random() * arr.length)];

      // Generate untuk 3 hari ke depan (Contoh)
      const newPlan: DailyPlan[] = [];
      const today = new Date();

      for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i + 1); // Mulai besok
        const dateStr = date.toISOString().split("T")[0];

        // Simple Logic: Pilih acak dari kategori
        // (Bisa dikembangkan jadi algoritma Knapsack Problem untuk akurasi kalori tinggi)
        const b = getRandom(breakfastItems) || getRandom(foodList);
        const l = getRandom(lunchItems) || getRandom(foodList);
        const d = getRandom(dinnerItems) || getRandom(foodList);
        const s = getRandom(snackItems) || getRandom(foodList);

        const total =
          (b?.calories || 0) +
          (l?.calories || 0) +
          (d?.calories || 0) +
          (s?.calories || 0);

        newPlan.push({
          date: dateStr,
          breakfast: b,
          lunch: l,
          dinner: d,
          snack: s,
          totalCalories: total,
        });
      }

      setGeneratedPlan(newPlan);
      toast.success("Rencana makan berhasil dibuat!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal generate plan.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fungsi Simpan ke Database
  const handleSavePlan = async () => {
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Login dulu untuk menyimpan.");
        router.push("/login");
        return;
      }

      const inserts = [];

      // Ratakan data plan menjadi baris-baris database
      for (const day of generatedPlan) {
        if (day.breakfast)
          inserts.push({
            user_id: user.id,
            date: day.date,
            meal_type: "Breakfast",
            food_id: day.breakfast.id,
          });
        if (day.lunch)
          inserts.push({
            user_id: user.id,
            date: day.date,
            meal_type: "Lunch",
            food_id: day.lunch.id,
          });
        if (day.dinner)
          inserts.push({
            user_id: user.id,
            date: day.date,
            meal_type: "Dinner",
            food_id: day.dinner.id,
          });
        if (day.snack)
          inserts.push({
            user_id: user.id,
            date: day.date,
            meal_type: "Snack",
            food_id: day.snack.id,
          });
      }

      const { error } = await supabase.from("meal_plans").insert(inserts);

      if (error) throw error;

      toast.success("Jadwal berhasil disimpan!");
      router.push("/meals");
    } catch (error: any) {
      toast.error("Gagal menyimpan: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-20 flex items-center gap-4">
        <Link
          href="/meals"
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800">AI Meal Generator</h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* --- INPUT TARGET --- */}
        <section className="bg-white p-6 rounded-3xl shadow-soft space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200 text-white">
              <Wand2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Auto Plan Generator
            </h2>
            <p className="text-gray-500 text-sm">
              Biarkan sistem memilihkan menu sehat untuk 3 hari ke depan sesuai
              target kalorimu.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Target Kalori Harian
            </label>
            <div className="relative">
              <Flame
                className="absolute left-4 top-3.5 text-orange-500"
                size={20}
              />
              <input
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(parseInt(e.target.value))}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-500 outline-none font-bold text-gray-800"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-black transition active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Generate Menu Sekarang"
            )}
          </button>
        </section>

        {/* --- HASIL GENERATE --- */}
        {generatedPlan.length > 0 && (
          <section className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                Hasil Rekomendasi
              </h3>
              <button
                onClick={handleGenerate}
                className="text-sm text-purple-600 font-bold flex items-center gap-1 hover:underline"
              >
                <RefreshCw size={16} /> Acak Ulang
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {generatedPlan.map((day, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                    <span className="font-bold text-gray-800">
                      {new Date(day.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                      })}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        day.totalCalories > targetCalories
                          ? "bg-red-50 text-red-500"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {day.totalCalories} Kcal
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[day.breakfast, day.lunch, day.dinner, day.snack].map(
                      (meal, i) =>
                        meal ? (
                          <div key={i} className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                              <Image
                                src={meal.image_url || "/placeholder.png"}
                                alt={meal.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">
                                {meal.name}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {meal.calories} kcal
                              </p>
                            </div>
                          </div>
                        ) : null
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tombol Simpan */}
            <div className="sticky bottom-6">
              <button
                onClick={handleSavePlan}
                disabled={saving}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-purple-200 flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                {saving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Save size={20} /> Simpan ke Jadwal Saya
                  </>
                )}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
