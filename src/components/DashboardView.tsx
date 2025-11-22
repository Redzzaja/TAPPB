"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Activity, Flame, Utensils } from "lucide-react";
import Link from "next/link";

const TARGETS = {
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 70,
};

export default function DashboardView({ user }: { user: any }) {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [recentMeals, setRecentMeals] = useState<any[]>([]);

  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;
    const filterMessage = (msg: any) => {
      if (
        typeof msg === "string" &&
        msg.includes(
          "The width(-1) and height(-1) of chart should be greater than 0"
        )
      )
        return true;
      return false;
    };
    console.warn = (...args) => {
      if (filterMessage(args[0])) return;
      originalWarn.call(console, ...args);
    };
    console.error = (...args) => {
      if (filterMessage(args[0])) return;
      originalError.call(console, ...args);
    };

    setIsMounted(true);
    fetchTodayData();

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  const fetchTodayData = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data: meals } = await supabase
      .from("meal_plans")
      .select("*, foods(*)")
      .eq("user_id", user.id)
      .eq("date", today)
      .order("created_at", { ascending: false });

    if (meals) {
      const stats = meals.reduce(
        (acc, curr) => {
          const food = curr.foods;
          return {
            calories: acc.calories + (food?.calories || 0),
            protein: acc.protein + (food?.protein || 0),
            carbs: acc.carbs + (food?.carbs || 0),
            fat: acc.fat + (food?.fat || 0),
          };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      setTodayStats(stats);
      setRecentMeals(meals);
    }
    setLoading(false);
  };

  const currentCal = todayStats.calories || 0;
  const caloriePercentage =
    Math.min((currentCal / TARGETS.calories) * 100, 100) || 0;

  const chartData = [
    { name: "Calories", value: caloriePercentage, fill: "#84cc16" },
  ];
  const macroData = [
    { name: "Pro", current: todayStats.protein || 0, target: TARGETS.protein },
    { name: "Carb", current: todayStats.carbs || 0, target: TARGETS.carbs },
    { name: "Fat", current: todayStats.fat || 0, target: TARGETS.fat },
  ];

  if (loading)
    return <div className="p-10 text-center text-gray-400">Memuat data...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Halo, {user.email?.split("@")[0]}!
          </h1>
          <p className="text-gray-500 text-sm">
            Ini ringkasan nutrisimu hari ini.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-gray-400 font-bold uppercase">Tanggal</p>
          <p className="text-gray-800 font-semibold">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* --- GRID GRAFIK --- */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* KARTU KALORI */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden min-w-0">
          <h3 className="text-gray-500 font-bold text-sm absolute top-6 left-6 flex items-center gap-2">
            <Flame size={18} className="text-orange-500" /> Kalori Harian
          </h3>
          <div className="w-full relative mt-4" style={{ height: 250 }}>
            {isMounted && (
              <ResponsiveContainer width="99%" height="100%" minWidth={0}>
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  barSize={20}
                  data={chartData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-gray-800">
                {currentCal}
              </span>
              <span className="text-xs text-gray-400">
                / {TARGETS.calories} Kcal
              </span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400">
            {currentCal > TARGETS.calories
              ? "⚠️ Melebihi target!"
              : "Pertahankan, masih aman!"}
          </p>
        </div>

        {/* KARTU MAKRO */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 min-w-0">
          <h3 className="text-gray-500 font-bold text-sm mb-6 flex items-center gap-2">
            <Activity size={18} className="text-blue-500" /> Makro Nutrisi
          </h3>
          <div className="w-full" style={{ height: 180 }}>
            {isMounted && (
              <ResponsiveContainer width="99%" height="100%" minWidth={0}>
                <BarChart
                  data={macroData}
                  layout="vertical"
                  margin={{ left: 0, right: 20 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={40}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="target"
                    fill="#f3f4f6"
                    barSize={12}
                    stackId="a"
                    radius={[0, 6, 6, 0]}
                  />
                  <Bar
                    dataKey="current"
                    fill="#84cc16"
                    barSize={12}
                    stackId="b"
                    radius={[6, 0, 0, 6]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-between mt-4 px-2 border-t border-gray-50 pt-4">
            <div className="text-center">
              <p className="text-xs text-gray-400">Protein</p>
              <p className="font-bold text-gray-800">
                {todayStats.protein || 0}g
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Karbo</p>
              <p className="font-bold text-gray-800">
                {todayStats.carbs || 0}g
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Lemak</p>
              <p className="font-bold text-gray-800">{todayStats.fat || 0}g</p>
            </div>
          </div>
        </div>
      </div>

      {/* MENU HARI INI */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Dimakan Hari Ini</h2>
          <Link
            href="/meals"
            className="text-primary-600 text-sm font-bold hover:underline"
          >
            Lihat Semua
          </Link>
        </div>
        {recentMeals.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
            <Utensils className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="text-gray-500 text-sm">
              Belum ada makanan yang dicatat hari ini.
            </p>
            <Link
              href="/foods"
              className="inline-block mt-3 text-xs font-bold text-primary-600 bg-primary-50 px-4 py-2 rounded-full hover:bg-primary-100"
            >
              + Tambah Makan
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {recentMeals.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`w-2 h-8 rounded-full shrink-0 ${
                      item.meal_type === "Breakfast"
                        ? "bg-orange-400"
                        : item.meal_type === "Lunch"
                        ? "bg-primary-500"
                        : "bg-blue-500"
                    }`}
                  ></div>
                  <div className="truncate">
                    <p className="font-bold text-gray-800 truncate">
                      {item.foods?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.meal_type} • {item.foods?.calories} kcal
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded-lg shrink-0">
                  {item.foods?.protein}g Pro
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
