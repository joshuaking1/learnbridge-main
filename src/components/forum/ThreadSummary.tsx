// src/components/forum/ThreadSummary.tsx
import React, { useState } from 'react';

interface Props {
  summary?: string;
  isLoading?: boolean;
}

const ThreadSummary: React.FC<Props> = ({ summary, isLoading = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex items-center space-x-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <h3 className="font-medium text-gray-700">AI Summary</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-3 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 rounded mb-2 w-11/12"></div>
          <div className="h-3 bg-gray-300 rounded mb-2 w-4/5"></div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const truncatedSummary = summary.length > 150 && !isExpanded
    ? `${summary.substring(0, 150)}...`
    : summary;

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center space-x-2 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <h3 className="font-medium text-blue-700">AI Summary</h3>
      </div>
      <p className="text-sm text-gray-700">{truncatedSummary}</p>
      {summary.length > 150 && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600 hover:text-blue-800 mt-1"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

export default ThreadSummary;
