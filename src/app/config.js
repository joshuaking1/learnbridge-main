// Global configuration for the entire app
// This ensures pages with authentication are handled correctly during build

// This tells Next.js to always render these routes on-demand, not at build time
export const dynamic = 'force-dynamic';

// This ensures no page pre-rendering attempts happen during build for auth pages
export const dynamicParams = true;
