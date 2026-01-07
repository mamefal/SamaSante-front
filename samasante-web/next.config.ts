/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React compiler optimizations
  reactStrictMode: true,

  // Disable ESLint during builds (errors are shown in dev mode)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.samasante.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.samasante.com',
      },
    ],
  },

  // Standalone output for Docker
  output: 'standalone',

  // Compression
  compress: true,

  // PWA Configuration (commented out, uncomment to enable)
  // Requires: npm install next-pwa
  /*
  // This block is typically used to wrap the nextConfig object,
  // e.g., module.exports = withPWA(nextConfig);
  // Placing it directly inside nextConfig as a spread will cause a syntax error.
  // If you intend to use PWA, uncomment the `withPWA` wrapper at the end of the file
  // and ensure `next-pwa` is installed.
  ...withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  }),
  */

  // Proxy API requests to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*'
      }
    ]
  },

  // Allow dev access from network IP
  allowedDevOrigins: ['http://192.168.1.20:3001'],


  // Experimental features for better performance
  experimental: {
    // Enable optimistic client cache for faster navigation
    optimisticClientCache: true,
    optimizePackageImports: ['lucide-react', '@/components/ui'],
  },

  // Fix workspace root detection warning
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;

// PWA Configuration (optional - uncomment when ready)
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development',
// })
// module.exports = withPWA(nextConfig)
