import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qnuimxmiwigtpqiceazw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/Logos/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
