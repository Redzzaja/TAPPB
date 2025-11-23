// src/components/AddToPlanButton.tsx
"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Loader2,
  Calendar as CalendarIcon,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AddToPlanButtonProps {
  foodId: string;
  foodName: string;
}

export default function AddToPlanButton({
  foodId,
  foodName,
}: AddToPlanButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mealType, setMealType] = useState("Breakfast");

  const handleSave = async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Login dulu!", {
        description: "Silakan masuk untuk menyimpan jadwal.",
      });
      router.push("/login");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.from("meal_plans").insert({
      user_id: user.id,
      food_id: foodId,
      date: date,
      meal_type: mealType,
      is_completed: false,
    });

    if (error) {
      toast.error("Gagal menyimpan", { description: error.message });
    } else {
      toast.success("Berhasil disimpan!", {
        description: `${foodName} ditambahkan ke ${mealType}.`,
        icon: <CheckCircle2 className="text-green-500" />,
      });
      setIsOpen(false);
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* TOMBOL TRIGGER (DIPERBAIKI: Hijau) */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-200 active:scale-95 transition transform flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Tambahkan ke Jadwal
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">
                Atur Jadwal Makan
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 p-4 bg-primary-50 rounded-2xl border border-primary-100">
              <p className="text-xs text-primary-600 font-bold uppercase mb-1">
                Makanan Terpilih
              </p>
              <p className="text-lg font-bold text-gray-800">{foodName}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Pilih Tanggal
                </label>
                <div className="relative">
                  <CalendarIcon
                    className="absolute left-4 top-3.5 text-gray-400"
                    size={20}
                  />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary-500 outline-none font-medium text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Waktu Makan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Breakfast", "Lunch", "Dinner", "Snack"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setMealType(type)}
                      className={`py-3 px-4 rounded-xl text-sm font-bold transition border-2 ${
                        mealType === type
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* TOMBOL SIMPAN (DIPERBAIKI: Hijau) */}
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-200 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Simpan Jadwal"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
