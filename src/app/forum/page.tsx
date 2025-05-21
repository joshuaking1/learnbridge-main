// src/app/forum/page.tsx
'use client';

import React, { useState } from 'react';
import ForumCategories from '@/components/forum/ForumCategories';
import ForumBotInterface from '@/components/forum/ForumBotInterface';
import { useAuth } from '@/context/AuthContext';

export default function ForumPage() {
  const [isBotMinimized, setIsBotMinimized] = useState(true);
  const { user } = useAuth();

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
