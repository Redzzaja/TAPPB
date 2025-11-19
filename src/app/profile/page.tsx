"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek sesi saat ini
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login"); // Kalau belum login, tendang ke halaman login
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>

      {/* Kartu User */}
      <div className="bg-white p-6 rounded-3xl shadow-soft flex items-center gap-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
          <User size={32} />
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase font-bold">
            Akun Aktif
          </p>
          <p className="font-bold text-gray-800 text-lg truncate max-w-[200px]">
            {user?.email}
          </p>
        </div>
      </div>

      {/* Tombol Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition"
      >
        <LogOut size={20} />
        Keluar (Logout)
      </button>
    </div>
  );
}
