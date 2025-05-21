// src/app/forum/create/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { enhancedForumService, ForumCategory } from '@/services/enhancedForumService';
import { forumBotService } from '@/services/forumBotService';
import { useAuth } from '@/context/AuthContext';
import RichTextEditor from '@/components/forum/RichTextEditor';

export default function CreateThreadPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getToken, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryIdFromUrl = searchParams.get('categoryId');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryIdFromUrl && categories.length > 0) {
      setSelectedCategoryId(categoryIdFromUrl);
    }
  }, [categoryIdFromUrl, categories]);

  useEffect(() => {
    // Generate tag suggestions when content changes
    const generateTagSuggestions = async () => {
      if (content.length > 50) {
        try {
          const token = await getToken();
          if (!token) return;

          const result = await forumBotService.suggestTags(token, title + ' ' + content);
          // Filter out tags that are already selected
          const newSuggestions = result.tags.filter(tag => !tags.includes(tag));
          setSuggestedTags(newSuggestions);
        } catch (err) {
          console.error('Error getting tag suggestions:', err);
        }
      }
    };

    const debounce = setTimeout(() => {
      generateTagSuggestions();
    }, 1000);

    return () => clearTimeout(debounce);
  }, [content, title, tags]);

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
      
      // If we have a category ID from URL and it's valid, select it
      if (categoryIdFromUrl) {
        const validCategory = categoriesData.find(cat => cat.id === categoryIdFromUrl);
        if (validCategory) {
          setSelectedCategoryId(categoryIdFromUrl);
        }
      }
      
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = (tag: string = tagInput.trim()) => {
    if (!tag) return;
    
    // Format the tag (lowercase, replace spaces with underscores)
    const formattedTag = tag.toLowerCase().replace(/\s+/g, '_');
    
    // Check if the tag already exists
    if (!tags.includes(formattedTag)) {
      setTags([...tags, formattedTag]);
    }
    
    // Clear the input
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddUser = () => {
    const trimmedInput = userInput.trim();
    if (!trimmedInput) return;
    
    if (!allowedUsers.includes(trimmedInput)) {
      setAllowedUsers([...allowedUsers, trimmedInput]);
    }
    
    setUserInput('');
  };

  const handleRemoveUser = (userToRemove: string) => {
    setAllowedUsers(allowedUsers.filter(u => u !== userToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !selectedCategoryId) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = await getToken();
      if (!token) {
        alert('You must be logged in to create a thread');
        setIsSubmitting(false);
        return;
      }
      
      const newThread = await enhancedForumService.createThread(token, selectedCategoryId, {
        title: title.trim(),
        content,
        tags,
        accessibility: isPrivate ? {
          isPrivate: true,
          allowedUsers,
        } : undefined,
      });
      
      // Redirect to the new thread
      router.push(`/forum/thread/${newThread.id}`);
      
    } catch (err) {
      console.error('Error creating thread:', err);
      alert('Failed to create thread. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-10"></div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-300 rounded w-full mb-6"></div>
              
              <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-40 bg-gray-300 rounded w-full mb-6"></div>
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
            onClick={loadCategories}
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
            {selectedCategoryId && (
              <>
                <li>
                  <Link 
                    href={`/forum/category/${selectedCategoryId}`} 
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {categories.find(c => c.id === selectedCategoryId)?.name || 'Category'}
                  </Link>
                </li>
                <li className="text-gray-500">/</li>
              </>
            )}
            <li className="text-gray-700 font-medium">Create Thread</li>
          </ol>
        </nav>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Thread</h1>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Category Selection */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Thread Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a descriptive title for your thread"
                  required
                />
              </div>
              
              {/* Thread Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  initialValue={content}
                  onChange={setContent}
                  placeholder="Write your thread content here..."
                  minHeight="300px"
                />
              </div>
              
              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="mb-2">
                  <div className="flex">
                    <input
                      type="text"
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add tags (press Enter or comma to add)"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tags help others find your thread. Separate tags with Enter or commas.
                  </p>
                </div>
                
                {/* Tag List */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:text-blue-700"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Suggested Tags */}
                {suggestedTags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Suggested tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            handleAddTag(tag);
                            setSuggestedTags(suggestedTags.filter(t => t !== tag));
                          }}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Private Thread Option */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                    Make this thread private
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Private threads are only visible to you and users you specify.
                </p>
              </div>
              
              {/* Allowed Users (if private) */}
              {isPrivate && (
                <div>
                  <label htmlFor="allowedUsers" className="block text-sm font-medium text-gray-700 mb-1">
                    Add users who can view this thread
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="allowedUsers"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUser();
                        }
                      }}
                      className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter user email or ID"
                    />
                    <button
                      type="button"
                      onClick={handleAddUser}
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* User List */}
                  {allowedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {allowedUsers.map(user => (
                        <span
                          key={user}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {user}
                          <button
                            type="button"
                            onClick={() => handleRemoveUser(user)}
                            className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-green-400 hover:text-green-700"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              <Link
                href={selectedCategoryId ? `/forum/category/${selectedCategoryId}` : '/forum'}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim() || !selectedCategoryId}
                className={`px-4 py-2 rounded-md ${isSubmitting || !title.trim() || !content.trim() || !selectedCategoryId
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                {isSubmitting ? 'Creating...' : 'Create Thread'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
