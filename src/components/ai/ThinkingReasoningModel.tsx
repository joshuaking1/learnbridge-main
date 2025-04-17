import React from 'react';

interface ThinkingReasoningModelProps {
  userInput: string;
  thinking: string; // Keep this in the props but don't display it
  response: string;
}

const ThinkingReasoningModel: React.FC<ThinkingReasoningModelProps> = ({ userInput, thinking, response }) => {
  return (
    <div className="w-full">
      {/* User Input */}
      <div className="mb-4 p-4 bg-gray-100 rounded-md">
        <p className="text-gray-800">{userInput}</p>
      </div>

      {/* AI Response - Thinking process is hidden */}
      <div className="p-4 bg-white rounded-md">
        <p className="text-gray-800">{response}</p>
      </div>
    </div>
  );
};

export default ThinkingReasoningModel;

// Example usage:
/*
const ExamplePage = () => {
  const sampleData = {
    userInput: "hi",
    thinking: `Okay, so the user greeted me with "hi." I need to respond in a friendly and helpful manner.
    Since I'm focused on the Ghanaian Standards-Based Curriculum and educational topics,
    I should tie the greeting back to that.

    First, I'll acknowledge the greeting and make it clear that I'm here to assist with the SBC.
    I should keep it simple and welcoming. Maybe something like, "Hello there! How can I help you with the SBC today?"

    That should cover it. It's polite, sets the context, and invites the user to ask their question.`,
    response: "Hello there! How can I help you with the SBC today?"
  };

  return <ThinkingReasoningModel {...sampleData} />;
};
*/
