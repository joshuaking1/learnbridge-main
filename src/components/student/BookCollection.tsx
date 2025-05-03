"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Library, Search, BookMarked } from "lucide-react";
import { BookCard } from "./BookCard";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Define book interface
interface Book {
  id: string;
  title: string;
  subject: string;
  lastRead?: string;
  progress?: number;
  coverColor?: string;
  path: string;
}

// Define available subjects
const subjects = [
  "All Subjects",
  "Art and Design Studio",
  "Integrated Science",
  "Mathematics",
  "English Language",
  "Social Studies"
];

// Define cover colors for different subjects
const subjectColors: Record<string, string> = {
  "Art and Design Studio": "bg-pink-500",
  "Integrated Science": "bg-green-500",
  "Mathematics": "bg-blue-500",
  "English Language": "bg-purple-500",
  "Social Studies": "bg-amber-500"
};

export function BookCollection() {
  const router = useRouter();
  const { toast } = useToast();
  const { token } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3004/api/ai/processed-documents', { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        if (!response.ok) throw new Error('Failed to fetch book list');
        
        const data = await response.json();
        const rawBooks = data.documents || [];
        
        // Transform raw book data into our Book interface
        const processedBooks: Book[] = rawBooks.map((path: string, index: number) => {
          // Extract title from path
          const title = path.replace('uploads/', '')
                           .replace(/^[0-9]+_/, '')
                           .replace('.pdf', '');
          
          // Assign a random subject for demonstration
          const randomSubject = subjects[Math.floor(Math.random() * (subjects.length - 1)) + 1];
          
          // Generate random progress for some books
          const hasProgress = Math.random() > 0.5;
          const progress = hasProgress ? Math.floor(Math.random() * 100) : 0;
          
          // Generate last read date for some books
          const hasLastRead = Math.random() > 0.3;
          const lastRead = hasLastRead ? 
            new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString() : 
            undefined;
          
          return {
            id: `book-${index}`,
            title,
            subject: randomSubject,
            lastRead,
            progress,
            coverColor: subjectColors[randomSubject] || "bg-brand-orange",
            path
          };
        });
        
        setBooks(processedBooks);
        setFilteredBooks(processedBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
        toast({ 
          title: "Error", 
          description: "Failed to load available books. Please try again later.", 
          variant: "destructive" 
        });
        setBooks([]);
        setFilteredBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchBooks();
    }
  }, [token, toast]);

  // Filter books based on subject and search query
  useEffect(() => {
    let result = [...books];
    
    // Filter by tab
    if (activeTab === "inProgress") {
      result = result.filter(book => book.progress && book.progress > 0 && book.progress < 100);
    } else if (activeTab === "completed") {
      result = result.filter(book => book.progress === 100);
    }
    
    // Filter by subject
    if (selectedSubject !== "All Subjects") {
      result = result.filter(book => book.subject === selectedSubject);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.subject.toLowerCase().includes(query)
      );
    }
    
    setFilteredBooks(result);
  }, [books, selectedSubject, searchQuery, activeTab]);

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-brand-orange" />
            <CardTitle>My Textbooks</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/dashboard/student-hub/book-reader')}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Open Reader
          </Button>
        </div>
        <CardDescription>Access your textbooks and learning materials</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All Books</TabsTrigger>
            <TabsTrigger value="inProgress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search books..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Books Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-32 animate-pulse bg-slate-100"></Card>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookMarked className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-700">No books found</h3>
            <p className="text-slate-500 mt-1">
              {searchQuery ? "Try a different search term or filter." : "No books available for the selected filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                title={book.title}
                subject={book.subject}
                lastRead={book.lastRead}
                progress={book.progress}
                coverColor={book.coverColor}
              />
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="text-sm text-slate-500">
          {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/student-hub/book-reader')}>
          View All Books
        </Button>
      </CardFooter>
    </Card>
  );
}
