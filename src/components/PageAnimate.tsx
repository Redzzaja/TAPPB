"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageAnimate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: 20 }} // Mulai dari transparan & geser kanan sedikit
      animate={{ opacity: 1, x: 0 }} // Masuk ke tengah
      exit={{ opacity: 0, x: -20 }} // Keluar ke kiri
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
