// frontend/src/app/dashboard/student-hub/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, History } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AiChatInterface } from '@/components/ai/AiChatInterface'; // Import AI Chat Interface


// Interface for content chunks
interface ContentChunk {
    id: number;
    chunk_index: number;
    content: string;
    source_document_name: string;
}

export default function StudentHubPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);

    // State for content viewing
    const [availableBooks, setAvailableBooks] = useState<string[]>([]); // Reuse book fetching logic
    const [isLoadingBooks, setIsLoadingBooks] = useState(true);
    const [selectedBook, setSelectedBook] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState<string>("Art and Design Studio"); // Example default subject
    const [contentChunks, setContentChunks] = useState<ContentChunk[]>([]);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [errorLoadingContent, setErrorLoadingContent] = useState<string | null>(null);

    // --- Mount and Auth Check ---
    useEffect(() => { setHasMounted(true); }, []);
    useEffect(() => {
        if (hasMounted && !isLoadingAuth && !isAuthenticated) {
            toast({ title: "Authentication Required", variant: "destructive" });
            router.push('/login');
        }
        // Add student role check
        if (hasMounted && !isLoadingAuth && isAuthenticated && user?.role !== 'student') {
           toast({ title: "Access Denied: Students Only", variant: "destructive" });
           router.push('/dashboard'); // Redirect non-students
        }
    }, [hasMounted, isLoadingAuth, isAuthenticated, user, router, toast]);

    // --- Fetch Available Books ---
    useEffect(() => {
        // Fetch books when authenticated (similar to ToS builder)
        if (hasMounted && isAuthenticated && token) {
            const fetchBooks = async () => {
                setIsLoadingBooks(true);
                try {
                    const response = await fetch('http://localhost:3004/api/ai/processed-documents', { headers: { 'Authorization': `Bearer ${token}` } });
                    if (!response.ok) throw new Error('Failed to fetch book list');
                    const data = await response.json();
                    const books = data.documents || [];
                    setAvailableBooks(books);
                    if (books.length > 0) {
                        setSelectedBook(books[0]); // Select first book by default
                    }
                } catch (error: unknown) {
                    console.error("Error loading books:", error);
                    toast({ title: "Error", description: "Could not load available books.", variant: "destructive" });
                }
                finally { setIsLoadingBooks(false); }
            };
            fetchBooks();
        } else if (hasMounted) { setIsLoadingBooks(false); }
    }, [hasMounted, isAuthenticated, token, toast]);

    // --- Fetch Content Chunks when filters change ---
    useEffect(() => {
        const fetchContent = async () => {
            // Fetch only if filters are set, authenticated, and component mounted
            if (hasMounted && isAuthenticated && token && selectedBook && selectedSubject) {
                setIsLoadingContent(true);
                setErrorLoadingContent(null);
                setContentChunks([]); // Clear previous content

                // Construct query params
                const params = new URLSearchParams({
                    subject: selectedSubject,
                    book: selectedBook,
                    // topic: selectedTopic, // Add topic filter later if needed
                });

                console.log(`Fetching content for: ${selectedSubject} - ${selectedBook}`);
                try {
                    const response = await fetch(`http://localhost:3004/api/ai/sbc-content?${params.toString()}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (!response.ok) {
                        let errorMsg = `Failed to fetch content (Status: ${response.status})`;
                        try {
                            const errorData = await response.json();
                            errorMsg = errorData.error || errorMsg;
                        } catch {}
                        throw new Error(errorMsg);
                    }
                    const data = await response.json();
                    setContentChunks(data.contentChunks || []);
                } catch (error: unknown) {
                    console.error("Error fetching content chunks:", error);
                    const errorMessage = error instanceof Error ? error.message : "Could not load content.";
                    setErrorLoadingContent(errorMessage);
                    setContentChunks([]);
                    toast({ title: "Loading Error", description: errorMessage, variant: "destructive" });
                } finally {
                    setIsLoadingContent(false);
                }
            }
        };

        // Don't fetch automatically unless book is selected
        if (selectedBook && selectedSubject) {
             fetchContent();
        } else {
            setContentChunks([]); // Clear content if filters are not set
            setIsLoadingContent(false);
        }
    }, [hasMounted, isAuthenticated, token, selectedBook, selectedSubject, toast]); // Re-fetch when filters change


    // --- Render Logic ---
    if (!hasMounted || isLoadingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 md:p-8">
             <header className="mb-8 flex justify-between items-center">
                 <div>
                     {/* Adjust title for student view */}
                     <div className="flex items-center gap-3">
                         <div className="bg-brand-orange/20 p-2 rounded-full">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                             </svg>
                         </div>
                         <h1 className="text-3xl font-bold text-white">Student Learning Hub</h1>
                     </div>
                     <nav className="text-sm text-slate-400 mt-2 ml-14">
                         <Link href="/dashboard" className="hover:text-brand-orange transition-colors">Dashboard</Link>
                         {' / '}
                         <span className="text-brand-orange">SBC Content</span>
                     </nav>
                 </div>
                 <Button
                     variant="secondary"
                     onClick={() => router.push('/dashboard')}
                     className="bg-brand-orange text-white hover:bg-brand-orange/90"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                     </svg>
                     Back to Dashboard
                 </Button>
             </header>

            {/* Filters Section (Simplified) */}
            <Card className="mb-6 border-slate-700 bg-slate-800/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-slate-800 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <CardTitle className="text-white">Browse Content</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400">Select a subject and book to view curriculum content.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-6 pt-6">
                    {/* Subject Select */}
                     <div className="flex-1 space-y-2">
                         <Label htmlFor="subject-select" className="text-slate-300">Subject</Label>
                         <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                             <SelectTrigger id="subject-select" className="bg-slate-700 border-slate-600 text-white">
                                <SelectValue placeholder="Select Subject" />
                             </SelectTrigger>
                             <SelectContent className="bg-slate-700 border-slate-600 text-white">
                                 {/* Hardcode subjects for now */}
                                 <SelectItem value="Art and Design Studio">Art and Design Studio</SelectItem>
                                 <SelectItem value="Integrated Science">Integrated Science</SelectItem>
                                 <SelectItem value="Mathematics">Mathematics</SelectItem>
                                 <SelectItem value="English Language">English Language</SelectItem>
                                 {/* Add more subjects */}
                             </SelectContent>
                         </Select>
                     </div>
                     {/* Book Select (Dynamic) */}
                     <div className="flex-1 space-y-2">
                         <Label htmlFor="book-select" className="text-slate-300">Book/Level</Label>
                         <Select value={selectedBook} onValueChange={setSelectedBook} disabled={isLoadingBooks || availableBooks.length === 0}>
                             <SelectTrigger id="book-select" className="bg-slate-700 border-slate-600 text-white">
                                <SelectValue placeholder={isLoadingBooks ? "Loading..." : "Select Book"} />
                             </SelectTrigger>
                             <SelectContent className="bg-slate-700 border-slate-600 text-white">
                                 {isLoadingBooks ? <SelectItem value="-" disabled>Loading...</SelectItem> : null}
                                 {!isLoadingBooks && availableBooks.length === 0 ? <SelectItem value="-" disabled>No documents found</SelectItem> : null}
                                 {availableBooks.map(book => <SelectItem key={book} value={book}>{book.replace('uploads/', '').replace(/^[0-9]+_/, '')}</SelectItem>)}
                             </SelectContent>
                         </Select>
                     </div>
                </CardContent>
            </Card>

            {/* Navigation buttons for quizzes and progress */}
            <div className="my-6 flex justify-center flex-wrap gap-4">
                <Link href="/dashboard/student-hub/quizzes">
                    <Button size="lg" className="bg-purple-600 text-white hover:bg-purple-700">
                        <BookOpen className="mr-2 h-5 w-5" /> Browse Quizzes
                    </Button>
                </Link>
                {/* --- ADD LINK --- */}
                <Link href="/dashboard/student-hub/my-progress">
                    <Button size="lg" variant="secondary" className="bg-brand-midblue hover:bg-brand-midblue/90 text-white">
                        <History className="mr-2 h-5 w-5" /> My Progress
                    </Button>
                </Link>
                {/* --- END ADD LINK --- */}
            </div>

            {/* Content Display Area */}
            <Card className="border-slate-700 bg-slate-800/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-slate-800 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <CardTitle className="text-white">
                            {selectedSubject && selectedBook ? (
                                <span>Content: <span className="text-brand-orange">{selectedSubject}</span> - {selectedBook.replace('uploads/', '').replace(/^[0-9]+_/, '')}</span>
                            ) : (
                                <span>Curriculum Content</span>
                            )}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoadingContent && (
                        <div className="flex justify-center items-center py-16">
                            <div className="text-center">
                                <Loader2 className="h-10 w-10 animate-spin text-brand-orange mx-auto mb-4" />
                                <p className="text-slate-400">Loading curriculum content...</p>
                            </div>
                        </div>
                    )}
                    {!isLoadingContent && errorLoadingContent && (
                        <div className="p-6">
                            <Alert variant="destructive" className="bg-red-900/50 border-red-800 text-white">
                                <AlertTitle>Error Loading Content</AlertTitle>
                                <AlertDescription>{errorLoadingContent}</AlertDescription>
                            </Alert>
                        </div>
                    )}
                    {!isLoadingContent && !errorLoadingContent && contentChunks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p className="text-slate-400 max-w-md">No content found for the selected criteria. Please select a subject and book from the filters above.</p>
                        </div>
                    )}
                    {!isLoadingContent && !errorLoadingContent && contentChunks.length > 0 && (
                        <ScrollArea className="h-[60vh] border-t border-slate-700">
                            <div className="p-6">
                                <div className="prose prose-sm sm:prose-base max-w-none prose-headings:text-brand-orange prose-headings:font-semibold prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300 prose-a:text-brand-orange">
                                    {contentChunks.map(chunk => (
                                        <div key={chunk.id} className="mb-6 pb-6 border-b border-slate-700 last:border-b-0">
                                            <div className="text-xs text-slate-500 mb-2 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Section {chunk.chunk_index}
                                            </div>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {chunk.content}
                                            </ReactMarkdown>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>

            {/* --- AI Homework Help / Chat Section --- */}
            <Card className="mt-8 border-slate-700 bg-slate-800/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-slate-800 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <CardTitle className="text-white">AI Homework Helper</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400">Ask questions about the SBC, concepts, or get help with assignments.</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <AiChatInterface /> {/* Add the chat component here */}
                </CardContent>
            </Card>
            {/* --- End AI Chat Section --- */}

        </div>
    );
}