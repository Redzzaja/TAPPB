"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { Loader2 } from "lucide-react";

// Dynamic import untuk menghindari error SSR
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);

  // Mengambil Env Vars
  const PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        if (!PROJECT_URL || !ANON_KEY) {
          throw new Error("Supabase URL or Key is missing");
        }

        // 1. Fetch spesifikasi mentah dari Supabase
        const res = await fetch(`${PROJECT_URL}/rest/v1/?apikey=${ANON_KEY}`);
        const data = await res.json();

        // 2. Bersihkan URL untuk properti 'host' (Swagger 2.0 tidak menerima protokol di host)
        const hostUrl = PROJECT_URL.replace("https://", "").replace(
          "http://",
          ""
        );

        // 3. Modifikasi Spesifikasi
        const modifiedSpec = {
          ...data,
          swagger: "2.0", // Pastikan versi eksplisit
          schemes: ["https"],
          host: hostUrl,
          basePath: "/rest/v1",

          // --- KONFIGURASI KEAMANAN (Swagger 2.0) ---
          securityDefinitions: {
            apikey: {
              type: "apiKey",
              name: "apikey",
              in: "header",
              description: "Masukkan Anon Key di sini (tanpa prefix)",
            },
            Bearer: {
              type: "apiKey",
              name: "Authorization",
              in: "header",
              description:
                "Masukkan: Bearer <service_role_key> atau <access_token>",
            },
          },
          // Terapkan keamanan global ke semua endpoint
          security: [{ apikey: [], Bearer: [] }],

          // --- MODIFIKASI PATHS ---
          paths: {
            ...data.paths,

            // 4. Custom DELETE pada endpoint '/foods'
            // Kita menimpa atau menambahkan method DELETE di path utama
            "/foods": {
              ...data.paths["/foods"], // Pertahankan GET/POST bawaan

              delete: {
                tags: ["foods"],
                summary: "Hapus Makanan (By ID)",
                description:
                  "Menghapus data makanan. Wajib menggunakan filter query.",
                produces: ["application/json"],
                parameters: [
                  {
                    name: "id",
                    in: "query", // Query param, BUKAN path
                    required: true,
                    type: "string",
                    description:
                      "Filter ID yang akan dihapus. Format wajib: eq.<UUID>",
                    default: "eq.",
                  },
                ],
                responses: {
                  "204": { description: "No Content (Berhasil Dihapus)" },
                  "400": { description: "Bad Request (Salah format filter)" },
                  "401": { description: "Unauthorized (Butuh Token/Key)" },
                  "404": { description: "Not Found" },
                },
              },
            },
          },
        };

        setSpec(modifiedSpec);
      } catch (err) {
        console.error("Gagal memuat API Docs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpec();
  }, [PROJECT_URL, ANON_KEY]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {spec ? (
        <SwaggerUI spec={spec} />
      ) : (
        <div className="p-10 text-center text-red-500">
          Gagal memuat dokumentasi API. Periksa console untuk detail.
        </div>
      )}
    </div>
  );
}
