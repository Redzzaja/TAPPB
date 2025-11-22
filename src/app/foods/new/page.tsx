"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowLeft, Upload, Loader2, Camera } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AddFoodPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Lunch",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    description: "",
  });

  // Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Cek Login
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Anda harus login untuk menambah makanan.");
        router.push("/login");
        return;
      }

      let imageUrl = null;

      // 2. Upload Gambar (Jika ada file)
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

      // 3. Insert Data
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
    } catch (error) {
      // PERBAIKAN: Menangani error tanpa 'any' dan tanpa 'console.error'
      let message = "Terjadi kesalahan saat menyimpan.";

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      }

      toast.error("Gagal menyimpan makanan", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
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
          {/* --- UPLOAD FOTO --- */}
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

          {/* --- INFORMASI UTAMA --- */}
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
                placeholder="Contoh: Ayam Bakar Madu"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:border-primary-500 focus:bg-white focus:ring-0 border-2 transition outline-none font-semibold text-gray-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:border-primary-500 transition outline-none font-semibold text-gray-800 appearance-none"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Kalori (Kcal)
                </label>
                <input
                  name="calories"
                  type="number"
                  required
                  placeholder="0"
                  value={formData.calories}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:border-primary-500 focus:bg-white border-2 transition outline-none font-semibold text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Deskripsi Singkat
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Jelaskan rasa dan bahan utamanya..."
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:border-primary-500 focus:bg-white border-2 transition outline-none font-medium text-gray-800 resize-none"
              />
            </div>
          </div>

          {/* --- MAKRO NUTRISI --- */}
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
                  placeholder="0"
                  value={formData.protein}
                  onChange={handleChange}
                  className="w-full p-3 bg-red-50 rounded-xl text-center font-bold text-gray-800 border-transparent focus:border-red-500 border-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-yellow-500 uppercase mb-1">
                  Lemak (g)
                </label>
                <input
                  name="fat"
                  type="number"
                  placeholder="0"
                  value={formData.fat}
                  onChange={handleChange}
                  className="w-full p-3 bg-yellow-50 rounded-xl text-center font-bold text-gray-800 border-transparent focus:border-yellow-500 border-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary-600 uppercase mb-1">
                  Karbo (g)
                </label>
                <input
                  name="carbs"
                  type="number"
                  placeholder="0"
                  value={formData.carbs}
                  onChange={handleChange}
                  className="w-full p-3 bg-primary-50 rounded-xl text-center font-bold text-gray-800 border-transparent focus:border-primary-500 border-2 outline-none"
                />
              </div>
            </div>
          </div>

          {/* --- TOMBOL SUBMIT --- */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
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
