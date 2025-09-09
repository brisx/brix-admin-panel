import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // API proxy configuration - Admin APIs on port 3000 (main app)
  async rewrites() {
    return [
      // Admin API endpoints to main app (port 3000)
      {
        source: '/api/:path*',
        destination: 'https://purchase.brixs.live/api/:path*',
      },
    ];
  },

  // Experimental features
  experimental: {
    // Removed deprecated options
  },
  
  // Webpack configuration (simplified for Turbopack compatibility)
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
        ignored: ['**/.git/**', '**/node_modules/**', '**/.next/**'],
      };
    }
    return config;
  },
  
  // Development indicators
  devIndicators: {
    position: 'bottom-left',
  },
  
  // Disable source maps in development
  productionBrowserSourceMaps: false,
  
  // Disable static optimization
  output: 'standalone',
  
  // Disable image optimization in development
  images: {
    disableStaticImages: true,
  },
  
  // Disable TypeScript type checking in development
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
