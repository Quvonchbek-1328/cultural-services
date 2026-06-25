import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev rejimida ngrok (yoki boshqa tunnel) orqali _next/* resurslariga
  // cross-origin so'rovlarga ruxsat berish.
  allowedDevOrigins: ["*.ngrok-free.dev", "*.ngrok-free.app", "*.ngrok.io"],
  // Og'ir kutubxonalardan faqat ishlatilgan modullarni import qilish (tezroq
  // kompilyatsiya va kichikroq bundle).
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
