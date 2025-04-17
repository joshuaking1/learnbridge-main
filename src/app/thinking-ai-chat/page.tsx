"use client";

import React from 'react';
import ThinkingAiChatInterface from '@/components/ai/ThinkingAiChatInterface';
import Link from 'next/link';

export default function ThinkingAiChatPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-brand-darkblue">AI Chat Interface</h1>
            <div className="text-sm text-gray-500">
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              {' / '}
              <span>AI Chat</span>
            </div>
          </div>
          <Link href="/dashboard">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium">
              Back to Dashboard
            </button>
          </Link>
        </div>

        <div className="mb-6">
          <p className="text-gray-700">
            This demo shows an AI chat interface that processes the AI's internal reasoning before providing a response.
            The thinking process happens behind the scenes, and only the final response is shown to the user.
          </p>
        </div>

        <ThinkingAiChatInterface />
      </div>
    </div>
  );
}
