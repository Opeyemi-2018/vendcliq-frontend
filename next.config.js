// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     unoptimized: true, // Disable image optimization
//     domains: ["api.vendcliq.com"], // Add your image domains here
//   },
//   // Change from export to standalone to support API routes
//   output: "standalone",
//   // Add proper configuration for API routes
//   rewrites: async () => {
//     return [
//       {
//         source: "/api/:path*",
//         destination: "/api/:path*",
//       },
//     ];
//   },
//   // Fix assetPrefix configuration
//   assetPrefix: process.env.NODE_ENV === "production" ? "/" : "",
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image configuration
  images: {
    unoptimized: true, // Disable Next.js image optimization
    domains: ["api.vendcliq.com"], // External image domains (not for /public)
  },

  // Required for custom server / API usage
  output: "standalone",
};

module.exports = nextConfig;
