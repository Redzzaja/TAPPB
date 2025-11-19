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
      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-6 z-50 h-20 flex justify-between items-start shadow-soft">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
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

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 p-6 z-40">
        <div className="text-2xl font-bold text-primary-600 mb-10 flex items-center gap-2">
          {/* Logo Icon */}
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
            M
          </div>
          MealPlan
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary-50 text-primary-700 font-bold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
