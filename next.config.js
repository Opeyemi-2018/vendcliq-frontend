/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Disable image optimization
    domains: ['api.vendcliq.com'], // Add your image domains here
  },
  // Change from export to standalone to support API routes
  output: 'standalone',
  // Add proper configuration for API routes
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Fix assetPrefix configuration
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : ''
}

module.exports = nextConfig 