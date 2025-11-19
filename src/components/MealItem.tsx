"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MealItem({ meal }: { meal: any }) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(meal.is_completed);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fungsi Toggle Selesai (Checklist)
  const toggleComplete = async () => {
    const newValue = !isCompleted;
    setIsCompleted(newValue); // Update UI instan (Optimistic UI)

    await supabase
      .from("meal_plans")
      .update({ is_completed: newValue })
      .eq("id", meal.id);

    router.refresh();
  };

  // Fungsi Hapus Jadwal
  const handleDelete = async () => {
    if (!confirm("Hapus menu ini dari jadwal?")) return;

    setIsDeleting(true);
    await supabase.from("meal_plans").delete().eq("id", meal.id);

    router.refresh(); // Refresh halaman agar data hilang
  };

  if (isDeleting) return null; // Sembunyikan jika sedang dihapus

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
        isCompleted
          ? "bg-gray-50 border-transparent opacity-60"
          : "bg-white border-gray-100 shadow-sm hover:border-primary-200"
      }`}
    >
      {/* Kiri: Checkbox & Info */}
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          onClick={toggleComplete}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            isCompleted
              ? "bg-primary-500 border-primary-500 text-white"
              : "border-gray-300 hover:border-primary-500"
          }`}
        >
          {isCompleted && <Check size={14} strokeWidth={3} />}
        </button>

        <div className="flex items-center gap-3 min-w-0">
          {/* Gambar Kecil */}
          <img
            src={meal.foods.image_url || "https://placehold.co/100"}
            alt="food"
            className="w-10 h-10 rounded-xl object-cover bg-gray-200"
          />
          <div className="truncate">
            <p
              className={`text-sm font-bold truncate ${
                isCompleted ? "text-gray-400 line-through" : "text-gray-800"
              }`}
            >
              {meal.foods.name}
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
              {meal.foods.calories} Kcal
            </p>
          </div>
        </div>
      </div>

      {/* Kanan: Tombol Hapus */}
      <button
        onClick={handleDelete}
        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
