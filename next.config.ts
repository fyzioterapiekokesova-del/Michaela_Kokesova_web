import type { NextConfig } from "next";

/**
 * Fotky se nahrávají do úložiště Supabase, takže `next/image` musí vědět,
 * že se z té domény smí načítat. Dokud proměnná není vyplněná, seznam zůstane
 * prázdný a web běží bez fotek.
 */
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  /**
   * Fotky se nahrávají Server Action a ta má ve výchozím stavu strop 1 MB.
   * Běžná fotka z telefonu je větší, takže nahrávání padalo dřív, než se
   * vůbec spustil náš kód — a člověk viděl obecnou chybu místo vysvětlení.
   *
   * Strop je schválně nad našich 5 MB (`MAX_BAJTU` v lib/admin/obrazky.ts),
   * aby větší soubor odmítla naše kontrola svou hláškou, ne framework.
   */
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
