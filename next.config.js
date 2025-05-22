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
    serverComponentsExternalPackages: [],
    optimizeCss: false,
  },
};

module.exports = nextConfig;
