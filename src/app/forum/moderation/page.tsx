// src/app/forum/moderation/page.tsx
'use client';

// Force dynamic rendering to prevent static generation errors with auth
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { enhancedForumService } from '@/services/enhancedForumService';
import { useAuth } from '@/context/AuthContext';

type ReportStatus = 'pending' | 'resolved';
type ReportAction = 'approve' | 'remove' | 'warn';

interface ReportedContent {
  id: string;
  type: 'post' | 'thread';
  contentId: string; // ID of the post or thread
  contentPreview: string;
  reportedBy: string;
  reportedAt: string;
  reason: string;
  status: ReportStatus;
  threadId?: string; // Only applicable for posts
  threadTitle?: string; // Only applicable for posts
}

export default function ModerationPage() {
  const [reports, setReports] = useState<ReportedContent[]>([]);
  const [activeStatus, setActiveStatus] = useState<ReportStatus>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Check if user has moderator or teacher role
      if (!user.role || (user.role !== 'admin' && user.role !== 'teacher' && user.role !== 'moderator')) {
        router.push('/forum');
      } else {
        loadReports();
      }
    }
  }, [user, activeStatus]);

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }
      
      const reportedContent = await enhancedForumService.getReportedContent(token, activeStatus);
      setReports(reportedContent);
    } catch (err) {
      console.error('Error loading reported content:', err);
      setError('Failed to load reported content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveReport = async (reportId: string, action: ReportAction) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      await enhancedForumService.resolveReport(token, reportId, action);
      
      // Remove the resolved report from the list
      setReports(reports.filter(report => report.id !== reportId));
    } catch (err) {
      console.error('Error resolving report:', err);
      alert('Failed to resolve report. Please try again.');
    }
  };

  if (isLoading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-10"></div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="h-10 bg-gray-300 rounded w-full mb-6"></div>
              
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded-md"></div>
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
            onClick={loadReports}
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Forum Moderation</h1>
            <p className="text-gray-600">Review and manage reported content</p>
          </div>
          
          <Link 
            href="/forum"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Forum
          </Link>
        </div>
        
        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveStatus('pending')}
              className={`px-4 py-3 text-sm font-medium ${activeStatus === 'pending' 
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
            >
              Pending Reports
            </button>
            <button
              onClick={() => setActiveStatus('resolved')}
              className={`px-4 py-3 text-sm font-medium ${activeStatus === 'resolved' 
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
            >
              Resolved Reports
            </button>
          </div>
          
          {/* Reports List */}
          <div className="p-4">
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {activeStatus === 'pending' ? 'No pending reports' : 'No resolved reports'}
                </h3>
                <p className="text-gray-600">
                  {activeStatus === 'pending' 
                    ? 'There are currently no reported items that need your attention.' 
                    : 'There are no resolved reports to display.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map(report => (
                  <div 
                    key={report.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.type === 'post' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                          {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          Reported {new Date(report.reportedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {activeStatus === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleResolveReport(report.id, 'approve')}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            title="Approve content and dismiss report"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id, 'warn')}
                            className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                            title="Warn user but keep content"
                          >
                            Warn
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id, 'remove')}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            title="Remove content"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <h3 className="font-medium text-gray-800 mb-1">
                        {report.type === 'thread' ? (
                          <Link href={`/forum/thread/${report.contentId}`} className="hover:underline">
                            {report.contentPreview}
                          </Link>
                        ) : (
                          <>
                            <Link href={`/forum/thread/${report.threadId}`} className="hover:underline">
                              {report.threadTitle}
                            </Link>
                            <span className="text-gray-500"> • Post</span>
                          </>
                        )}
                      </h3>
                      <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded">{report.contentPreview}</p>
                    </div>
                    
                    <div className="mt-3 flex justify-between text-sm">
                      <div>
                        <span className="text-gray-600">Reported by:</span>{' '}
                        <span className="font-medium">{report.reportedBy}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Reason:</span>{' '}
                        <span className="font-medium">{report.reason}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
