"use client";
import { Home, Calendar, Utensils, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Jadwal", href: "/meals", icon: Calendar },
  { name: "Makanan", href: "/foods", icon: Utensils },
  { name: "Profil", href: "/profile", icon: User },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* --- MOBILE BOTTOM NAV (Tetap Sama) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-6 z-50 h-20 flex justify-between items-start shadow-soft">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-1 w-16"
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-primary-50 text-primary-600 -translate-y-2"
                    : "text-gray-400"
                }`}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] font-medium transition-opacity ${
                  isActive
                    ? "text-primary-700 opacity-100"
                    : "text-gray-400 opacity-0 h-0"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* --- DESKTOP SIDEBAR (Collapsible) --- */}
      <aside className="hidden md:flex flex-col w-20 hover:w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 p-4 z-40 transition-all duration-300 ease-in-out group overflow-hidden shadow-sm hover:shadow-xl">
        {/* Logo Section */}
        <div className="text-2xl font-bold text-primary-600 mb-10 flex items-center gap-3 whitespace-nowrap">
          {/* Ikon Logo (Fixed) */}
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold shadow-md">
            M
          </div>
          {/* Teks Logo (Hidden saat collapse) */}
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
            MealPlan
          </span>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary-50 text-primary-700 font-bold shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                {/* Ikon Menu */}
                <div className="flex-shrink-0">
                  <item.icon size={24} />
                </div>

                {/* Teks Menu (Fade In saat hover) */}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
