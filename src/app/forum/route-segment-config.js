// This configuration forces dynamic rendering for all forum routes
// The file must be named route-segment-config.js for Next.js to recognize it

// Skip static generation completely for this section
export const dynamic = 'force-dynamic';

// Skip static generation of dynamic route segments
export const dynamicParams = true;

// Don't attempt to statically generate any pages in this section
export function generateStaticParams() {
  return [];
}
