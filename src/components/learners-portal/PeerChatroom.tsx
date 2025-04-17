"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CustomAvatar as Avatar, CustomAvatarFallback as AvatarFallback, CustomAvatarImage as AvatarImage } from "@/components/ui/custom-avatar";
import { CustomSelect as Select, CustomSelectContent as SelectContent, CustomSelectItem as SelectItem, CustomSelectTrigger as SelectTrigger, CustomSelectValue as SelectValue } from "@/components/ui/custom-select";
import { Label } from "@/components/ui/label";
import { CustomScrollArea as ScrollArea } from "@/components/ui/custom-scroll-area";
import { CustomTabs as Tabs, CustomTabsContent as TabsContent, CustomTabsList as TabsList, CustomTabsTrigger as TabsTrigger } from "@/components/ui/custom-tabs";
import { Loader2, Send, MessageSquare, HelpCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Removed Dialog import to avoid dependency issues
import { io, Socket } from "socket.io-client";

interface StudyCircle {
  id: number;
  name: string;
  subject: string;
  grade: string;
  strand: string | null;
  created_at: string;
}

interface ChatMessage {
  id: number;
  user_id: string;
  message: string;
  is_help_request: boolean;
  created_at: string;
  first_name: string;
  role: string;
}

export function PeerChatroom() {
  const { user, token } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [circles, setCircles] = useState<StudyCircle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<StudyCircle | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [helpQuestion, setHelpQuestion] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [strand, setStrand] = useState("");
  const [newCircleName, setNewCircleName] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isFlaggingHelp, setIsFlaggingHelp] = useState(false);
  const [isCreatingCircle, setIsCreatingCircle] = useState(false);
  const [showCreateCircleModal, setShowCreateCircleModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

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
    if (!token) return;

    // Mock socket connection for now
    // We'll simulate the socket behavior with mock data

    // Fetch study circles
    fetchStudyCircles();

    // Uncomment when backend is ready
    /*
    // Initialize socket connection
    socketRef.current = io("http://localhost:3007", {
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    // Authenticate socket
    socket.emit("authenticate", token);

    // Set up event listeners
    socket.on("new_message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive",
      });
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
    */
  }, [token]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Fetch messages when a circle is selected
    if (selectedCircle) {
      fetchCircleMessages(selectedCircle.id);

      // Join the circle room
      if (socketRef.current) {
        socketRef.current.emit("join_circle", selectedCircle.id);
      }
    }

    // Leave previous circle room when changing circles
    return () => {
      if (selectedCircle && socketRef.current) {
        socketRef.current.emit("leave_circle", selectedCircle.id);
      }
    };
  }, [selectedCircle]);

  const fetchStudyCircles = async () => {
    setIsLoading(true);
    try {
      // Mock study circles data
      const mockCircles = [
        {
          id: 1,
          name: "Primary 4 Science Study Circle",
          subject: "Science",
          grade: "Primary 4",
          strand: "Earth Science",
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: "Primary 5 Mathematics Circle",
          subject: "Mathematics",
          grade: "Primary 5",
          strand: "Fractions",
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: "Primary 6 Social Studies Group",
          subject: "Social Studies",
          grade: "Primary 6",
          strand: "History",
          created_at: new Date().toISOString()
        },
        {
          id: 4,
          name: "JHS 1 English Language Circle",
          subject: "English",
          grade: "JHS 1",
          strand: "Grammar",
          created_at: new Date().toISOString()
        }
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setCircles(mockCircles);

      // Select the first circle by default if available
      if (mockCircles.length > 0 && !selectedCircle) {
        setSelectedCircle(mockCircles[0]);
      }

      // Uncomment when backend is ready
      /*
      const response = await fetch("http://localhost:3007/api/learners-portal/chat/circles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCircles(data);

        // Select the first circle by default if available
        if (data.length > 0 && !selectedCircle) {
          setSelectedCircle(data[0]);
        }
      }
      */
    } catch (error) {
      console.error("Error fetching study circles:", error);
      toast({
        title: "Error",
        description: "Failed to load study circles.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCircleMessages = async (circleId: number) => {
    try {
      // Mock messages data based on the circle ID
      const mockMessages: ChatMessage[] = [];

      // Generate different messages based on the circle ID
      if (circleId === 1) { // Science circle
        mockMessages.push(
          {
            id: 101,
            user_id: "1001", // Not the current user
            message: "Hello everyone! I'm having trouble understanding the water cycle. Can someone help?",
            is_help_request: true,
            created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            first_name: "Kofi",
            role: "student"
          },
          {
            id: 102,
            user_id: "1002", // Not the current user
            message: "Sure Kofi! The water cycle has 4 main stages: evaporation, condensation, precipitation, and collection. Which part is confusing you?",
            is_help_request: false,
            created_at: new Date(Date.now() - 3300000).toISOString(), // 55 minutes ago
            first_name: "Ama",
            role: "student"
          },
          {
            id: 103,
            user_id: "1001", // Not the current user
            message: "Thanks Ama! I don't understand how water turns into clouds. How does that happen?",
            is_help_request: false,
            created_at: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
            first_name: "Kofi",
            role: "student"
          }
        );
      } else if (circleId === 2) { // Math circle
        mockMessages.push(
          {
            id: 201,
            user_id: "1003", // Not the current user
            message: "Does anyone know how to add fractions with different denominators?",
            is_help_request: true,
            created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            first_name: "Kwame",
            role: "student"
          },
          {
            id: 202,
            user_id: "1004", // Not the current user
            message: "You need to find the least common multiple (LCM) of the denominators first!",
            is_help_request: false,
            created_at: new Date(Date.now() - 7000000).toISOString(), // 1 hour 56 minutes ago
            first_name: "Akua",
            role: "student"
          }
        );
      } else if (circleId === 3) { // Social Studies circle
        mockMessages.push(
          {
            id: 301,
            user_id: "1005", // Not the current user
            message: "When did Ghana gain independence?",
            is_help_request: true,
            created_at: new Date(Date.now() - 5400000).toISOString(), // 1 hour 30 minutes ago
            first_name: "Yaw",
            role: "student"
          },
          {
            id: 302,
            user_id: "1006", // Not the current user
            message: "Ghana gained independence on March 6, 1957. It was the first sub-Saharan African country to gain independence from colonial rule.",
            is_help_request: false,
            created_at: new Date(Date.now() - 5100000).toISOString(), // 1 hour 25 minutes ago
            first_name: "Abena",
            role: "student"
          }
        );
      } else if (circleId === 4) { // English circle
        mockMessages.push(
          {
            id: 401,
            user_id: "1007", // Not the current user
            message: "What's the difference between a noun and a verb?",
            is_help_request: true,
            created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
            first_name: "Kwesi",
            role: "student"
          },
          {
            id: 402,
            user_id: "1008", // Not the current user
            message: "A noun is a person, place, thing, or idea. For example: teacher, Ghana, book, happiness. A verb is an action or state of being. For example: run, teach, is, feel.",
            is_help_request: false,
            created_at: new Date(Date.now() - 1500000).toISOString(), // 25 minutes ago
            first_name: "Adwoa",
            role: "student"
          }
        );
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setMessages(mockMessages);

      // Uncomment when backend is ready
      /*
      const response = await fetch(`http://localhost:3007/api/learners-portal/chat/circles/${circleId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
      */
    } catch (error) {
      console.error("Error fetching circle messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedCircle || !token) return;

    setIsSendingMessage(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Create a new message from the current user
      const newMessage: ChatMessage = {
        id: Math.floor(Math.random() * 10000), // Random ID
        user_id: user?.id || "current-user", // Current user ID
        message: inputMessage,
        is_help_request: false,
        created_at: new Date().toISOString(),
        first_name: user?.firstName || "You",
        role: "student"
      };

      // Add the message to the UI
      setMessages(prev => [...prev, newMessage]);
      setInputMessage("");

      // Uncomment when backend is ready
      /*
      const response = await fetch(`http://localhost:3007/api/learners-portal/chat/circles/${selectedCircle.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: inputMessage,
          isHelpRequest: false,
        }),
      });

      if (response.ok) {
        // The message will be added to the UI via the socket event
        setInputMessage("");
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
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
      setIsSendingMessage(false);
    }
  };

  const handleFlagForHelp = async () => {
    if (!helpQuestion.trim() || !token || !subject || !grade) return;

    setIsFlaggingHelp(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find appropriate circle based on subject and grade
      let circleId = 1; // Default to first circle
      let circle = circles.find(c => c.subject === subject && c.grade === grade);

      if (!circle) {
        // If no exact match, find a circle with matching subject
        circle = circles.find(c => c.subject === subject);
      }

      if (circle) {
        circleId = circle.id;
      } else {
        // Create a new circle if none exists for this subject/grade
        const newCircle = {
          id: circles.length + 1,
          name: `${grade} ${subject} Study Circle`,
          subject: subject,
          grade: grade,
          strand: strand || null,
          created_at: new Date().toISOString()
        };

        // Add the new circle to the list
        setCircles(prev => [...prev, newCircle]);
        circle = newCircle;
        circleId = newCircle.id;
      }

      // Create a help request message
      const helpMessage: ChatMessage = {
        id: Math.floor(Math.random() * 10000), // Random ID
        user_id: user?.id || "current-user", // Current user ID
        message: `HELP REQUEST: ${helpQuestion}`,
        is_help_request: true,
        created_at: new Date().toISOString(),
        first_name: user?.firstName || "You",
        role: "student"
      };

      toast({
        title: "Help Request Sent",
        description: "Your question has been posted to the study circle.",
      });

      // Clear the form
      setHelpQuestion("");
      setSubject("");
      setGrade("");
      setStrand("");

      // Select the circle where the help request was posted
      setSelectedCircle(circle);

      // Add the message to the messages list if this circle is currently selected
      if (selectedCircle?.id === circleId) {
        setMessages(prev => [...prev, helpMessage]);
      }

      // Uncomment when backend is ready
      /*
      const response = await fetch("http://localhost:3007/api/learners-portal/chat/flag-for-help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          grade,
          strand,
          question: helpQuestion,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Help Request Sent",
          description: "Your question has been posted to the study circle.",
        });

        // Clear the form
        setHelpQuestion("");
        setSubject("");
        setGrade("");
        setStrand("");

        // Select the circle where the help request was posted
        const circleId = data.circleId;
        const circle = circles.find((c) => c.id === circleId);

        if (circle) {
          setSelectedCircle(circle);
        } else {
          // If the circle is new and not in our list, refresh the list
          fetchStudyCircles();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to send help request. Please try again.",
          variant: "destructive",
        });
      }
      */
    } catch (error) {
      console.error("Error flagging for help:", error);
      toast({
        title: "Error",
        description: "Failed to send help request. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsFlaggingHelp(false);
    }
  };

  const handleCreateCircle = async () => {
    if (!newCircleName.trim() || !subject || !grade || !token) return;

    setIsCreatingCircle(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a new circle
      const newCircle = {
        id: circles.length + 1,
        name: newCircleName,
        subject: subject,
        grade: grade,
        strand: strand || null,
        created_at: new Date().toISOString()
      };

      toast({
        title: "Study Circle Created",
        description: `Your new study circle "${newCircleName}" has been created.`,
      });

      // Add the new circle to the list and select it
      setCircles((prev) => [...prev, newCircle]);
      setSelectedCircle(newCircle);

      // Clear the form
      setNewCircleName("");
      setSubject("");
      setGrade("");
      setStrand("");

      // Uncomment when backend is ready
      /*
      const response = await fetch("http://localhost:3007/api/learners-portal/chat/circles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCircleName,
          subject,
          grade,
          strand,
        }),
      });

      if (response.ok) {
        const newCircle = await response.json();
        toast({
          title: "Study Circle Created",
          description: `Your new study circle "${newCircleName}" has been created.`,
        });

        // Add the new circle to the list and select it
        setCircles((prev) => [...prev, newCircle]);
        setSelectedCircle(newCircle);

        // Clear the form
        setNewCircleName("");
        setSubject("");
        setGrade("");
        setStrand("");
      } else {
        toast({
          title: "Error",
          description: "Failed to create study circle. Please try again.",
          variant: "destructive",
        });
      }
      */
    } catch (error) {
      console.error("Error creating study circle:", error);
      toast({
        title: "Error",
        description: "Failed to create study circle. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingCircle(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedCircle ? selectedCircle.name : "Select a Study Circle"}
                </CardTitle>
                {selectedCircle && (
                  <CardDescription>
                    {selectedCircle.subject} • {selectedCircle.grade}
                    {selectedCircle.strand && ` • ${selectedCircle.strand}`}
                  </CardDescription>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateCircleModal(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Circle
              </Button>

              {/* Simple modal for creating a new circle */}
              {showCreateCircleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4 relative">
                    <button
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      onClick={() => setShowCreateCircleModal(false)}
                    >
                      ✕
                    </button>
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold">Create a New Study Circle</h3>
                      <p className="text-sm text-gray-500">
                        Create a new space to discuss topics with your peers.
                      </p>
                    </div>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="circle-name">Circle Name</Label>
                        <Input
                          id="circle-name"
                          placeholder="e.g., Math Problem Solving"
                          value={newCircleName}
                          onChange={(e) => setNewCircleName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="circle-subject">Subject</Label>
                        <Select value={subject} onValueChange={setSubject}>
                          <SelectTrigger id="circle-subject">
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
                        <Label htmlFor="circle-grade">Grade Level</Label>
                        <Select value={grade} onValueChange={setGrade}>
                          <SelectTrigger id="circle-grade">
                            <SelectValue placeholder="Select a grade" />
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
                      <div className="space-y-2">
                        <Label htmlFor="circle-strand">Strand (Optional)</Label>
                        <Input
                          id="circle-strand"
                          placeholder="e.g., Algebra, Grammar, etc."
                          value={strand}
                          onChange={(e) => setStrand(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={() => {
                          handleCreateCircle();
                          setShowCreateCircleModal(false);
                        }}
                        disabled={isCreatingCircle || !newCircleName.trim() || !subject || !grade}
                      >
                        {isCreatingCircle ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Create Circle
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden p-0">
            {!selectedCircle ? (
              <div className="flex flex-col items-center justify-center h-full">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a study circle to start chatting
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[450px] px-4">
                <div className="space-y-4 py-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        No messages yet. Be the first to start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.user_id === user?.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.user_id === user?.id
                              ? "bg-primary text-primary-foreground"
                              : message.is_help_request
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-muted"
                          }`}
                        >
                          {message.user_id !== user?.id && (
                            <div className="flex items-center mb-1">
                              <Avatar className="h-5 w-5 mr-1">
                                <AvatarFallback>
                                  {message.first_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">
                                {message.first_name}
                              </span>
                              {message.is_help_request && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  <HelpCircle className="h-3 w-3 mr-1" />
                                  Help Request
                                </Badge>
                              )}
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            )}
          </CardContent>
          <CardFooter className="border-t p-4">
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder={
                  selectedCircle
                    ? "Type your message..."
                    : "Select a study circle to start chatting"
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={!selectedCircle}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={
                  isSendingMessage || !inputMessage.trim() || !selectedCircle
                }
              >
                {isSendingMessage ? (
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
            <CardTitle>Study Circles</CardTitle>
            <CardDescription>Join conversations with your peers</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {circles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No study circles available. Create one to get started!
                  </p>
                ) : (
                  circles.map((circle) => (
                    <div
                      key={circle.id}
                      className={`p-2 rounded-md cursor-pointer ${
                        selectedCircle?.id === circle.id
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => setSelectedCircle(circle)}
                    >
                      <div className="font-medium">{circle.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {circle.subject} • {circle.grade}
                        {circle.strand && ` • ${circle.strand}`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Flag for Help
            </CardTitle>
            <CardDescription>
              Ask a question and get help from your peers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="help-question">Your Question</Label>
                <Textarea
                  id="help-question"
                  placeholder="What do you need help with?"
                  value={helpQuestion}
                  onChange={(e) => setHelpQuestion(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="help-subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger id="help-subject">
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
                <Label htmlFor="help-grade">Grade Level</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger id="help-grade">
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
              <Button
                className="w-full"
                onClick={handleFlagForHelp}
                disabled={
                  isFlaggingHelp || !helpQuestion.trim() || !subject || !grade
                }
              >
                {isFlaggingHelp ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <HelpCircle className="h-4 w-4 mr-2" />
                )}
                Ask for Help
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
