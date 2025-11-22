import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: "export",

  // 👇 TAMBAHKAN INI (PENTING UNTUK MOBILE/CAPACITOR)
  trailingSlash: true,

  turbopack: {},
  images: {
    unoptimized: true, // Wajib true untuk static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "othzuhusunaizkuswnxu.supabase.co",
      },
    ],
  },
};

export default withPWA(nextConfig);
