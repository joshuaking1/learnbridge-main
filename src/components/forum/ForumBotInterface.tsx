// src/components/forum/ForumBotInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { forumBotService, BotResponse } from '@/services/forumBotService';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface Props {
  threadId?: string;
  categoryId?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const ForumBotInterface: React.FC<Props> = ({
  threadId,
  categoryId,
  isMinimized = false,
  onToggleMinimize,
}) => {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    role: 'bot',
    content: 'Hi there! I\'m the LearnBridge Bot. How can I help you with your learning today?',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token, getToken } = useAuth();

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load suggested questions based on thread context if available
    if (threadId) {
      loadSuggestedQuestions();
    }
  }, [threadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestedQuestions = async () => {
    if (!threadId) return;
    
    try {
      const t = await getToken();
      if (!t) return;
      
      const response = await forumBotService.generateFollowUpQuestions(t, threadId);
      setSuggestedQuestions(response.questions.slice(0, 3)); // Limit to 3 suggestions
    } catch (error) {
      console.error('Error loading suggested questions:', error);
    }
  };

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const t = await getToken();
      if (!t) {
        setIsLoading(false);
        return;
      }
      
      // Get context from previous messages
      const previousMessages = messages
        .slice(-5) // Use last 5 messages for context
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Get bot response
      const botResponse = await forumBotService.askQuestion(t, text, {
        threadId,
        categoryId,
        previousMessages,
      });
      
      // Add bot response to chat
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botResponse.answer,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Update suggested questions based on the conversation
      if (botResponse.followUpPrompts && botResponse.followUpPrompts.length > 0) {
        setSuggestedQuestions(botResponse.followUpPrompts);
      }
    } catch (error) {
      console.error('Error getting bot response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'Sorry, I\'m having trouble responding right now. Please try again later.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
           onClick={onToggleMinimize}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-[500px] z-50">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white p-3 rounded-t-lg">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="font-semibold">LearnBridge Bot</h3>
        </div>
        <button
          onClick={onToggleMinimize}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3/4 rounded-lg p-3 ${message.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-gray-200'}`}
            >
              <div dangerouslySetInnerHTML={{ __html: message.content }} />
              <div
                className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(question)}
                className="text-xs bg-gray-200 hover:bg-gray-300 rounded-full px-3 py-1 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask something..."
            className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${!input.trim() || isLoading ? 'text-gray-400' : 'text-blue-600 hover:text-blue-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForumBotInterface;
