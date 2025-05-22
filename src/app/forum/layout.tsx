// src/app/forum/layout.tsx
'use client';

import React from 'react';

// Metadata that indicates this route should be dynamically rendered
export const dynamic = 'force-dynamic';

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="forum-layout">
      {children}
    </div>
  );
}
