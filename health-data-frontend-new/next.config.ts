import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      encoding: false,
    };
    return config;
  },
  reactStrictMode: true,
};

export default nextConfig;