"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import ThinkingAiChatMessage from "./ThinkingAiChatMessage";

// Define message types
interface UserMessage {
  role: 'user';
  content: string;
}

interface AiMessage {
  role: 'assistant';
  thinking: string;
  response: string;
}

type Message = UserMessage | AiMessage;

export default function ThinkingAiChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { token } = useAuthStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    const prompt = inputPrompt.trim();
    if (!prompt || isLoading) return;

    setIsLoading(true);
    const newUserMessage: UserMessage = { role: 'user', content: prompt };
    setMessages(prev => [...prev, newUserMessage]); // Add user message immediately
    setInputPrompt(""); // Clear input field

    try {
      // In a real implementation, you would call your AI API here
      // For demo purposes, we're simulating a response

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock AI thinking and response
      // Generate thinking process but don't display it
      const mockThinking = `<think>
The user asked: "${prompt}"

Let me think about how to respond to this question...

First, I need to understand what the user is asking about.
Then, I should provide a helpful, accurate response based on my knowledge of the Ghanaian Standards-Based Curriculum.

I'll structure my response to be clear and informative, making sure to address all parts of the question.
</think>`;

      const mockResponse = `<think>
Okay, the user just said "${prompt}." I need to respond in a friendly and helpful way. Since my role is to assist with the Ghanaian Standards-Based Curriculum and educational topics, I should keep the conversation focused on that.

I remember that when someone greets me, I should greet them back and offer assistance. So I'll say something like, "Hello there! How can I help you with the SBC today?" That keeps it simple and opens the door for them to ask their question.

I also need to make sure I'm not providing any external links or information unless it's specifically related to the SBC and they've asked for it. So I'll just stick to the greeting and offer help without any extra stuff.

Alright, that should do it. I'm ready to assist them with whatever they need related to the SBC!
</think>

Thank you for your question about "${prompt}".

Based on the Ghanaian Standards-Based Curriculum, I can provide the following information...

Please let me know if you need any clarification or have additional questions!`;

      const aiResponse: AiMessage = {
        role: 'assistant',
        thinking: mockThinking,
        response: mockResponse
      };

      setMessages(prev => [...prev, aiResponse]); // Add AI response

    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Error", description: "Could not connect to AI service.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, allow Shift+Enter for newline
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default newline behavior
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[70vh] border rounded-lg bg-white shadow-inner">
      {/* Chat Messages Area */}
      <ScrollArea className="flex-grow p-4 space-y-6" ref={scrollAreaRef}>
        {messages.length === 0 && (
          <p className="text-center text-slate-400">Ask anything about the SBC...</p>
        )}

        {messages.map((msg, index) => {
          if (msg.role === 'user') {
            // If the next message is from the assistant, we'll render them together
            const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

            if (nextMsg && nextMsg.role === 'assistant') {
              return (
                <ThinkingAiChatMessage
                  key={index}
                  userMessage={msg.content}
                  aiThinking={(nextMsg as AiMessage).thinking}
                  aiResponse={(nextMsg as AiMessage).response}
                />
              );
            } else if (index === messages.length - 1 || messages[index + 1].role === 'user') {
              // Render solo user message if it's the last one or followed by another user message
              return (
                <div key={index} className="flex justify-end">
                  <div className="max-w-[75%] rounded-lg px-4 py-2 bg-brand-orange text-white">
                    {msg.content}
                  </div>
                </div>
              );
            }

            // Skip rendering this user message as it will be rendered with the next AI message
            return null;
          }

          return null; // Skip AI messages as they're rendered with user messages
        })}

        {/* Optional: Show typing indicator */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-lg px-4 py-2 bg-slate-600 text-slate-400 italic">
              Assistant is thinking... <Loader2 className="inline-block h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="flex items-center p-4 border-t border-slate-200">
        <Textarea
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={handleKeyPress} // Handle Enter key
          placeholder="Type your question here... (Shift+Enter for newline)"
          className="flex-grow mr-2 resize-none border-slate-300 focus:ring-brand-orange"
          rows={1} // Start with 1 row, auto-expands slightly
          disabled={isLoading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || !inputPrompt.trim()}
          className="bg-brand-orange hover:bg-brand-orange/90"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
        </Button>
      </div>
    </div>
  );
}
