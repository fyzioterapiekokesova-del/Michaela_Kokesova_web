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
