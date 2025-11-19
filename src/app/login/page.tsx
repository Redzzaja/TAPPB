"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle antara Login/Daftar
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let error;

    if (isSignUp) {
      // Logika Daftar
      const res = await supabase.auth.signUp({ email, password });
      error = res.error;
    } else {
      // Logika Login
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
    }

    if (error) {
      alert(error.message);
    } else {
      // Berhasil
      router.refresh();
      router.push("/profile"); // Arahkan ke profile setelah login
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 pb-20">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo & Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isSignUp ? "Buat Akun" : "Selamat Datang"}
          </h2>
          <p className="text-gray-500 mt-2">
            {isSignUp
              ? "Mulai hidup sehatmu hari ini"
              : "Masuk untuk melihat jadwal makanmu"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <Mail
                className="absolute left-4 top-3.5 text-gray-400"
                size={20}
              />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="relative">
              <Lock
                className="absolute left-4 top-3.5 text-gray-400"
                size={20}
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-primary-700 disabled:opacity-70 flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : isSignUp ? (
              "Daftar Sekarang"
            ) : (
              "Masuk"
            )}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <p className="text-center text-gray-600 text-sm">
          {isSignUp ? "Sudah punya akun? " : "Belum punya akun? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-primary-600 hover:underline"
          >
            {isSignUp ? "Login di sini" : "Daftar di sini"}
          </button>
        </p>
      </div>
    </div>
  );
}
