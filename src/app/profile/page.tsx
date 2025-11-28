"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
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

// --- IMPORT CAPACITOR NOTIFICATIONS ---
import { LocalNotifications } from "@capacitor/local-notifications";

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser, loading } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (user) setFullName(user.user_metadata?.full_name || "");

    // Cek status izin notifikasi saat load
    checkPermission();
  }, [user, loading, router]);

  // Fungsi Cek Izin
  const checkPermission = async () => {
    const status = await LocalNotifications.checkPermissions();
    setNotifEnabled(status.display === "granted");
  };

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });
    if (error) {
      toast.error("Gagal update profil");
    } else {
      toast.success("Profil diperbarui!");
      await refreshUser();
      setIsEditModalOpen(false);
    }
    setSaving(false);
  };

  // --- FUNGSI BARU UNTUK NOTIFIKASI ---
  const handleToggleNotification = async () => {
    if (notifEnabled) {
      // Matikan notifikasi (sebenarnya hanya membatalkan jadwal)
      // Di mobile, kita tidak bisa 'mencabut' izin via kode, user harus ke settings.
      // Jadi kita hanya membatalkan notifikasi yang terjadwal.
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
      setNotifEnabled(false);
      toast.info("Pengingat makan dimatikan.");
    } else {
      // Minta Izin
      const result = await LocalNotifications.requestPermissions();
      if (result.display === "granted") {
        setNotifEnabled(true);

        // Jadwalkan Notifikasi Percobaan (5 detik dari sekarang)
        await LocalNotifications.schedule({
          notifications: [
            {
              title: "Pengingat Makan Aktif! 🍽️",
              body: "Kami akan mengingatkanmu untuk makan sehat.",
              id: 1,
              schedule: { at: new Date(Date.now() + 5000) }, // Muncul 5 detik lagi
              sound: undefined,
              attachments: undefined,
              actionTypeId: "",
              extra: null,
            },
          ],
        });

        toast.success("Notifikasi diaktifkan!", {
          description: "Tes notifikasi akan muncul dalam 5 detik.",
        });
      } else {
        toast.warning("Izin notifikasi ditolak.");
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await refreshUser();
    router.push("/login");
  };

  if (loading)
    return <div className="p-10 text-center text-gray-400">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 space-y-6">
      {/* ... (Bagian Header Profil SAMA seperti sebelumnya) ... */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-linear-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-600 shadow-inner border-4 border-white">
            <User size={40} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {user?.user_metadata?.full_name || "Foodie"}
            </h1>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-wide rounded-full">
              Member
            </span>
          </div>
        </div>
      </div>

      {/* Menu Pengaturan */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
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

          <div className="w-full flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Bell size={20} />
              </div>
              <span className="font-medium text-gray-700">
                Notifikasi Makan
              </span>
            </div>
            {/* Tombol Toggle Notifikasi */}
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

      <button
        onClick={handleLogout}
        className="w-full bg-white border-2 border-red-50 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-100 transition shadow-sm active:scale-95"
      >
        <LogOut size={20} /> Keluar Aplikasi
      </button>

      {/* ... (Modal Edit Profil SAMA seperti sebelumnya) ... */}
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
