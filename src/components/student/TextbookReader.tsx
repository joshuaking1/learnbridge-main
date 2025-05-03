"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, BookOpen, BookMarked, ChevronLeft, ChevronRight, Menu, MessageSquare, LightbulbIcon, BrainCircuit } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/useAuthStore";

// Define the content chunk interface
interface ContentChunk {
  id: number;
  chunk_index: number;
  content: string;
  source_document_name: string;
}

interface TextbookReaderProps {
  contentChunks: ContentChunk[];
  bookTitle: string;
  subject: string;
  isLoading?: boolean;
}

export function TextbookReader({ contentChunks, bookTitle, subject, isLoading = false }: TextbookReaderProps) {
  const { toast } = useToast();
  const { token } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [highlightedText, setHighlightedText] = useState("");
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({ x: 0, y: 0 });
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGeneratingAiResponse, setIsGeneratingAiResponse] = useState(false);
  const [aiAction, setAiAction] = useState<"explain" | "quiz" | "summarize" | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [showTableOfContents, setShowTableOfContents] = useState(false);

  // Calculate total pages
  const totalPages = contentChunks.length;

  // Handle page navigation
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setHighlightedText("");
      setShowHighlightMenu(false);
      setAiResponse(null);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setHighlightedText("");
      setShowHighlightMenu(false);
      setAiResponse(null);
    }
  };

  // Handle text selection/highlighting
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const selectedText = selection.toString().trim();
      setHighlightedText(selectedText);
      
      // Get position for the highlight menu
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Position the menu above the selection
      setHighlightPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      
      setShowHighlightMenu(true);
    } else {
      setShowHighlightMenu(false);
    }
  };

  // Handle AI actions on highlighted text
  const handleAiAction = async (action: "explain" | "quiz" | "summarize") => {
    if (!highlightedText || highlightedText.length < 5) {
      toast({
        title: "Text selection too short",
        description: "Please select a longer passage of text.",
        variant: "destructive"
      });
      return;
    }

    setAiAction(action);
    setIsGeneratingAiResponse(true);
    setShowHighlightMenu(false);

    try {
      // Prepare the prompt based on the action
      let prompt = "";
      switch (action) {
        case "explain":
          prompt = `Please explain this passage in simple terms: "${highlightedText}"`;
          break;
        case "quiz":
          prompt = `Create 3 quiz questions with answers based on this passage: "${highlightedText}"`;
          break;
        case "summarize":
          prompt = `Summarize this passage in 2-3 sentences: "${highlightedText}"`;
          break;
      }

      // Call the AI API
      const response = await fetch('http://localhost:3004/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setAiResponse(data.response || "I couldn't generate a response for that text.");
    } catch (error) {
      console.error("Error calling AI:", error);
      toast({
        title: "AI Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive"
      });
      setAiResponse("Sorry, I encountered an error while processing your request.");
    } finally {
      setIsGeneratingAiResponse(false);
    }
  };

  // Close highlight menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowHighlightMenu(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Font size classes
  const fontSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg"
  };

  // Generate table of contents from content chunks
  const generateTableOfContents = () => {
    const toc: { title: string; index: number }[] = [];
    
    contentChunks.forEach((chunk, index) => {
      // Extract headings from content using regex
      const headingMatches = chunk.content.match(/^#{1,3}\s+(.+)$/gm);
      
      if (headingMatches && headingMatches.length > 0) {
        headingMatches.forEach(match => {
          const title = match.replace(/^#{1,3}\s+/, '');
          toc.push({ title, index });
        });
      } else if (index % 3 === 0) {
        // If no headings found, use chunk index as fallback for some chunks
        toc.push({ 
          title: `Section ${index + 1}`, 
          index 
        });
      }
    });
    
    return toc;
  };

  const tableOfContents = generateTableOfContents();

  return (
    <div className="flex flex-col h-full">
      {/* Textbook Header */}
      <Card className="mb-4 border-slate-200 bg-white shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-brand-orange" />
              <CardTitle className="text-xl text-slate-800">
                {bookTitle}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowTableOfContents(!showTableOfContents)}
                className="text-slate-600"
              >
                <Menu className="h-4 w-4 mr-1" />
                Contents
              </Button>
              <div className="flex border rounded-md">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFontSize("small")}
                  className={`px-2 ${fontSize === "small" ? "bg-slate-100" : ""}`}
                >
                  A<span className="text-xs">-</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFontSize("medium")}
                  className={`px-2 ${fontSize === "medium" ? "bg-slate-100" : ""}`}
                >
                  A
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFontSize("large")}
                  className={`px-2 ${fontSize === "large" ? "bg-slate-100" : ""}`}
                >
                  A<span className="text-xs">+</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            {subject} • Page {currentPage + 1} of {totalPages}
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Table of Contents Sidebar */}
        {showTableOfContents && (
          <Card className="w-64 border-slate-200 bg-white shadow-md overflow-hidden">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Table of Contents</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100%-60px)]">
              <CardContent className="py-0">
                <div className="space-y-1">
                  {tableOfContents.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start text-left ${currentPage === item.index ? "bg-slate-100 text-brand-orange" : ""}`}
                      onClick={() => {
                        setCurrentPage(item.index);
                        setAiResponse(null);
                      }}
                    >
                      {item.title}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        )}

        {/* Main Content and AI Response Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Content Display */}
          <Card className="flex-1 border-slate-200 bg-white shadow-md overflow-hidden mb-4">
            <CardContent className="p-0 h-full">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
                  <span className="ml-2 text-slate-500">Loading textbook content...</span>
                </div>
              ) : contentChunks.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full p-6 text-center">
                  <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-700">No Content Available</h3>
                  <p className="text-slate-500 max-w-md mt-2">
                    There is no content available for this textbook. Please select a different book or contact your teacher.
                  </p>
                </div>
              ) : (
                <div 
                  className="relative h-full"
                  onMouseUp={handleTextSelection}
                  onTouchEnd={handleTextSelection}
                >
                  <ScrollArea className="h-full px-8 py-6" ref={contentRef}>
                    <div className={`prose prose-slate max-w-none ${fontSizeClasses[fontSize]}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {contentChunks[currentPage]?.content || ""}
                      </ReactMarkdown>
                    </div>
                  </ScrollArea>

                  {/* Highlight Menu Popover */}
                  {showHighlightMenu && (
                    <div 
                      className="absolute z-50 bg-white rounded-lg shadow-lg border border-slate-200 p-1 flex"
                      style={{
                        left: `${highlightPosition.x}px`,
                        top: `${highlightPosition.y}px`,
                        transform: 'translate(-50%, -100%)'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-xs px-2 py-1 h-auto"
                        onClick={() => handleAiAction("explain")}
                      >
                        <LightbulbIcon className="h-3 w-3 mr-1" />
                        Explain
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-xs px-2 py-1 h-auto"
                        onClick={() => handleAiAction("quiz")}
                      >
                        <BrainCircuit className="h-3 w-3 mr-1" />
                        Quiz Me
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-xs px-2 py-1 h-auto"
                        onClick={() => handleAiAction("summarize")}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Summarize
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-slate-100 p-2 flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPrevPage} 
                disabled={currentPage === 0 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm text-slate-500">
                Page {currentPage + 1} of {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNextPage} 
                disabled={currentPage >= totalPages - 1 || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>

          {/* AI Response Area */}
          {(isGeneratingAiResponse || aiResponse) && (
            <Card className="border-slate-200 bg-white shadow-md">
              <CardHeader className="py-3 border-b border-slate-100">
                <CardTitle className="text-sm font-medium flex items-center">
                  {aiAction === "explain" && (
                    <>
                      <LightbulbIcon className="h-4 w-4 mr-2 text-yellow-500" />
                      Explanation
                    </>
                  )}
                  {aiAction === "quiz" && (
                    <>
                      <BrainCircuit className="h-4 w-4 mr-2 text-purple-500" />
                      Quiz Questions
                    </>
                  )}
                  {aiAction === "summarize" && (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                      Summary
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {isGeneratingAiResponse ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-orange mr-2" />
                    <span className="text-slate-500">Generating response...</span>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {aiResponse || ""}
                    </ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
