import AddToPlanButton from "@/components/AddToPlanButton";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Heart, Share2, Plus, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { Food } from "@/types";

// --- KOMPONEN UI KECIL ---
function MacroRing({ label, value, total, color, unit }: any) {
  const percent = Math.min((value / (total || 1)) * 100, 100); // Prevent division by zero
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl w-full border border-gray-100">
      <div
        className="relative w-14 h-14 rounded-full flex items-center justify-center mb-2"
        style={{
          background: `conic-gradient(${color} ${percent}%, #E5E7EB 0)`,
        }}
      >
        <div className="absolute w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center shadow-inner">
          <span className="text-[10px] font-bold text-gray-800">
            {Math.round(percent)}%
          </span>
        </div>
      </div>
      <span className="text-sm font-bold text-gray-800">
        {value}
        {unit}
      </span>
      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

// --- UPDATE: Next.js 15 mengharuskan params berupa Promise ---
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FoodDetail({ params }: PageProps) {
  // 1. AWAIT PARAMS (Wajib di Next.js 15)
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // 2. Fetch Data Single
  const { data: food, error } = await supabase
    .from("foods")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !food) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500 space-y-4 p-6 text-center">
        <AlertCircle size={48} className="text-red-400" />
        <h2 className="text-xl font-bold">Data Tidak Ditemukan</h2>
        <p className="text-sm">
          Pastikan URL benar atau data sudah ada di database.
        </p>
        <Link
          href="/foods"
          className="px-4 py-2 bg-primary-600 text-white rounded-xl shadow-lg"
        >
          Kembali ke List
        </Link>
      </div>
    );
  }

  const foodItem = food as Food;

  return (
    <div className="pb-28 bg-white min-h-screen">
      {/* HERO IMAGE */}
      <div className="relative h-80 md:h-96 w-full">
        <img
          src={
            foodItem.image_url || "https://placehold.co/600x400?text=No+Image"
          }
          alt={foodItem.name}
          className="w-full h-full object-cover"
        />

        {/* Navigation Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center px-2 z-10">
          <Link
            href="/foods"
            className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 shadow-sm hover:bg-white transition"
          >
            <ChevronLeft size={24} />
          </Link>
          <div className="flex gap-3">
            <button className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 shadow-sm hover:text-red-500 transition">
              <Heart size={20} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      {/* CONTENT */}
      <div className="relative -mt-10 bg-white rounded-t-[2.5rem] px-6 pt-8 shadow-soft min-h-[50vh]">
        {/* Handle Visual */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        {/* Title Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="w-3/4">
            <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-2 inline-block">
              {foodItem.category}
            </span>
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">
              {foodItem.name}
            </h1>
          </div>
          <div className="text-right bg-primary-50 px-3 py-2 rounded-2xl">
            <p className="text-xl font-black text-primary-600">
              {foodItem.calories}
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Kcal
            </p>
          </div>
        </div>

        {/* Macros */}
        <h3 className="font-bold text-gray-800 mb-4 text-sm">
          Informasi Nutrisi
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-8">
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

        {/* Description (Database) */}
        <h3 className="font-bold text-gray-800 mb-2 text-sm">
          Tentang Makanan
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 text-justify">
          {foodItem.description ||
            "Deskripsi belum tersedia untuk makanan ini."}
        </p>
      </div>

      {/* Sticky Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:absolute md:bottom-0 z-20">
        <div className="max-w-7xl mx-auto md:pl-64">
          <AddToPlanButton foodId={foodItem.id} foodName={foodItem.name} />
        </div>
      </div>
    </div>
  );
}
