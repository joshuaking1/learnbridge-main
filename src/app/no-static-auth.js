// Special configuration file to disable static generation for authenticated routes
// Using this pattern recommended by Next.js core team for auth-dependent pages

// Setting dynamic to 'force-dynamic' tells Next.js to always render these pages at request time
export const dynamic = 'force-dynamic';

// By re-exporting this from authenticated page folders, those pages won't be statically generated
