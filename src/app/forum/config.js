// This configuration forces dynamic rendering for all forum routes
// to prevent static generation errors with authentication

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// Set revalidation to 0 to always fetch fresh data
export const revalidate = 0;

// Skip static generation entirely for forum routes
export const generateStaticParams = () => {
  return [];
};
