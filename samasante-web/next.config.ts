import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React compiler optimizations
  reactStrictMode: true,

  // Optimize package imports for faster builds and smaller bundles
  optimizePackageImports: ['lucide-react', '@/components/ui'],

  // Experimental features for better performance
  experimental: {
    // Enable optimistic client cache for faster navigation
    optimisticClientCache: true,
  },
};

export default nextConfig;
