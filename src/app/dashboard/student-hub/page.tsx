// frontend/src/app/dashboard/student-hub/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookOpen, History, Calendar, GraduationCap, Users, MessageSquare, Brain } from "lucide-react";
import { AiChatInterfaceWithThinking } from '@/components/ai/AiChatInterfaceWithThinking';
import { BookCollection } from '@/components/student/BookCollection';
import { AiTeacherAvatar } from '@/components/ai/AiTeacherAvatar';
import { LiveClassroom } from '@/components/classroom/LiveClassroom';
import { StudyGroup } from '@/components/classroom/StudyGroup';
import { ProgressTracker } from '@/components/classroom/ProgressTracker';
import { StudentPortalMaintenance } from '@/components/maintenance/StudentPortalMaintenance';

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
    const [showMaintenance, setShowMaintenance] = useState(true); // Set to true to always show maintenance page
    
    console.log('StudentHubPage: User role:', user?.role);

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
        
        // Log authentication state and user role
        if (hasMounted && !isLoadingAuth) {
            console.log('StudentHubPage: Authentication State:', { 
                isAuthenticated, 
                userRole: user?.role,
                userDetails: user
            });
        }
        
        // Add student role check
        if (hasMounted && !isLoadingAuth && isAuthenticated && user?.role !== 'student') {
           toast({ title: "Access Denied: Students Only", variant: "destructive" });
           router.push('/dashboard'); // Redirect non-students
        }
    }, [hasMounted, isLoadingAuth, isAuthenticated, router, toast, user]);

    // --- Fetch Available Books ---
    useEffect(() => {
        // Fetch books when authenticated (similar to ToS builder)
        if (hasMounted && isAuthenticated && token) {
            const fetchBooks = async () => {
                setIsLoadingBooks(true);
                try {
                    const response = await fetch('https://learnbridge-ai-service.onrender.com/api/ai/processed-documents', { headers: { 'Authorization': `Bearer ${token}` } });
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

                // Removed console log for security
                try {
                    const response = await fetch(`https://learnbridge-ai-service.onrender.com/api/ai/sbc-content?${params.toString()}`, {
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

    const [activeClassroomTab, setActiveClassroomTab] = useState("live");
    const [isAiTeacherActive, setIsAiTeacherActive] = useState(false);

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

    // Show maintenance page for students
    // Force maintenance page for students regardless of showMaintenance flag
    console.log('About to check if maintenance page should be shown:', {
        userRole: user?.role,
        isStudent: user?.role === 'student'
    });
    
    // Always show maintenance page for students
    if (user && user.role === 'student') {
        console.log('Showing maintenance page for student');
        return <StudentPortalMaintenance />;
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

            {/* Main Classroom Section */}
            <Card className="mb-8 border-slate-200 shadow-lg">
                <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AiTeacherAvatar isActive={isAiTeacherActive} />
                            <div>
                                <CardTitle className="text-xl">Virtual Classroom</CardTitle>
                                <CardDescription>Interactive learning with AI teacher and peers</CardDescription>
                            </div>
                        </div>
                        <Button 
                            variant={isAiTeacherActive ? "default" : "outline"}
                            onClick={() => setIsAiTeacherActive(!isAiTeacherActive)}
                            className={isAiTeacherActive ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                            <Brain className="h-4 w-4 mr-2" />
                            {isAiTeacherActive ? "AI Teacher Active" : "Activate AI Teacher"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <Tabs value={activeClassroomTab} onValueChange={setActiveClassroomTab}>
                        <TabsList className="grid grid-cols-3 mb-6">
                            <TabsTrigger value="live">
                                <Users className="h-4 w-4 mr-2" />
                                Live Session
                            </TabsTrigger>
                            <TabsTrigger value="study">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Study Groups
                            </TabsTrigger>
                            <TabsTrigger value="progress">
                                <History className="h-4 w-4 mr-2" />
                                My Progress
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="live">
                            <LiveClassroom isAiTeacherActive={isAiTeacherActive} />
                        </TabsContent>
                        
                        <TabsContent value="study">
                            <StudyGroup />
                        </TabsContent>
                        
                        <TabsContent value="progress">
                            <ProgressTracker />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Learning Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link href="/dashboard/student-hub/book-reader">
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <BookOpen className="h-8 w-8 text-brand-orange mb-3" />
                                <h3 className="font-semibold mb-1">Textbook Reader</h3>
                                <p className="text-sm text-slate-600">Interactive reading experience</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                
                <Link href="/dashboard/student-hub/daily-quizzes">
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <Calendar className="h-8 w-8 text-purple-600 mb-3" />
                                <h3 className="font-semibold mb-1">Daily Quizzes</h3>
                                <p className="text-sm text-slate-600">Test your knowledge</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                
                <Link href="/dashboard/student-hub/learning-path">
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <GraduationCap className="h-8 w-8 text-blue-600 mb-3" />
                                <h3 className="font-semibold mb-1">Learning Path</h3>
                                <p className="text-sm text-slate-600">Personalized curriculum</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                
                <Link href="/dashboard/student-hub/my-progress">
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <History className="h-8 w-8 text-green-600 mb-3" />
                                <h3 className="font-semibold mb-1">My Progress</h3>
                                <p className="text-sm text-slate-600">Track your achievements</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Book Collection */}
            <div className="mb-8">
                <BookCollection />
            </div>

            {/* AI Homework Help / Chat Section */}
            <Card className="border-slate-700 bg-slate-800/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-slate-800 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-brand-orange" />
                        <CardTitle className="text-white">AI Homework Helper</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400">
                        Get instant help with your studies from your AI teacher
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <AiChatInterfaceWithThinking />
                </CardContent>
            </Card>
        </div>
    );
}