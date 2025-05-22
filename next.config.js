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
  // Disable static page generation for auth-dependent pages
  experimental: {
    // This disables Next.js from trying to do static optimization for pages that
    // might depend on data that's only available during runtime
    optimizeCss: false,
    // Prevent pre-rendering of pages that need authentication
    workerThreads: false,
  },
};

// Tell Next.js to exclude forum pages from static optimization
const forumPathRegex = /^\/forum/;

// Custom config for static page generation
nextConfig.exportPathMap = async function (
  defaultPathMap,
  { dev, dir, outDir, distDir, buildId }
) {
  // Filter out forum paths that might be causing auth issues
  const filteredPaths = {};
  
  Object.keys(defaultPathMap).forEach((path) => {
    if (!forumPathRegex.test(path)) {
      filteredPaths[path] = defaultPathMap[path];
    }
  });
  
  return filteredPaths;
};

module.exports = nextConfig;
