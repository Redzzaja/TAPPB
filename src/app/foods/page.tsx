"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Plus, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Food } from "@/types";
import Image from "next/image";

const PAGE_SIZE = 8; // Jumlah item per load

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Fungsi Fetch Data dengan Pagination & Search
  const fetchFoods = async (pageIndex: number, isNewSearch = false) => {
    setLoading(true);
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("foods")
      .select("*")
      .order("name", { ascending: true })
      .range(from, to);

    // Jika ada search, filter datanya
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;

    if (!error && data) {
      if (isNewSearch) {
        setFoods(data as Food[]);
      } else {
        setFoods((prev) => [...prev, ...(data as Food[])]);
      }

      // Jika data yang ditarik kurang dari target, berarti sudah habis
      if (data.length < PAGE_SIZE) setHasMore(false);
    }
    setLoading(false);
  };

  // Efek saat search diketik (Debounce 500ms agar tidak spam request)
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    const delayDebounceFn = setTimeout(() => {
      fetchFoods(0, true);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFoods(nextPage);
  };

  return (
    <div className="space-y-6 pb-24 min-h-screen">
      {/* HEADER STICKY (Search Bar) */}
      <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm pt-4 pb-4 z-30 px-1 transition-all">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Makanan</h1>

          {/* UPDATE: Ganti tombol Filter jadi Link ke /foods/new */}
          <Link
            href="/foods/new"
            className="p-2 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-200 hover:bg-primary-700 transition flex items-center gap-2 px-4"
          >
            <Plus size={20} />
            <span className="text-xs font-bold">Baru</span>
          </Link>
        </div>

        <div className="relative shadow-soft rounded-2xl">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari makanan sehat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border-none focus:ring-2 focus:ring-primary-500 outline-none text-gray-700 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* GRID MAKANAN */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {foods.map((food) => (
          <Link
            href={`/food-detail?id=${food.id}`}
            key={food.id}
            className="group relative bg-white rounded-3xl p-3 shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-primary-100 block"
          >
            {/* Gambar dengan Next Image (Lazy Load) */}
            <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-3 bg-gray-100">
              <Image
                src={
                  food.image_url || "https://placehold.co/400x300?text=No+Image"
                }
                alt={food.name}
                fill
                className="object-cover group-hover:scale-110 transition duration-700"
                // TAMBAHKAN INI:
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-primary-700 shadow-sm">
                {food.calories} kcal
              </div>
            </div>

            {/* Konten Text */}
            <div className="px-1">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                {food.category}
              </p>
              <h3 className="font-bold text-gray-800 text-sm leading-tight mb-3 line-clamp-2 h-10 group-hover:text-primary-600 transition">
                {food.name}
              </h3>

              <div className="flex items-center justify-between mt-auto border-t border-gray-50 pt-2">
                <span className="text-[11px] font-medium text-gray-400 group-hover:text-primary-600 transition">
                  Lihat detail
                </span>
                <div className="w-7 h-7 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-primary-500 group-hover:text-white transition shadow-sm">
                  <Plus size={16} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* STATE: Kosong / Loading / Load More */}
      {foods.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 opacity-60">
          <Info size={32} className="text-gray-400 mb-2" />
          <p className="text-gray-500">Tidak ada makanan ditemukan.</p>
        </div>
      )}

      <div className="flex justify-center pt-8">
        {loading ? (
          <Loader2 className="animate-spin text-primary-600" />
        ) : (
          hasMore && (
            <button
              onClick={loadMore}
              className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-bold hover:bg-gray-50 hover:border-primary-200 hover:text-primary-600 transition shadow-sm active:scale-95"
            >
              Muat Lebih Banyak
            </button>
          )
        )}
      </div>
    </div>
  );
}
