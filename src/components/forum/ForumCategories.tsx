// src/components/forum/ForumCategories.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ForumCategory } from '@/services/enhancedForumService';
import { enhancedForumService } from '@/services/enhancedForumService';
import { useAuth } from '@/context/AuthContext';

const ForumCategories: React.FC = () => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }
      
      const categoriesData = await enhancedForumService.getAllCategories(token);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading forum categories:', err);
      setError('Failed to load forum categories');
    } finally {
      setIsLoading(false);
    }
  };

  // Group categories by type
  const categoriesByType = categories.reduce((acc, category) => {
    const type = category.type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(category);
    return acc;
  }, {} as Record<string, ForumCategory[]>);

  // Sort groups by priority
  const groupOrder = ['subject', 'grade_level', 'topic', 'other'];
  const sortedGroups = Object.keys(categoriesByType).sort(
    (a, b) => groupOrder.indexOf(a) - groupOrder.indexOf(b)
  );

  // Format group titles
  const formatGroupTitle = (groupKey: string): string => {
    switch (groupKey) {
      case 'subject': return 'Subjects';
      case 'grade_level': return 'Grade Levels';
      case 'topic': return 'Topics';
      default: return 'Other Categories';
    }
  };

  // Get icon for each group
  const getGroupIcon = (groupKey: string): JSX.Element => {
    switch (groupKey) {
      case 'subject':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'grade_level':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        );
      case 'topic':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-gray-300 h-6 w-6"></div>
                  <div className="h-5 bg-gray-300 rounded w-1/4"></div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <div key={j} className="h-12 bg-gray-200 rounded-md"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-lg mx-auto bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadCategories}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="max-w-lg mx-auto bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-700">No Forum Categories</h3>
          <p className="mt-2 text-blue-600">There are no forum categories available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">LearnBridge Forum</h1>
        
        <div className="space-y-8">
          {sortedGroups.map((groupKey) => (
            <div key={groupKey} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 p-4 border-b flex items-center space-x-2">
                {getGroupIcon(groupKey)}
                <h2 className="text-lg font-medium text-gray-800">{formatGroupTitle(groupKey)}</h2>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoriesByType[groupKey].map((category) => (
                    <Link
                      key={category.id}
                      href={`/forum/category/${category.id}`}
                    >
                      <div className="border border-gray-200 rounded-md p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                        <h3 className="font-medium text-gray-800">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{category.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumCategories;
