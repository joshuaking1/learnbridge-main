"use client";

import React, { useState } from 'react';
import ThinkingReasoningModel from '@/components/ai/ThinkingReasoningModel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function AiReasoningDemo() {
  const [userInput, setUserInput] = useState("hi");
  const [thinking, setThinking] = useState(`Okay, so the user greeted me with "hi." I need to respond in a friendly and helpful manner.
Since I'm focused on the Ghanaian Standards-Based Curriculum and educational topics,
I should tie the greeting back to that.

First, I'll acknowledge the greeting and make it clear that I'm here to assist with the SBC.
I should keep it simple and welcoming. Maybe something like, "Hello there! How can I help you with the SBC today?"

That should cover it. It's polite, sets the context, and invites the user to ask their question.`);
  const [response, setResponse] = useState("Hello there! How can I help you with the SBC today?");

  // For a real implementation, you would fetch this from an API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would call your AI API here
    // For demo purposes, we're just using the existing values
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">AI Response Model Demo</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white border border-gray-200 p-6 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Configure AI Response</h2>
            <p className="text-sm text-gray-500 mb-4">The thinking process is processed internally but not displayed to users.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">User Input</label>
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full h-20"
                  placeholder="Enter user input here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">AI Thinking Process</label>
                <Textarea
                  value={thinking}
                  onChange={(e) => setThinking(e.target.value)}
                  className="w-full h-60"
                  placeholder="Enter AI thinking process here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">AI Response</label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="w-full h-20"
                  placeholder="Enter AI response here..."
                />
              </div>

              <Button type="submit" className="w-full">Update Preview</Button>
            </form>
          </div>

          {/* Preview */}
          <div className="bg-white border border-gray-200 p-6 rounded-md">
            <h2 className="text-xl font-semibold mb-4">AI Response Preview</h2>
            <p className="text-sm text-gray-500 mb-4">This shows how the response will appear to users.</p>
            <ThinkingReasoningModel
              userInput={userInput}
              thinking={thinking}
              response={response}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
