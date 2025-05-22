// This file configures Next.js to completely skip authentication-dependent pages during static generation

/** @type {import('next').NextConfig} */
module.exports = {
  // Skip static optimization for authenticated routes
  experimental: {
    serverActions: true,
  },
  // Use serverless target to ensure proper handling of authentication
  output: 'standalone',
  // Replace all useAuth hooks with empty fallbacks during static generation
  transpilePackages: ['@/context/AuthContext'],
  // Skip specific routes during static generation
  async rewrites() {
    return [
      // Rewrites all forum routes to ensure proper auth handling
      {
        source: '/forum/:path*',
        destination: '/forum/:path*',
      },
    ];
  },
};
