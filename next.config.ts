import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Sin el indicador flotante de Next en dev: tapa la UI durante la demo.
  devIndicators: false,
  async headers() {
    // CSP sugerida para producción (probar primero en modo report-only; Next y Leaflet usan estilos/scripts inline):
    // Content-Security-Policy-Report-Only: default-src 'self'; img-src 'self' data: https://*.tile.openstreetmap.org;
    //   style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
