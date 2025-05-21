// src/app/forum/thread/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { enhancedForumService, Thread, Post } from '@/services/enhancedForumService';
import { useAuth } from '@/context/AuthContext';
import ThreadDisplay from '@/components/forum/ThreadDisplay';
import ForumBotInterface from '@/components/forum/ForumBotInterface';

export default function ThreadPage() {
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBotMinimized, setIsBotMinimized] = useState(true);
  const { getToken } = useAuth();
  const params = useParams();
  const router = useRouter();
  const threadId = params.id as string;

  useEffect(() => {
    if (threadId) {
      loadThreadAndPosts();
    }
  }, [threadId]);

  const loadThreadAndPosts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }
      
      // Load thread and posts in parallel
      const [threadData, postsData] = await Promise.all([
        enhancedForumService.getThreadById(token, threadId),
        enhancedForumService.getPostsByThread(token, threadId),
      ]);
      
      setThread(threadData);
      setPosts(postsData.posts || []);
    } catch (err) {
      console.error('Error loading thread data:', err);
      setError('Failed to load thread data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !thread) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-8"></div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-gray-300 rounded-full mr-3"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-center">
        <div className="max-w-lg mx-auto bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadThreadAndPosts}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        {/* Breadcrumb */}
        {thread && (
          <nav className="mb-4 text-sm">
            <ol className="flex flex-wrap space-x-2">
              <li>
                <Link href="/forum" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Forum
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li>
                <Link href={`/forum/category/${thread.categoryId}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                  Category
                </Link>
              </li>
              <li className="text-gray-500">/</li>
              <li className="text-gray-700 font-medium truncate max-w-[250px]">{thread.title}</li>
            </ol>
          </nav>
        )}

        {/* Thread Display */}
        {thread && (
          <ThreadDisplay 
            threadId={threadId} 
            initialThread={thread} 
            initialPosts={posts} 
          />
        )}
      </div>
      
      {/* Forum Bot Interface */}
      <ForumBotInterface 
        isMinimized={isBotMinimized}
        onToggleMinimize={() => setIsBotMinimized(!isBotMinimized)}
        threadId={threadId}
      />
    </div>
  );
}
