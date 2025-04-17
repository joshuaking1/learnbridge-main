import React from 'react';

interface ThinkingAiChatMessageProps {
  userMessage: string;
  aiThinking: string; // Still keep this in the props but don't display it
  aiResponse: string;
}

const ThinkingAiChatMessage: React.FC<ThinkingAiChatMessageProps> = ({
  userMessage,
  aiThinking, // Keep this parameter for future reference
  aiResponse
}) => {
  // Remove any <think> tags and content between them from the aiResponse
  const cleanResponse = aiResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  return (
    <div className="space-y-4 w-full">
      {/* User Message */}
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-lg px-4 py-2 bg-brand-orange text-white">
          {userMessage}
        </div>
      </div>

      {/* AI Response - Thinking process is hidden */}
      <div className="flex justify-start">
        <div className="max-w-[75%] rounded-lg px-4 py-2 bg-slate-600 text-slate-100">
          {cleanResponse || aiResponse} {/* Use cleaned response or fall back to original */}
        </div>
      </div>
    </div>
  );
};

export default ThinkingAiChatMessage;
