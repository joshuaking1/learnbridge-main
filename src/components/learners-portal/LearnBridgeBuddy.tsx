"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CustomAvatar as Avatar, CustomAvatarFallback as AvatarFallback, CustomAvatarImage as AvatarImage } from "@/components/ui/custom-avatar";
import { CustomSelect as Select, CustomSelectContent as SelectContent, CustomSelectItem as SelectItem, CustomSelectTrigger as SelectTrigger, CustomSelectValue as SelectValue } from "@/components/ui/custom-select";
import { Label } from "@/components/ui/label";
import { CustomScrollArea as ScrollArea } from "@/components/ui/custom-scroll-area";
import { Loader2, Send, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function LearnBridgeBuddy() {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your LearnBridge Buddy. How can I help you with your learning today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [isLoadingMotivation, setIsLoadingMotivation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const subjects = [
    "Mathematics",
    "English",
    "Science",
    "Social Studies",
    "Creative Arts",
    "Religious and Moral Education",
    "Computing",
    "Ghanaian Language",
  ];

  const grades = [
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
    "JHS 1",
    "JHS 2",
    "JHS 3",
  ];

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Fetch a motivational message on component mount
    fetchMotivationalMessage();
  }, []);

  const fetchMotivationalMessage = async () => {
    if (!token) return;

    setIsLoadingMotivation(true);
    try {
      // Mock motivational messages
      const mockMessages = [
        "You're doing great! Keep up the good work!",
        "Learning is a journey, and you're making excellent progress!",
        "Every question you ask makes you smarter. Keep being curious!",
        "You've been working hard - I'm proud of you!",
        "Remember: mistakes are just opportunities to learn something new.",
        "You have the power to achieve anything you set your mind to!",
        "Your brain is growing stronger every time you learn something new.",
        "Education is your superpower - and you're becoming stronger every day!"
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Pick a random message
      const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
      setMotivationalMessage(randomMessage);

      // Uncomment when backend is ready
      /*
      const response = await fetch("http://localhost:3007/api/learners-portal/ai-assistant/motivate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMotivationalMessage(data.message);
      }
      */
    } catch (error) {
      console.error("Error fetching motivational message:", error);
    } finally {
      setIsLoadingMotivation(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !token) return;

    const userMessage = {
      role: "user" as const,
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate a contextual response based on the input and selected subject/grade
      let aiResponse = "";

      // Check if it's a greeting
      if (inputMessage.toLowerCase().match(/^(hi|hello|hey|greetings).*/)) {
        aiResponse = `Hello there! I'm your LearnBridge Buddy. How can I help you with your ${subject || "studies"} today?`;
      }
      // Check if it's a question about a subject
      else if (inputMessage.toLowerCase().includes("what is") || inputMessage.toLowerCase().includes("how does") || inputMessage.toLowerCase().includes("why")) {
        if (subject === "Mathematics") {
          aiResponse = "That's a great math question! In mathematics, we solve problems step by step. Let me explain this concept in a way that's easy to understand..."
          + "\n\nWould you like me to show you an example problem to practice with?";
        } else if (subject === "Science") {
          aiResponse = "Excellent science question! Scientists are always curious about how the world works, just like you are."
          + "\n\nIn Ghana, we can observe this scientific concept in our everyday lives. For example...";
        } else {
          aiResponse = "That's a wonderful question! Learning is all about being curious and asking questions like you just did."
          + "\n\nLet me explain this in a simple way that connects to things you might see in Ghana...";
        }
      }
      // Check if it's about help with homework
      else if (inputMessage.toLowerCase().includes("homework") || inputMessage.toLowerCase().includes("assignment") || inputMessage.toLowerCase().includes("help me with")) {
        aiResponse = "I'd be happy to help you with your homework! Let's break this down into smaller steps so it's easier to understand."
        + "\n\nFirst, let's make sure we understand what the question is asking. Then we can work through it together.";
      }
      // Default response
      else {
        aiResponse = "Thank you for sharing that with me! As your learning buddy, I'm here to help you understand concepts, answer questions, and make learning fun."
        + "\n\nIs there something specific about this topic you'd like to explore further?";
      }

      // Add subject/grade context if provided
      if (subject && grade) {
        aiResponse += `\n\nI see you're studying ${subject} at ${grade} level. That's great! This is an important subject that will help you build a strong foundation.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
        },
      ]);

      // Uncomment when backend is ready
      /*
      const response = await fetch("http://localhost:3007/api/learners-portal/ai-assistant/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: inputMessage,
          subject,
          grade,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message,
            timestamp: new Date(),
          },
        ]);
      } else {
        toast({
          title: "Error",
          description: "Failed to get a response. Please try again.",
          variant: "destructive",
        });
      }
      */
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/images/buddy-avatar.png" alt="LearnBridge Buddy" />
                <AvatarFallback>LB</AvatarFallback>
              </Avatar>
              LearnBridge Buddy
            </CardTitle>
            <CardDescription>Your AI learning assistant</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t p-4">
            <div className="flex w-full items-center space-x-2">
              <Textarea
                placeholder="Ask me anything about your lessons..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-grow"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Context</CardTitle>
            <CardDescription>
              Help me understand what you're learning about
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade Level</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Select your grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Today's Motivation</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchMotivationalMessage}
                disabled={isLoadingMotivation}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoadingMotivation ? "animate-spin" : ""}`}
                />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center italic">{motivationalMessage}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
