// src/app/forum/category/[id]/page.tsx
'use client';

// Force dynamic rendering to prevent static generation errors with auth
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { enhancedForumService, Thread, ForumCategory } from '@/services/enhancedForumService';
import { useAuth } from '@/context/AuthContext';
import ForumBotInterface from '@/components/forum/ForumBotInterface';
import ThreadTags from '@/components/forum/ThreadTags';

export default function CategoryPage() {
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBotMinimized, setIsBotMinimized] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAnsweredOnly, setShowAnsweredOnly] = useState(false);
  const { getToken, user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  useEffect(() => {
    if (categoryId) {
      loadCategoryAndThreads();
    }
  }, [categoryId, selectedTags, showAnsweredOnly]);

  const loadCategoryAndThreads = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }
      
      // Load category and threads in parallel
      const [categoryData, threadsData] = await Promise.all([
        enhancedForumService.getCategoryById(token, categoryId),
        enhancedForumService.getThreadsByCategory(token, categoryId, {
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          answered: showAnsweredOnly || undefined,
        }),
      ]);
      
      setCategory(categoryData);
      setThreads(threadsData);
    } catch (err) {
      console.error('Error loading category data:', err);
      setError('Failed to load category data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreateNewThread = () => {
    router.push(`/forum/create?categoryId=${categoryId}`);
  };

  // Collect all unique tags from threads
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    threads.forEach(thread => {
      thread.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [threads]);

  if (isLoading && !category) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-10"></div>
            
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-md">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
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
            onClick={loadCategoryAndThreads}
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
        <nav className="mb-4 text-sm">
          <ol className="flex space-x-2">
            <li>
              <Link href="/forum" className="text-blue-600 hover:text-blue-800 transition-colors">
                Forum
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-700 font-medium">{category?.name || 'Category'}</li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{category?.name}</h1>
              {category?.description && (
                <p className="text-gray-600 mt-2">{category.description}</p>
              )}
            </div>
            
            <button
              onClick={handleCreateNewThread}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Thread
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-gray-700 font-medium mb-2">Filter by tags:</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAnsweredOnly}
                  onChange={() => setShowAnsweredOnly(!showAnsweredOnly)}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Answered only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Thread List */}
        <div className="space-y-4">
          {threads.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No threads found</h3>
              <p className="text-gray-600 mb-4">
                {selectedTags.length > 0 || showAnsweredOnly
                  ? 'Try adjusting your filters to see more results.'
                  : 'Be the first to start a discussion in this category!'}
              </p>
              {(selectedTags.length === 0 && !showAnsweredOnly) && (
                <button
                  onClick={handleCreateNewThread}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New Thread
                </button>
              )}
            </div>
          ) : (
            threads.map(thread => (
              <div key={thread.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/forum/thread/${thread.id}`}>
                  <div className="p-6">
                    <div className="flex justify-between">
                      <h2 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                        {thread.title}
                      </h2>
                      <div className="flex items-center space-x-2">
                        {thread.isPinned && (
                          <span title="Pinned thread" className="text-yellow-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2H5V5zm6 1a1 1 0 10-2 0 1 1 0 002 0zM5 9h10a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" />
                            </svg>
                          </span>
                        )}
                        {thread.isLocked && (
                          <span title="Locked thread" className="text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                        {thread.isAnswered && (
                          <span title="Answered thread" className="text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span>Posted by {thread.authorId}</span>
                      <span className="mx-2">u2022</span>
                      <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                      <span className="mx-2">u2022</span>
                      <span>{thread.views} views</span>
                    </div>
                    
                    <ThreadTags tags={thread.tags} />
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Forum Bot Interface */}
      <ForumBotInterface 
        isMinimized={isBotMinimized}
        onToggleMinimize={() => setIsBotMinimized(!isBotMinimized)}
        categoryId={categoryId}
      />
    </div>
  );
}
