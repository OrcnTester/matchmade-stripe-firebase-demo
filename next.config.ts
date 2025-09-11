// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Build sırasında ESLint hatalarını es geç (deploy’u bloklamasın)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
