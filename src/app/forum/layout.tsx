// src/app/forum/layout.tsx
'use client';

import React from 'react';

// Skip all forum pages during static generation
export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="forum-layout">
      {children}
    </div>
  );
}
