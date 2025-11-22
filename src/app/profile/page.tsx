"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LogOut,
  User,
  Settings,
  Bell,
  ChevronRight,
  X,
  Save,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State untuk Fitur
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        // Ambil nama dari metadata jika ada
        setFullName(session.user.user_metadata?.full_name || "");
      }
      setLoading(false);
    };

    getUser();

    // Cek izin notifikasi saat ini
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifEnabled(Notification.permission === "granted");
    }
  }, [router]);

  // --- FUNGSI 1: UPDATE PROFIL (Nama Lengkap) ---
  const handleUpdateProfile = async () => {
    if (!fullName.trim()) return;
    setSaving(true);

    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (error) {
      toast.error("Gagal memperbarui profil", { description: error.message });
    } else {
      toast.success("Profil diperbarui!");
      setUser(data.user); // Update state lokal
      setIsEditModalOpen(false);
    }
    setSaving(false);
  };

  // --- FUNGSI 2: TOGGLE NOTIFIKASI ---
  const handleToggleNotification = async () => {
    if (!("Notification" in window)) {
      toast.error("Browser ini tidak mendukung notifikasi.");
      return;
    }

    if (notifEnabled) {
      setNotifEnabled(false);
      toast.info("Notifikasi dinonaktifkan.");
    } else {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotifEnabled(true);
        toast.success("Notifikasi diaktifkan!", {
          description: "Kami akan mengingatkan jadwal makanmu.",
        });
        new Notification("Halo Foodie!", {
          body: "Notifikasi Meal Planner aktif.",
        });
      } else {
        toast.warning("Izin notifikasi ditolak. Cek pengaturan browser.");
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-400">Memuat profil...</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 space-y-6">
      {/* --- 1. HEADER PROFIL --- */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-600 shadow-inner border-4 border-white">
            <User size={40} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {user?.user_metadata?.full_name || "Halo, Foodie!"}
            </h1>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-wide rounded-full">
              Member Free
            </span>
          </div>
        </div>
      </div>

      {/* --- 2. MENU PENGATURAN --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {/* Edit Nama */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition text-left active:bg-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Settings size={20} />
              </div>
              <span className="font-medium text-gray-700">
                Ubah Nama Lengkap
              </span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          {/* Toggle Notifikasi */}
          <div className="w-full flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Bell size={20} />
              </div>
              <span className="font-medium text-gray-700">
                Notifikasi Makan
              </span>
            </div>

            <button
              onClick={handleToggleNotification}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                notifEnabled ? "bg-primary-500" : "bg-gray-200"
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                  notifEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      {/* --- 3. TOMBOL LOGOUT --- */}
      <button
        onClick={handleLogout}
        className="w-full bg-white border-2 border-red-50 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-100 transition shadow-sm active:scale-95"
      >
        <LogOut size={20} />
        Keluar Aplikasi
      </button>

      <p className="text-center text-xs text-gray-300 pt-4">
        Versi Aplikasi 2.2.0 (Build 2025)
      </p>

      {/* --- MODAL EDIT PROFIL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Edit Profil</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama..."
                  className="w-full p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-primary-500 focus:bg-white outline-none font-medium"
                />
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-primary-700 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Save size={18} /> Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
