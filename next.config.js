/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Disable image optimization
    domains: ["api.vendcliq.com"], // Add your image domains here
  },
  // Change from export to standalone to support API routes
  output: "standalone",
  // Add proper configuration for API routes
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
  // Fix assetPrefix configuration
  assetPrefix: process.env.NODE_ENV === "production" ? "/" : "",

  // Add this section for OpenTelemetry support
  serverExternalPackages: [
    "@opentelemetry/sdk-node",
    "@opentelemetry/auto-instrumentations-node",
    "@opentelemetry/exporter-trace-otlp-http",
    "@opentelemetry/exporter-metrics-otlp-http",
    "@opentelemetry/exporter-logs-otlp-http",
    "@opentelemetry/sdk-metrics",
    "@opentelemetry/sdk-logs",
    "@opentelemetry/resources",
    "@opentelemetry/semantic-conventions",
  ],
};

module.exports = nextConfig;
