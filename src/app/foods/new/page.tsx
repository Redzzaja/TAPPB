// src/app/foods/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowLeft, Upload, Loader2, Camera } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function AddFoodPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Lunch",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    // Validasi agar angka tidak minus
    if (type === "number") {
      if (parseFloat(value) < 0) return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Kalori wajib > 0
    if (!formData.calories || parseInt(formData.calories) <= 0) {
      toast.error("Kalori tidak boleh 0 atau kosong!");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Login dulu bos!");
        router.push("/login");
        return;
      }

      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("foods")
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from("foods")
          .getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("foods").insert({
        name: formData.name,
        category: formData.category,
        calories: parseInt(formData.calories),
        protein: parseInt(formData.protein) || 0,
        carbs: parseInt(formData.carbs) || 0,
        fat: parseInt(formData.fat) || 0,
        description: formData.description,
        image_url: imageUrl,
      });

      if (insertError) throw insertError;

      toast.success("Makanan berhasil ditambahkan!");
      router.push("/foods");
      router.refresh();
    } catch (error: any) {
      toast.error("Gagal menyimpan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-20 flex items-center gap-4">
        <Link
          href="/foods"
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800">Tambah Menu Baru</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Upload Foto */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Foto Makanan
            </label>
            <div className="relative w-full h-64 rounded-3xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center overflow-hidden hover:border-primary-500 transition-colors group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 group-hover:text-primary-500 transition-colors">
                    <Camera size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">
                    Ketuk untuk upload foto
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG max 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-soft space-y-5">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
              Detail Makanan
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Nama Makanan
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Contoh: Ayam Bakar"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-primary-500 focus:bg-white outline-none font-semibold text-gray-800"
              />
            </div>

            {/* UI PILIHAN KATEGORI */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Kategori
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`py-3 px-4 rounded-xl text-sm font-bold transition border-2 ${
                      formData.category === cat
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Kalori (Kcal)
              </label>
              <input
                name="calories"
                type="number"
                min="0"
                required
                placeholder="0"
                value={formData.calories}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-primary-500 focus:bg-white outline-none font-semibold text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Deskripsi
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Deskripsi singkat..."
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-primary-500 focus:bg-white outline-none font-medium text-gray-800 resize-none"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-soft space-y-5">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
              Makro Nutrisi (Opsional)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-red-500 uppercase mb-1">
                  Protein (g)
                </label>
                <input
                  name="protein"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.protein}
                  onChange={handleChange}
                  className="w-full p-3 bg-red-50 rounded-xl text-center font-bold text-gray-800 border-2 border-transparent focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-yellow-500 uppercase mb-1">
                  Lemak (g)
                </label>
                <input
                  name="fat"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.fat}
                  onChange={handleChange}
                  className="w-full p-3 bg-yellow-50 rounded-xl text-center font-bold text-gray-800 border-2 border-transparent focus:border-yellow-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary-600 uppercase mb-1">
                  Karbo (g)
                </label>
                <input
                  name="carbs"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.carbs}
                  onChange={handleChange}
                  className="w-full p-3 bg-primary-50 rounded-xl text-center font-bold text-gray-800 border-2 border-transparent focus:border-primary-500 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Upload size={20} /> Simpan Makanan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
