// src/components/forum/PostItem.tsx
import React, { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Post } from '@/services/enhancedForumService';
import { useAuth } from '@/context/AuthContext';

interface Props {
  post: Post;
  onUpvote: () => void;
  onMarkAsSolution: () => void;
  canMarkSolution: boolean;
  threadLocked: boolean;
}

const PostItem: React.FC<Props> = ({
  post,
  onUpvote,
  onMarkAsSolution,
  canMarkSolution,
  threadLocked
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const { user } = useAuth();
  
  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    // Report functionality would be implemented here
    setShowReportModal(false);
    setReportReason('');
    alert('Post reported successfully.');
  };

  return (
    <div className={`p-6 ${post.isSolution ? 'bg-green-50' : ''}`}>
      <div className="flex justify-between">
        <div className="flex items-start space-x-3">
          {/* Upvote button */}
          <div className="flex flex-col items-center">
            <button 
              onClick={onUpvote}
              disabled={threadLocked}
              className={`flex flex-col items-center p-1 ${threadLocked ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'} rounded transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-sm font-medium mt-1">{post.upvotes}</span>
            </button>

            {/* Solution mark button */}
            {canMarkSolution && !threadLocked && (
              <button 
                onClick={onMarkAsSolution}
                className="mt-2 text-gray-500 hover:text-green-600 transition-colors"
                title="Mark as solution"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}

            {/* Solution indicator */}
            {post.isSolution && (
              <div className="mt-2 text-green-600" title="Marked as solution">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Post content */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Link href={`/profile/${post.authorId}`}>
                <span className="font-medium hover:underline cursor-pointer">{post.authorId}</span>
              </Link>
              <span className="text-sm text-gray-500">{format(new Date(post.createdAt), 'MMM d, yyyy \at h:mm a')}</span>
              {post.editHistory.length > 0 && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>

            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

            {/* Attachments */}
            {post.attachments.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-2">Attachments:</p>
                <div className="flex flex-wrap gap-2">
                  {post.attachments.map((attachment, index) => (
                    <a 
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                    >
                      {/* Icon based on attachment type */}
                      {attachment.type === 'image' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      ) : attachment.type === 'document' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      )}
                      <span>{attachment.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {!threadLocked && user && user.id !== post.authorId && (
          <div className="flex">
            <button 
              onClick={() => setShowReportModal(true)}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Report this post"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1-1V8a1 1 0 011-1h2.25L11 4H4a1 1 0 00-1 1v6a1 1 0 001 1h1v3a1 1 0 102 0v-3h.085l1.2 1.6A3 3 0 008 16.5H5a3 3 0 01-3-3V6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-medium mb-4">Report Post</h3>
            <form onSubmit={handleReport}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                  placeholder="Please explain why you're reporting this post"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostItem;
