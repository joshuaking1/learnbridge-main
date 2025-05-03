"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, 
  BookOpen, 
  Highlighter, 
  StickyNote, 
  Bookmark, 
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Download,
  Share2
} from "lucide-react";
import { TextbookReader } from "@/components/student/TextbookReader";
import { AnnotationPanel } from "@/components/student/AnnotationPanel";
import { NoteEditor } from "@/components/student/NoteEditor";
import { SearchPanel } from "@/components/student/SearchPanel";

// Interface for content chunks
interface ContentChunk {
  id: number;
  chunk_index: number;
  content: string;
  source_document_name: string;
}

interface Annotation {
  id: string;
  content: string;
  type: "highlight" | "note";
  color?: string;
  page: number;
  position: { x: number; y: number };
  timestamp: Date;
}

interface Note {
  id: string;
  title: string;
  content: string;
  page: number;
  timestamp: Date;
  tags: string[];
}

export default function BookReaderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);

  // State for book selection
  const [availableBooks, setAvailableBooks] = useState<string[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("Art and Design Studio");
  const [contentChunks, setContentChunks] = useState<ContentChunk[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [errorLoadingContent, setErrorLoadingContent] = useState<string | null>(null);
  const [bookSelected, setBookSelected] = useState(false);

  // State for reader features
  const [activeTab, setActiveTab] = useState("read");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);

  // Component mounted effect
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Authentication check
  useEffect(() => {
    if (hasMounted && !isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasMounted, isLoadingAuth, isAuthenticated, router]);

  // Load available books
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setIsLoadingBooks(true);
        const response = await fetch('/api/books', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to load books');
        }
        
        const data = await response.json();
        setAvailableBooks(data.books);
      } catch (error) {
        console.error('Error loading books:', error);
        toast({
          title: "Error",
          description: "Failed to load available books. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingBooks(false);
      }
    };

    if (isAuthenticated && token) {
      loadBooks();
    }
  }, [isAuthenticated, token, toast]);

  // Handle book selection
  const handleLoadBook = async () => {
    if (!selectedBook || !selectedSubject) return;

    try {
      setIsLoadingContent(true);
      setErrorLoadingContent(null);

      const response = await fetch(`/api/books/content?book=${selectedBook}&subject=${selectedSubject}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load book content');
      }

      const data = await response.json();
      setContentChunks(data.chunks);
      setBookSelected(true);
    } catch (error) {
      console.error('Error loading book content:', error);
      setErrorLoadingContent('Failed to load book content. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load book content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Handle annotation creation
  const handleCreateAnnotation = (annotation: Omit<Annotation, "id" | "timestamp">) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setAnnotations([...annotations, newAnnotation]);
  };

  // Handle note creation
  const handleCreateNote = (note: Omit<Note, "id" | "timestamp">) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setNotes([...notes, newNote]);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = contentChunks
      .map((chunk, index) => 
        chunk.content.toLowerCase().includes(query.toLowerCase()) ? index : -1
      )
      .filter(index => index !== -1);
    
    setSearchResults(results);
  };

  // Format book title for display
  const formatBookTitle = (bookPath: string) => {
    return bookPath.replace('uploads/', '').replace(/^[0-9]+_/, '').replace('.pdf', '');
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Textbook Reader"
        description="Interactive reading experience with advanced features"
        icon={BookOpen}
      />

      {!bookSelected ? (
        <Card>
          <CardHeader>
            <CardTitle>Select a Textbook</CardTitle>
            <CardDescription>Choose a subject and textbook to start reading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Subject Select */}
              <div className="space-y-2">
                <Label htmlFor="subject-select">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger id="subject-select">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Art and Design Studio">Art and Design Studio</SelectItem>
                    <SelectItem value="Integrated Science">Integrated Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English Language">English Language</SelectItem>
                    <SelectItem value="Social Studies">Social Studies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Book Select */}
              <div className="space-y-2">
                <Label htmlFor="book-select">Book/Level</Label>
                <Select 
                  value={selectedBook} 
                  onValueChange={setSelectedBook} 
                  disabled={isLoadingBooks || availableBooks.length === 0}
                >
                  <SelectTrigger id="book-select">
                    <SelectValue placeholder={isLoadingBooks ? "Loading..." : "Select Book"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBooks.map((book, index) => (
                      <SelectItem key={index} value={book}>
                        {formatBookTitle(book)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleLoadBook} 
              disabled={isLoadingContent || !selectedBook || !selectedSubject}
              className="w-full md:w-auto"
            >
              {isLoadingContent ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Open Textbook
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="h-[calc(100vh-180px)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setBookSelected(false)}
              >
                Select Different Book
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm">{zoomLevel}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation(prev => (prev - 90) % 360)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="mb-4">
              <TabsTrigger value="read">
                <BookOpen className="h-4 w-4 mr-1" />
                Read
              </TabsTrigger>
              <TabsTrigger value="annotate">
                <Highlighter className="h-4 w-4 mr-1" />
                Annotations
              </TabsTrigger>
              <TabsTrigger value="notes">
                <StickyNote className="h-4 w-4 mr-1" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search className="h-4 w-4 mr-1" />
                Search
              </TabsTrigger>
            </TabsList>

            <TabsContent value="read" className="h-[calc(100%-40px)]">
              <TextbookReader 
                contentChunks={contentChunks}
                bookTitle={formatBookTitle(selectedBook)}
                subject={selectedSubject}
                isLoading={isLoadingContent}
                zoomLevel={zoomLevel}
                rotation={rotation}
                annotations={annotations}
                onAnnotationCreate={handleCreateAnnotation}
                searchResults={searchResults}
              />
            </TabsContent>

            <TabsContent value="annotate" className="h-[calc(100%-40px)]">
              <AnnotationPanel 
                annotations={annotations}
                onAnnotationCreate={handleCreateAnnotation}
                onAnnotationDelete={(id) => {
                  setAnnotations(annotations.filter(a => a.id !== id));
                }}
              />
            </TabsContent>

            <TabsContent value="notes" className="h-[calc(100%-40px)]">
              <NoteEditor 
                notes={notes}
                onNoteCreate={handleCreateNote}
                onNoteDelete={(id) => {
                  setNotes(notes.filter(n => n.id !== id));
                }}
              />
            </TabsContent>

            <TabsContent value="search" className="h-[calc(100%-40px)]">
              <SearchPanel 
                searchQuery={searchQuery}
                onSearch={handleSearch}
                searchResults={searchResults}
                contentChunks={contentChunks}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </DashboardShell>
  );
}
