// frontend/src/components/ai/AiChatInterface.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Use Textarea for input
import { ScrollArea } from "@/components/ui/scroll-area"; // To make chat scrollable
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react"; // Loading spinner icon
import { useAuthStore } from "@/stores/useAuthStore"; // Import auth store
import { isTokenValid } from "@/utils/authDebug"; // Import token validation utility

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AiChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputPrompt, setInputPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling
    const { token, isAuthenticated, refreshToken } = useAuthStore(); // Get token and refresh function from auth store

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);


    const handleSendMessage = async () => {
        const prompt = inputPrompt.trim();
        if (!prompt || isLoading) return;

        setIsLoading(true);
        const newUserMessage: Message = { role: 'user', content: prompt };
        setMessages(prev => [...prev, newUserMessage]); // Add user message immediately
        setInputPrompt(""); // Clear input field

        try {
            // Check if user is authenticated and token exists
            if (!isAuthenticated || !token) {
                toast({ title: "Authentication Error", description: "Please log in again.", variant: "destructive" });
                setIsLoading(false);
                return;
            }

            // Check if token is valid, if not try to refresh it
            if (!isTokenValid(token)) {
                console.log('Token appears to be invalid or expired, attempting to refresh...');
                const refreshed = await refreshToken();

                if (!refreshed) {
                    toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
                    setIsLoading(false);
                    return;
                }

                console.log('Token refreshed successfully, continuing with request');
            }

            const response = await fetch('/api/ai/ask', { // Use our Next.js API route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ prompt: prompt }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("AI Error:", data);
                toast({
                    title: "AI Error",
                    description: data.error || "Failed to get response from AI.",
                    variant: "destructive",
                });
                // Optionally remove the user message or add an error message to chat?
            } else {
                const aiResponse: Message = { role: 'assistant', content: data.response };
                setMessages(prev => [...prev, aiResponse]); // Add AI response
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
        <div className="flex flex-col h-[600px] max-h-[70vh] border rounded-lg bg-white/5 shadow-inner"> {/* Added height/max-height */}
            {/* Chat Messages Area */}
            <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
                {messages.length === 0 && (
                    <p className="text-center text-slate-400">Ask anything about the SBC...</p>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[75%] rounded-lg px-4 py-2 whitespace-pre-wrap ${ // Added whitespace-pre-wrap
                                msg.role === 'user'
                                    ? 'bg-brand-orange text-white'
                                    : 'bg-slate-600 text-slate-100' // Changed AI bubble color
                            }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
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
            <div className="flex items-center p-4 border-t border-slate-700">
                <Textarea
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={handleKeyPress} // Handle Enter key
                    placeholder="Type your question here... (Shift+Enter for newline)"
                    className="flex-grow mr-2 resize-none bg-slate-700 text-white placeholder:text-slate-400 border-slate-600 focus:ring-brand-orange" // Adjusted styling
                    rows={1} // Start with 1 row, auto-expands slightly
                    disabled={isLoading}
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !inputPrompt.trim()} className="bg-brand-orange hover:bg-brand-orange/90">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                </Button>
            </div>
        </div>
    );
}