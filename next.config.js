/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  output: 'standalone',
  distDir: '.next',
  poweredByHeader: false,
  reactStrictMode: false,
  experimental: {
    // This is important for handling template variables correctly
    serverComponentsExternalPackages: []
  }
};

module.exports = nextConfig;
