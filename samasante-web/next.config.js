/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React strict mode for better development experience
    reactStrictMode: true,

    // Optimize images
    images: {
        domains: ['localhost'],
        formats: ['image/avif', 'image/webp'],
    },

    // Compiler optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Experimental features for better performance
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },

    // Enable SWC minification (faster than Terser)
    swcMinify: true,

    // Optimize production builds
    productionBrowserSourceMaps: false,

    // Reduce bundle size
    modularizeImports: {
        'lucide-react': {
            transform: 'lucide-react/dist/esm/icons/{{member}}',
        },
    },

    // Fix chunked encoding errors in development
    webpack: (config, { dev, isServer }) => {
        if (dev && !isServer) {
            config.optimization.runtimeChunk = false
            config.optimization.splitChunks = false
        }
        return config
    },
}

module.exports = nextConfig
