// src/app/forum/leaderboard/page.tsx
'use client';

// Force dynamic rendering to prevent static generation errors with auth
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { enhancedForumService } from '@/services/enhancedForumService';

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  points: number;
  badgeCount: number;
  helpfulAnswers: number;
  postCount: number;
  rank: number;
}

type TimeFrame = 'weekly' | 'monthly' | 'alltime';

export default function LeaderboardPage() {
  const [isClient, setIsClient] = useState(false);
  
  // Use useEffect to determine if we're running on client side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // If we're still server-side or statically generating, show a loading skeleton
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Leaderboard</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="flex justify-between mb-6">
                <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
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
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<TimeFrame>('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Safely import authentication only on client side
  const auth = require('@/context/AuthContext');
  const { getToken, user } = auth.useAuth();

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }
      
      const leaderboardData = await enhancedForumService.getLeaderboard(token, timeframe, 20);
      setLeaders(leaderboardData);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeframeLabel = (timeframe: TimeFrame): string => {
    switch (timeframe) {
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'alltime': return 'All Time';
      default: return '';
    }
  };

  if (isLoading && leaders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-10"></div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="h-10 bg-gray-300 rounded w-full mb-6"></div>
              
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded-md"></div>
                ))}
              </div>
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
            onClick={loadLeaderboard}
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Forum Leaderboard</h1>
              <p className="text-gray-600">Top contributors in the LearnBridge community</p>
            </div>
            
            <Link 
              href="/forum"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Forum
            </Link>
          </div>
          
          {/* Timeframe Selector */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="flex border-b">
              {(['weekly', 'monthly', 'alltime'] as TimeFrame[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-3 text-sm font-medium ${timeframe === tf 
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
                >
                  {getTimeframeLabel(tf)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <h2 className="text-xl font-bold">Top Contributors {getTimeframeLabel(timeframe)}</h2>
            </div>
            
            {leaders.length === 0 ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No data yet</h3>
                <p className="text-gray-600">Be the first to contribute and earn points!</p>
              </div>
            ) : (
              <div className="divide-y">
                {/* Top 3 Players - Special Display */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-center items-end space-y-6 md:space-y-0 md:space-x-6">
                    {/* 2nd Place */}
                    {leaders.length > 1 && (
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-full bg-gray-200 mb-2 flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-gray-300 to-gray-400 text-white">
                            2
                          </div>
                          <div className="absolute -top-2 -right-2 bg-gray-100 rounded-full p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <p className="font-medium">{leaders[1].displayName}</p>
                        <p className="text-sm">{leaders[1].points} points</p>
                      </div>
                    )}
                    
                    {/* 1st Place */}
                    {leaders.length > 0 && (
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div className="h-20 w-20 rounded-full bg-gray-200 mb-2 flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-yellow-300 to-yellow-500 text-white">
                            1
                          </div>
                          <div className="absolute -top-1 -right-1 bg-yellow-100 rounded-full p-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </div>
                        <p className="font-medium">{leaders[0].displayName}</p>
                        <p className="text-sm font-semibold">{leaders[0].points} points</p>
                      </div>
                    )}
                    
                    {/* 3rd Place */}
                    {leaders.length > 2 && (
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-full bg-gray-200 mb-2 flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-amber-600 to-amber-700 text-white">
                            3
                          </div>
                          <div className="absolute -top-2 -right-2 bg-amber-100 rounded-full p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        </div>
                        <p className="font-medium">{leaders[2].displayName}</p>
                        <p className="text-sm">{leaders[2].points} points</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Rest of the Leaderboard */}
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <th className="px-6 py-3">Rank</th>
                          <th className="px-6 py-3">User</th>
                          <th className="px-6 py-3">Points</th>
                          <th className="px-6 py-3">Helpful Answers</th>
                          <th className="px-6 py-3">Posts</th>
                          <th className="px-6 py-3">Badges</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {leaders.slice(3).map((leader) => (
                          <tr key={leader.userId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {leader.rank}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link href={`/profile/${leader.userId}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                                {leader.displayName}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {leader.points}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {leader.helpfulAnswers}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {leader.postCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {leader.badgeCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Point System Explanation */}
          <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">How to Earn Points</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">New Post</p>
                    <p className="text-sm text-gray-600">+5 points</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Reply</p>
                    <p className="text-sm text-gray-600">+3 points</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Received Upvote</p>
                    <p className="text-sm text-gray-600">+2 points</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Solution Marked</p>
                    <p className="text-sm text-gray-600">+15 points</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Daily Login</p>
                    <p className="text-sm text-gray-600">+1 point</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Participation Streak</p>
                    <p className="text-sm text-gray-600">Bonus points for consecutive days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
