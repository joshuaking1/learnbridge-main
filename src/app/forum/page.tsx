// src/app/forum/page.tsx
'use client';

// Force dynamic rendering to prevent static generation errors with auth
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import ForumCategories from '@/components/forum/ForumCategories';
import ForumBotInterface from '@/components/forum/ForumBotInterface';

export default function ForumPage() {
  const [isClient, setIsClient] = useState(false);
  
  // Use useEffect to determine if we're running on client side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // If we're still server-side or statically generating, show a loading skeleton
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-6">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 rounded w-1/3 mb-6 mx-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If we're on the client, render the actual component
  return <ClientSideContent />;
}

// Actual content that will only be loaded on the client side where auth is available
const ClientSideContent = () => {
  const [isBotMinimized, setIsBotMinimized] = useState(true);
  
  // Safely import authentication only on client side
  const auth = require('@/context/AuthContext');
  const { user } = auth.useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6 px-4">
          <h1 className="text-3xl font-bold text-gray-800">LearnBridge Forum</h1>
          
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search forums..."
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
              Search
            </button>
          </div>
        </div>
        
        <ForumCategories />
      </div>
      
      {/* Forum Bot Interface */}
      <ForumBotInterface 
        isMinimized={isBotMinimized}
        onToggleMinimize={() => setIsBotMinimized(!isBotMinimized)}
      />
    </div>
  );
}
