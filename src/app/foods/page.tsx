import { Search, Filter, Plus, Info } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // Import Supabase Client
import type { Food } from "@/types";

// Tambahkan "async" agar bisa fetch data
export default async function FoodsPage() {
  // 1. Fetch Data dari Supabase
  const { data: foods, error } = await supabase
    .from("foods")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching foods:", error);
    return <div className="p-6 text-red-500">Gagal memuat data makanan.</div>;
  }

  // Cek jika data kosong
  if (!foods || foods.length === 0) {
    return (
      <div className="p-10 text-center space-y-4">
        <div className="inline-block p-4 bg-gray-100 rounded-full text-gray-400">
          <Info size={32} />
        </div>
        <p className="text-gray-500">Belum ada data makanan di Database.</p>
        <p className="text-xs text-gray-400">
          Silakan jalankan SQL Insert di Supabase Dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* --- HEADER & SEARCH (Tetap Sama) --- */}
      <div className="sticky top-0 bg-gray-50 pt-2 pb-4 z-30 px-1">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Database Makanan</h1>
          <button className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-primary-600 transition">
            <Filter size={20} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari makanan sehat..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-none shadow-soft focus:ring-2 focus:ring-primary-500 outline-none text-gray-700"
          />
        </div>
      </div>

      {/* --- FOOD GRID (Dinamis dari Database) --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {foods.map((food: Food) => (
          <Link
            href={`/foods/${food.id}`}
            key={food.id}
            className="group relative bg-white rounded-3xl p-3 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-primary-100"
          >
            {/* Image Container */}
            <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-3 bg-gray-100">
              {/* Fallback jika image_url null */}
              <img
                src={
                  food.image_url || "https://placehold.co/400x300?text=No+Image"
                }
                alt={food.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-primary-700 shadow-sm">
                {food.calories} kcal
              </div>
            </div>

            {/* Content */}
            <div className="px-1">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                {food.category}
              </p>
              <h3 className="font-bold text-gray-800 text-sm leading-tight mb-3 line-clamp-2 h-10">
                {food.name}
              </h3>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-[11px] font-medium text-gray-400 group-hover:text-primary-600 transition">
                  Detail
                </span>
                <div className="w-7 h-7 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-primary-500 group-hover:text-white transition shadow-sm">
                  <Plus size={16} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
