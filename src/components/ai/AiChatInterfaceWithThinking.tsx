// frontend/src/components/ai/AiChatInterfaceWithThinking.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
// Removed ScrollArea import
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { isTokenValid } from "@/utils/authDebug";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define message types for internal use
interface UserMessage {
    role: 'user';
    content: string;
}

interface AiMessage {
    role: 'assistant';
    thinking: string; // Internal thinking process (not displayed)
    content: string;  // Final response shown to user
}

type Message = UserMessage | AiMessage;

// This is the interface we expose to the API
interface ApiResponse {
    response: string;
    thinking?: string; // Optional thinking process from API
}

export function AiChatInterfaceWithThinking() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputPrompt, setInputPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [limitReached, setLimitReached] = useState(false);
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { token, isAuthenticated, refreshToken } = useAuthStore();

    // Auto-scroll to bottom when messages change
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
            // Check if user is authenticated and token exists
            if (!isAuthenticated || !token) {
                toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
                setIsLoading(false);
                return;
            }

            // For Clerk authentication, we don't need to validate the token in the same way
            // as we're using Clerk's session management
            console.log('Proceeding with AI request using current authentication');
            
            // Log authentication state for debugging
            console.log('Auth state:', { isAuthenticated, token: token ? 'exists' : 'missing' });

            // Call the AI API
            console.log('Sending request to AI service with prompt:', prompt);
            let response;
            let data: ApiResponse;

            try {
                // Log the token length for debugging (without exposing the actual token)
                console.log('Using token with length:', token ? token.length : 0);
                
                response = await fetch('/api/ai/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        prompt: prompt,
                        includeThinking: true // Request thinking process from API
                    }),
                    // Ensure we're not using cached responses
                    cache: 'no-store',
                });

                console.log('Response from AI service:', response.status);
                data = await response.json();
                console.log('Data from AI service:', data);

                if (!response.ok) {
                    console.error("AI Error:", data);

                    // Check if the error is due to usage limit
                    if (response.status === 429) {
                        setLimitReached(true);
                        toast({
                            title: "Usage Limit Reached",
                            description: "You've reached your daily usage limit for this service.",
                            variant: "destructive",
                        });
                    } else {
                        toast({
                            title: "AI Error",
                            description: data.response || "Failed to get response from AI.",
                            variant: "destructive",
                        });
                    }
                } else {
                    // Make sure the response doesn't contain any thinking process
                    let cleanResponse = data.response;
                    if (cleanResponse) {
                        // Remove any <think> tags and their content from the response
                        cleanResponse = cleanResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                    }

                    // Create AI message with thinking process (even if not displayed)
                    const aiResponse: AiMessage = {
                        role: 'assistant',
                        thinking: data.thinking || "No thinking process provided",
                        content: cleanResponse || data.response
                    };
                    setMessages(prev => [...prev, aiResponse]); // Add AI response
                }
            } catch (fetchError) {
                console.error('Fetch error:', fetchError);
                throw fetchError;
            }

        } catch (error) {
            console.error("Network error sending message:", error);
            toast({ title: "Network Error", description: "Could not connect to AI service.", variant: "destructive" });
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
        <div className="flex flex-col h-[600px] max-h-[70vh] border rounded-lg bg-white/5 shadow-inner">
            {/* Limit Reached Alert */}
            {limitReached && (
                <Alert variant="destructive" className="mx-4 mt-4 shadow-md bg-red-600 text-white border-red-700">
                    <AlertCircle className="h-4 w-4 text-white" />
                    <AlertTitle className="font-semibold text-white">Usage Limit Reached</AlertTitle>
                    <AlertDescription className="text-white">
                        You've reached your daily usage limit for the AI Assistant. The limit will reset at midnight.
                    </AlertDescription>
                </Alert>
            )}

            {/* Chat Messages Area */}
            <div className="flex-grow p-4 space-y-4 overflow-auto" ref={scrollAreaRef}>
                {messages.length === 0 && (
                    <p className="text-center text-slate-400">Ask anything about the SBC...</p>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[75%] rounded-lg px-4 py-2 whitespace-pre-wrap ${
                                msg.role === 'user'
                                    ? 'bg-brand-orange text-white'
                                    : 'bg-slate-600 text-slate-100'
                            }`}
                        >
                            {msg.role === 'user' ? msg.content : (msg as AiMessage).content}
                        </div>
                    </div>
                ))}
                {/* Show typing indicator */}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex justify-start">
                        <div className="max-w-[75%] rounded-lg px-4 py-2 bg-slate-600 text-slate-400 italic">
                            Assistant is thinking... <Loader2 className="inline-block h-4 w-4 animate-spin" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="flex items-center p-4 border-t border-slate-700">
                <Textarea
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your question here... (Shift+Enter for newline)"
                    className="flex-grow mr-2 resize-none bg-slate-700 text-white placeholder:text-slate-400 border-slate-600 focus:ring-brand-orange"
                    rows={1}
                    disabled={isLoading}
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !inputPrompt.trim() || limitReached} className="bg-brand-orange hover:bg-brand-orange/90">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                </Button>
            </div>
        </div>
    );
}
