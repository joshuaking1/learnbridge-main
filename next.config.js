/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  distDir: ".next",
  poweredByHeader: false,
  reactStrictMode: false,
  images: {
    domains: ["img.clerk.com", "images.clerk.dev"],
  },
  // Configure dynamic rendering for the App Router
  experimental: {
    optimizeCss: false,
  },
  // Correct property for external packages in Next.js 15.2.4
  serverExternalPackages: [],
};

module.exports = nextConfig;
