import React from 'react';

interface ReasoningModelProps {
  userInput: string;
  thinking: string;
  response: string;
}

const ReasoningModel: React.FC<ReasoningModelProps> = ({ userInput, thinking, response }) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* User Input */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">User Input</h2>
        <div className="p-4 bg-gray-100 rounded-md">
          {userInput}
        </div>
      </div>
      
      {/* AI Thinking Process */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">AI Thinking Process</h2>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {thinking}
          </pre>
        </div>
      </div>
      
      {/* AI Response */}
      <div>
        <h2 className="text-lg font-bold mb-2">AI Response</h2>
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          {response}
        </div>
      </div>
    </div>
  );
};

export default ReasoningModel;

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

  return <ReasoningModel {...sampleData} />;
};
*/
