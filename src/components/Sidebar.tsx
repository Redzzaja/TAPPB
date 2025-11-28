"use client";

import Link from "next/link";
import {
  Home as HomeIcon,
  CalendarDays,
  Utensils,
  UserCircle,
  LogIn,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// --- NAV ITEM COMPONENT ---
interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isMobile?: boolean;
}

function NavItem({ href, icon, label, isMobile = false }: NavItemProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  if (isMobile) {
    return (
      <Link
        href={href}
        className={`flex flex-col items-center gap-1 w-16 py-1 rounded-xl transition-all duration-300
          ${isActive ? "text-primary-600" : "text-gray-400"}`}
      >
        <div
          className={`p-1.5 rounded-xl ${
            isActive ? "bg-primary-50 -translate-y-1" : ""
          } transition-transform`}
        >
          {icon}
        </div>
        <span
          className={`text-[10px] font-medium ${
            isActive ? "opacity-100 font-bold" : "opacity-60"
          }`}
        >
          {label}
        </span>
      </Link>
    );
  }

  // DESKTOP STYLE (Collapsible Logic)
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 py-3 px-4 rounded-2xl transition-all duration-200 group/item relative overflow-hidden
        ${
          isActive
            ? "bg-primary-500 text-white shadow-md shadow-primary-200"
            : "text-gray-500 hover:bg-primary-50 hover:text-primary-600"
        }`}
    >
      {/* Icon tetap diam */}
      <div
        className={`shrink-0 ${
          isActive
            ? "text-white"
            : "text-gray-400 group-hover/item:text-primary-500"
        } transition-colors`}
      >
        {icon}
      </div>

      {/* Label dengan Fade In/Out */}
      <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 -translate-x-2.5 group-hover:translate-x-0">
        {label}
      </span>
    </Link>
  );
}

// --- MAIN SIDEBAR COMPONENT ---
export default function Sidebar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === "SIGNED_OUT") router.refresh();
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* --- 1. DESKTOP SIDEBAR (Collapsible) --- */}
      {/* w-20 (80px) saat diam, w-[280px] saat hover */}
      <aside className="hidden md:flex flex-col w-20 hover:w-[280px] fixed inset-y-0 left-0 bg-white border-r border-gray-100 z-50 px-3 py-8 transition-all duration-300 ease-in-out group shadow-sm hover:shadow-2xl overflow-hidden peer">
        {/* Logo */}
        <div className="flex items-center gap-4 px-2 mb-10 whitespace-nowrap">
          <div className="w-10 h-10 bg-linear-to-br from-primary-400 to-primary-600 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-200">
            M
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            MealPlan
          </span>
        </div>

        {/* Menu */}
        <nav className="grow space-y-2">
          <NavItem href="/" icon={<HomeIcon size={22} />} label="Beranda" />
          <NavItem
            href="/meals"
            icon={<CalendarDays size={22} />}
            label="Jadwal"
          />
          <NavItem
            href="/foods"
            icon={<Utensils size={22} />}
            label="Makanan"
          />
        </nav>

        {/* User Footer */}
        <div className="pt-6 border-t border-gray-100 mt-auto whitespace-nowrap overflow-hidden">
          {loading ? (
            <div className="flex items-center gap-4 px-2 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
              <div className="h-4 w-20 bg-gray-200 rounded opacity-0 group-hover:opacity-100"></div>
            </div>
          ) : user ? (
            <div className="space-y-1">
              <NavItem
                href="/profile"
                icon={<UserCircle size={22} />}
                label="Profil"
              />
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 py-3 px-4 rounded-2xl text-red-500 hover:bg-red-50 w-full text-left transition-all duration-200 group/logout"
              >
                <div className="shrink-0">
                  <LogIn size={22} />
                </div>
                <span className="font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 -translate-x-2.5 group-hover:translate-x-0">
                  Keluar
                </span>
              </button>
            </div>
          ) : (
            <NavItem href="/login" icon={<LogIn size={22} />} label="Masuk" />
          )}
        </div>
      </aside>

      {/* --- 2. MOBILE BOTTOM NAV (Tetap) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-6 z-50 h-20 flex justify-between items-start shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <NavItem
          isMobile
          href="/"
          icon={<HomeIcon size={24} />}
          label="Beranda"
        />
        <NavItem
          isMobile
          href="/meals"
          icon={<CalendarDays size={24} />}
          label="Jadwal"
        />
        <NavItem
          isMobile
          href="/foods"
          icon={<Utensils size={24} />}
          label="Makanan"
        />
        <NavItem
          isMobile
          href={user ? "/profile" : "/login"}
          icon={user ? <UserCircle size={24} /> : <LogIn size={24} />}
          label={user ? "Profil" : "Masuk"}
        />
      </nav>
    </>
  );
}
