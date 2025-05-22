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
  // Special configuration for authenticated pages
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

module.exports = nextConfig;
