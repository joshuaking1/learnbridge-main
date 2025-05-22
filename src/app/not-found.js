// Configuration to disable static optimization for the entire app
// to prevent auth context errors during build

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  );
}
