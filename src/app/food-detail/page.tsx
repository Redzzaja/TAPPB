// src/app/food-detail/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AddToPlanButton from "@/components/AddToPlanButton";
import type { Food } from "@/types";

// --- KOMPONEN MIKRO ---
function MacroRing({ label, value, total, color, unit }: any) {
  const percent = Math.min((value / (total || 1)) * 100, 100);
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl w-full border border-gray-100 hover:border-primary-200 transition-all shadow-sm">
      <div
        className="relative w-14 h-14 rounded-full flex items-center justify-center mb-2"
        style={{
          background: `conic-gradient(${color} ${percent}%, #E5E7EB 0)`,
        }}
      >
        <div className="absolute w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-inner">
          <span className="text-[10px] font-bold text-gray-800">
            {Math.round(percent)}%
          </span>
        </div>
      </div>
      <span className="text-sm font-bold text-gray-800">
        {value}
        {unit}
      </span>
      <span className="text-[10px] text-gray-400 font-medium uppercase">
        {label}
      </span>
    </div>
  );
}

function FoodDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [foodItem, setFoodItem] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFood = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setFoodItem(data as Food);
      }
      setLoading(false);
    };
    fetchFood();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-20">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  if (!foodItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 space-y-4">
        <AlertCircle size={48} className="text-gray-300" />
        <p className="text-gray-400 font-medium">Makanan tidak ditemukan.</p>
        <Link
          href="/foods"
          className="px-6 py-2 bg-primary-50 text-primary-700 rounded-full font-bold hover:bg-primary-100 transition"
        >
          Kembali ke List
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32 md:pb-10 md:bg-gray-50">
      <div className="max-w-5xl mx-auto md:pt-8 md:grid md:grid-cols-2 md:gap-10 md:items-start">
        {/* BAGIAN GAMBAR */}
        <div className="relative h-80 md:h-[450px] w-full md:rounded-3xl md:overflow-hidden md:shadow-2xl group bg-gray-100">
          <Image
            src={foodItem.image_url || "https://placehold.co/600x400"}
            alt={foodItem.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute top-4 left-4 z-10 md:hidden">
            <Link
              href="/foods"
              className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 shadow-lg"
            >
              <ChevronLeft size={24} />
            </Link>
          </div>
        </div>

        {/* BAGIAN DETAIL */}
        <div className="relative -mt-10 bg-white rounded-t-[2.5rem] px-6 pt-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] min-h-[50vh] md:mt-0 md:rounded-3xl md:p-8 md:shadow-none">
          {/* Handle Visual Mobile */}
          <div className="flex justify-center mb-6 md:hidden">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
          </div>

          {/* Breadcrumb Desktop */}
          <div className="hidden md:flex items-center gap-3 mb-6">
            <Link
              href="/foods"
              className="w-10 h-10 border border-gray-200 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-600 transition shadow-sm"
            >
              <ChevronLeft size={20} />
            </Link>
            <span className="text-sm text-gray-400 font-medium">Kembali</span>
          </div>

          <div className="flex justify-between items-start mb-8">
            <div className="w-3/4 pr-4">
              <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 inline-block border border-primary-100">
                {foodItem.category}
              </span>
              <h1 className="text-2xl md:text-4xl font-black text-gray-800 leading-tight">
                {foodItem.name}
              </h1>
            </div>
            <div className="text-right bg-primary-50 px-4 py-3 rounded-2xl border border-primary-100 shadow-sm shrink-0">
              <p className="text-xl font-black text-primary-600">
                {foodItem.calories}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Kcal
              </p>
            </div>
          </div>

          <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
            <div className="w-1 h-4 bg-primary-500 rounded-full"></div>{" "}
            Informasi Nutrisi
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-10">
            <MacroRing
              label="Protein"
              value={foodItem.protein}
              total={50}
              color="#ef4444"
              unit="g"
            />
            <MacroRing
              label="Lemak"
              value={foodItem.fat}
              total={60}
              color="#f59e0b"
              unit="g"
            />
            <MacroRing
              label="Karbo"
              value={foodItem.carbs}
              total={100}
              color="#84cc16"
              unit="g"
            />
          </div>

          <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full"></div> Deskripsi
          </h3>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-24 md:mb-8 text-justify">
            {foodItem.description || "Belum ada deskripsi."}
          </p>

          <div className="hidden md:block mt-8">
            <AddToPlanButton foodId={foodItem.id} foodName={foodItem.name} />
          </div>
        </div>
      </div>

      {/* Sticky Button Mobile - DIPERBAIKI: z-60 agar di atas navbar (z-50) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-60 md:hidden pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <AddToPlanButton foodId={foodItem.id} foodName={foodItem.name} />
      </div>
    </div>
  );
}

export default function FoodDetailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <FoodDetailContent />
    </Suspense>
  );
}
