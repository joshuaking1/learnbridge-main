// frontend/src/app/dashboard/student-hub/quizzes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play } from "lucide-react"; // Icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';
// TODO: Add Select components here later for filtering

// Interface for quiz summary data - matches backend response
interface QuizSummary {
    id: number;
    title: string | null;
    subject: string;
    book: string;
    topic: string | null;
    description: string | null;
    created_at: string;
}

export default function StudentQuizzesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);
    const [quizzes, setQuizzes] = useState<QuizSummary[]>([]); // State for quizzes
    const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true); // Loading state
    const [errorLoading, setErrorLoading] = useState<string | null>(null);

    // TODO: Add state for filters (subject, book, topic) later

    // --- Mount and Auth Check ---
    useEffect(() => { setHasMounted(true); }, []);
    useEffect(() => {
        if (hasMounted && !isLoadingAuth && !isAuthenticated) {
            toast({ title: "Authentication Required", variant: "destructive" });
            router.push('/login');
        }
        // Optional: Student role check
        if (hasMounted && !isLoadingAuth && isAuthenticated && user?.role !== 'student') {
           toast({ title: "Access Denied: Students Only", variant: "destructive" });
           router.push('/dashboard'); // Redirect non-students
        }
    }, [hasMounted, isLoadingAuth, isAuthenticated, user, router, toast]);

    // --- Fetch Quizzes ---
    useEffect(() => {
        const fetchQuizzes = async () => {
            // Fetch only if authenticated and token is available
            if (hasMounted && isAuthenticated && token) {
                setIsLoadingQuizzes(true);
                setErrorLoading(null);
                try {
                    // TODO: Add filter parameters to URL later
                    const response = await fetch('http://localhost:3006/api/quizzes', { // Quiz Service URL
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (!response.ok) {
                        let errorMsg = `Failed to fetch quizzes (Status: ${response.status})`;
                        try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch {}
                        throw new Error(errorMsg);
                    }
                    const data: QuizSummary[] = await response.json();
                    setQuizzes(data);
                    console.log(`Fetched ${data.length} quizzes.`);
                } catch (error: unknown) {
                    console.error("Error fetching quizzes:", error);
                    const errorMsg = error instanceof Error ? error.message : "Could not load available quizzes.";
                    setErrorLoading(errorMsg);
                    setQuizzes([]);
                    toast({ title: "Loading Error", description: errorMsg, variant: "destructive" });
                } finally {
                    setIsLoadingQuizzes(false);
                }
            } else if (hasMounted && !isLoadingAuth && !isAuthenticated) {
                setIsLoadingQuizzes(false);
            }
        };
        // TODO: Add filter state variables to dependency array later
        fetchQuizzes();
    }, [hasMounted, isAuthenticated, isLoadingAuth, token, toast]);


    // --- Render Logic ---
    if (!hasMounted || isLoadingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            </div>
        );
    }

    if (!isAuthenticated || !user || user.role !== 'student') {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 md:p-8">
             <header className="mb-8 flex justify-between items-center">
                 <div>
                     <div className="flex items-center gap-3">
                         <div className="bg-purple-600/20 p-2 rounded-full">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                             </svg>
                         </div>
                         <h1 className="text-3xl font-bold text-white">Available Quizzes</h1>
                     </div>
                     <nav className="text-sm text-slate-400 mt-2 ml-14">
                         <Link href="/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link>
                         {' / '}
                         <Link href="/dashboard/student-hub" className="hover:text-purple-400 transition-colors">Student Hub</Link>
                         {' / '}
                         <span className="text-purple-400">Quizzes</span>
                     </nav>
                 </div>
                 <Button
                     variant="secondary"
                     onClick={() => router.push('/dashboard/student-hub')}
                     className="bg-purple-600 text-white hover:bg-purple-700"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                     </svg>
                     Back to Student Hub
                 </Button>
             </header>

            {/* TODO: Add Filter Section Here */}
            {/* <Card className="mb-6"> ... Filters ... </Card> */}

            {/* Loading State */}
            {isLoadingQuizzes && (
                <div className="flex justify-center items-center py-16">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-brand-orange mx-auto mb-4" />
                        <p className="text-gray-500">Loading available quizzes...</p>
                    </div>
                </div>
            )}
            {/* Error State */}
            {!isLoadingQuizzes && errorLoading && (
                <Alert variant="destructive" className="mt-6">
                    <AlertTitle>Error Loading Quizzes</AlertTitle>
                    <AlertDescription>{errorLoading}</AlertDescription>
                </Alert>
            )}
            {/* No Quizzes State */}
             {!isLoadingQuizzes && !errorLoading && quizzes.length === 0 && (
                 <Card className="text-center py-10 mt-6 border-slate-700 bg-slate-800/50 shadow-xl overflow-hidden">
                     <CardHeader>
                         <CardTitle className="text-white">No Quizzes Available</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <div className="flex flex-col items-center justify-center py-6">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                             </svg>
                             <CardDescription className="text-slate-400">Check back later or try different filters.</CardDescription>
                         </div>
                     </CardContent>
                 </Card>
             )}

            {/* Display Quizzes List */}
            {!isLoadingQuizzes && !errorLoading && quizzes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <Card key={quiz.id} className="border-slate-700 bg-slate-800/50 shadow-xl overflow-hidden hover:bg-slate-800/80 transition-colors flex flex-col justify-between">
                            <CardHeader className="bg-slate-800 border-b border-slate-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-white truncate">{quiz.title || `Quiz: ${quiz.topic ?? 'General'}...`}</CardTitle>
                                        <CardDescription className="text-slate-400 mt-1">{quiz.subject} - {quiz.book}</CardDescription>
                                    </div>
                                    <div className="bg-purple-600/20 p-2 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow pt-4">
                                {quiz.topic && <p className="text-sm text-slate-300 mb-1">Topic: {quiz.topic}</p>}
                                {quiz.description && <p className="text-sm text-slate-400 line-clamp-2">{quiz.description}</p>}
                                <p className="text-xs text-slate-500 mt-2">
                                    Created: {quiz.created_at ? format(new Date(quiz.created_at), 'PP') : 'N/A'}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t border-slate-700 pt-4 bg-slate-800/50">
                                {/* --- UPDATE THIS BUTTON TO A LINK --- */}
                                <Link href={`/dashboard/student-hub/quizzes/${quiz.id}`} passHref>
                                    <Button
                                        size="sm"
                                        title={`Start Quiz: ${quiz.title}`}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        <Play className="h-4 w-4 mr-1" /> Start Quiz
                                    </Button>
                                </Link>
                                {/* --- END UPDATE --- */}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}