"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { Loader2 } from "lucide-react";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);

  // Ambil URL dari environment variable
  const PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        if (!PROJECT_URL || !ANON_KEY) {
          throw new Error("Supabase URL or Key is missing");
        }

        // 1. Ambil spesifikasi asli dari Supabase
        const res = await fetch(`${PROJECT_URL}/rest/v1/?apikey=${ANON_KEY}`);
        const data = await res.json();

        // 2. Tentukan Host dan BasePath yang bersih
        // Menghapus 'https://' untuk properti 'host' di Swagger 2.0
        const hostUrl = PROJECT_URL.replace("https://", "").replace(
          "http://",
          ""
        );

        // 3. Modifikasi spesifikasi agar sesuai format SWAGGER 2.0 (OAS 2.0)
        const modifiedSpec = {
          ...data,
          // Paksa HTTPS dan Host yang benar
          schemes: ["https"],
          host: hostUrl,
          basePath: "/rest/v1",

          // INJEKSI KEAMANAN (Format Swagger 2.0)
          securityDefinitions: {
            apikey: {
              type: "apiKey",
              name: "apikey",
              in: "header",
              description: "Masukkan Anon Key di sini",
            },
            Bearer: {
              type: "apiKey",
              name: "Authorization",
              in: "header",
              description: "Format: Bearer <access_token>",
            },
          },
          // Terapkan keamanan secara global
          security: [
            {
              apikey: [],
              Bearer: [],
            },
          ],
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {spec && <SwaggerUI spec={spec} />}
    </div>
  );
}
