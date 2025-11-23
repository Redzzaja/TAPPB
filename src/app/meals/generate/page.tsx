// src/app/meals/generate/page.tsx
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
  CheckCircle2,
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

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedPlan([]);

    try {
      const { data: foods, error } = await supabase.from("foods").select("*");

      if (error || !foods || foods.length < 4) {
        toast.error(
          "Data makanan kurang. Tambahkan minimal 1 menu tiap kategori."
        );
        setLoading(false);
        return;
      }

      const foodList = foods as Food[];

      const categorized = {
        Breakfast: foodList.filter((f) => f.category === "Breakfast"),
        Lunch: foodList.filter((f) => f.category === "Lunch"),
        Dinner: foodList.filter((f) => f.category === "Dinner"),
        Snack: foodList.filter((f) => f.category === "Snack"),
      };

      const targets = {
        Breakfast: targetCalories * 0.25,
        Lunch: targetCalories * 0.35,
        Dinner: targetCalories * 0.3,
        Snack: targetCalories * 0.1,
      };

      const findClosest = (items: Food[], targetCal: number): Food | null => {
        if (items.length === 0) return null;
        const sorted = items.sort(
          (a, b) =>
            Math.abs(Number(a.calories) - targetCal) -
            Math.abs(Number(b.calories) - targetCal)
        );
        const topChoices = sorted.slice(0, 3);
        return topChoices[Math.floor(Math.random() * topChoices.length)];
      };

      const newPlan: DailyPlan[] = [];
      const today = new Date();

      for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i + 1);
        const dateStr = date.toISOString().split("T")[0];

        const b = findClosest(categorized.Breakfast, targets.Breakfast);
        const l = findClosest(categorized.Lunch, targets.Lunch);
        const d = findClosest(categorized.Dinner, targets.Dinner);
        const s = findClosest(categorized.Snack, targets.Snack);

        const total =
          Number(b?.calories || 0) +
          Number(l?.calories || 0) +
          Number(d?.calories || 0) +
          Number(s?.calories || 0);

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
      toast.success("Menu berhasil dibuat sesuai target!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal generate plan.");
    } finally {
      setLoading(false);
    }
  };

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
      for (const day of generatedPlan) {
        if (day.breakfast)
          inserts.push({
            user_id: user.id,
            date: day.date,
            meal_type: "Breakfast",
            food_id: day.breakfast.id,
            is_completed: false,
          });
        if (day.lunch)
          inserts.push({
            user_id: user.id,
            date: day.date,
            meal_type: "Lunch",
            food_id: day.lunch.id,
            is_completed: false,
          });
        if (day.dinner)
          inserts.push({
            user_id: user.id,
            date: day.date,
            meal_type: "Dinner",
            food_id: day.dinner.id,
            is_completed: false,
          });
        if (day.snack)
          inserts.push({
            user_id: user.id,
            date: day.date,
            meal_type: "Snack",
            food_id: day.snack.id,
            is_completed: false,
          });
      }

      const { error } = await supabase.from("meal_plans").insert(inserts);
      if (error) throw error;

      toast.success("Jadwal berhasil disimpan!", {
        icon: <CheckCircle2 className="text-green-500" />,
      });
      router.push("/meals");
    } catch (error: any) {
      toast.error("Gagal menyimpan: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
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
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200 text-white">
              <Wand2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Auto Plan Generator
            </h2>
            <p className="text-gray-500 text-sm">
              Sistem akan mencari kombinasi menu yang mendekati target kalorimu.
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
                onChange={(e) =>
                  setTargetCalories(parseInt(e.target.value) || 0)
                }
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-primary-500 outline-none font-bold text-gray-800 text-lg"
              />
            </div>
          </div>

          {/* TOMBOL GENERATE (DIPERBAIKI: Hijau) */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-200 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-70"
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
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-gray-800">
                Hasil Rekomendasi
              </h3>
              <button
                onClick={handleGenerate}
                className="text-sm text-primary-600 font-bold flex items-center gap-1 hover:underline"
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
                    <span className="font-bold text-gray-800 capitalize">
                      {new Date(day.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                      })}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        day.totalCalories > targetCalories + 200
                          ? "bg-red-50 text-red-500"
                          : day.totalCalories < targetCalories - 200
                          ? "bg-yellow-50 text-yellow-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {day.totalCalories} Kcal
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[day.breakfast, day.lunch, day.dinner, day.snack].map(
                      (meal, i) =>
                        meal ? (
                          <div key={i} className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                              <Image
                                src={
                                  meal.image_url || "https://placehold.co/100"
                                }
                                alt={meal.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-gray-800 truncate">
                                {meal.name}
                              </p>
                              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                                <span>{meal.category}</span>
                                <span>{meal.calories} kcal</span>
                              </div>
                            </div>
                          </div>
                        ) : null
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* --- FIXED BOTTOM BUTTON (UI FIX) --- */}
      {generatedPlan.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 md:static md:bg-transparent md:border-none md:p-0 md:mt-8 z-[60] max-w-3xl mx-auto">
          {/* TOMBOL SIMPAN (DIPERBAIKI: Hijau) */}
          <button
            onClick={handleSavePlan}
            disabled={saving}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary-200 flex items-center justify-center gap-2 transition transform active:scale-95 disabled:opacity-70"
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
      )}
    </div>
  );
}
