// src/app/forum/not-found.tsx
'use client';

import Link from 'next/link';

export default function ForumNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Forum Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          The forum page you're looking for couldn't be found. It may have been moved or deleted.
        </p>
        <Link 
          href="/forum"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-colors"
        >
          Go to Forum Home
        </Link>
      </div>
    </div>
  );
}
