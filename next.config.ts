import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "yvegncpmgbwwjstxrmbi.supabase.co",
      },
    ],
  },
};

export default nextConfig;
