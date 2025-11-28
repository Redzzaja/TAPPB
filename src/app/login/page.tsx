"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, ArrowRight, UserCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let error;

    if (isSignUp) {
      const res = await supabase.auth.signUp({ email, password });
      error = res.error;
    } else {
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
    }

    if (error) {
      alert(error.message);
    } else {
      router.refresh();
      router.push("/profile");
    }
    setLoading(false);
  };

  // Handler Tamu
  const handleGuestLogin = () => {
    router.push("/"); // Langsung ke Home
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 pb-20">
      <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-3xl shadow-soft">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isSignUp ? "Buat Akun" : "Selamat Datang"}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Meal Planner Mingguan Anda
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <Mail
                className="absolute left-4 top-3.5 text-gray-400 group-hover:text-primary-500 transition"
                size={20}
              />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary-500 focus:bg-white transition outline-none"
              />
            </div>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-3.5 text-gray-400 group-hover:text-primary-500 transition"
                size={20}
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary-500 focus:bg-white transition outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-primary-700 hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : isSignUp ? (
              "Daftar"
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="grow border-t border-gray-200"></div>
          <span className="shrink-0 mx-4 text-gray-400 text-xs">ATAU</span>
          <div className="grow border-t border-gray-200"></div>
        </div>

        {/* Tombol Tamu */}
        <button
          onClick={handleGuestLogin}
          className="w-full bg-gray-100 text-gray-600 font-bold py-3.5 rounded-2xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
        >
          <UserCircle size={20} />
          Masuk sebagai Tamu
        </button>

        <p className="text-center text-gray-600 text-sm mt-4">
          {isSignUp ? "Sudah punya akun? " : "Belum punya akun? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-primary-600 hover:underline"
          >
            {isSignUp ? "Login" : "Daftar"}
          </button>
        </p>
      </div>
    </div>
  );
}
