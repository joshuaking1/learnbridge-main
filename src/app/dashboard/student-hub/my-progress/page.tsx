// frontend/src/app/dashboard/student-hub/my-progress/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Import Table components
import { format } from 'date-fns';

// Interface for attempt history data - matches backend response
interface AttemptHistory {
    attempt_id: number;
    quiz_id: number;
    score: number;
    total_questions: number;
    percentage: number; // Comes as string/numeric from DB, might need parseFloat
    attempted_at: string;
    quiz_title: string | null;
    quiz_subject: string;
    quiz_book: string;
    quiz_topic: string | null;
}

export default function MyProgressPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);
    const [attempts, setAttempts] = useState<AttemptHistory[]>([]); // State for attempts
    const [isLoadingAttempts, setIsLoadingAttempts] = useState(true);
    const [errorLoading, setErrorLoading] = useState<string | null>(null);

    // --- Mount and Auth Check ---
    useEffect(() => { setHasMounted(true); }, []);
    useEffect(() => {
        if (hasMounted && !isLoadingAuth && !isAuthenticated) {
            toast({ title: "Authentication Required", variant: "destructive" });
            router.push('/login');
        }
        if (hasMounted && !isLoadingAuth && isAuthenticated && user?.role !== 'student') {
           toast({ title: "Access Denied: Students Only", variant: "destructive" });
           router.push('/dashboard');
        }
    }, [hasMounted, isLoadingAuth, isAuthenticated, user, router, toast]);

    // --- Fetch Attempt History ---
    useEffect(() => {
        const fetchAttempts = async () => {
            if (hasMounted && isAuthenticated && token) {
                setIsLoadingAttempts(true);
                setErrorLoading(null);
                try {
                    const response = await fetch('http://localhost:3006/api/quizzes/attempts/my', { // Use new endpoint
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (!response.ok) {
                        let errorMsg = `Failed to fetch attempt history (Status: ${response.status})`;
                        try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch {}
                        throw new Error(errorMsg);
                    }
                    const data: AttemptHistory[] = await response.json();
                    setAttempts(data);
                    console.log(`Fetched ${data.length} quiz attempts.`);
                } catch (error: unknown) {
                    console.error("Error fetching attempt history:", error);
                    const errorMsg = error instanceof Error ? error.message : "Could not load your quiz history.";
                    setErrorLoading(errorMsg);
                    setAttempts([]);
                    toast({ title: "Loading Error", description: errorMsg, variant: "destructive" });
                } finally {
                    setIsLoadingAttempts(false);
                }
            } else if (hasMounted && !isLoadingAuth && !isAuthenticated) {
                setIsLoadingAttempts(false);
            }
        };
        fetchAttempts();
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
             <header className="mb-6 flex justify-between items-center">
                 <div>
                     <h1 className="text-3xl font-bold text-white">My Quiz Progress</h1>
                     <nav className="text-sm text-slate-400 mt-2">
                         <Link href="/dashboard" className="hover:text-brand-orange transition-colors">Dashboard</Link>
                         {" / "}
                         <Link href="/dashboard/student-hub" className="hover:text-brand-orange transition-colors">Student Hub</Link>
                         {" / "}
                         <span className="text-brand-orange">My Progress</span>
                     </nav>
                 </div>
                 <Button
                     variant="secondary"
                     onClick={() => router.push('/dashboard/student-hub')}
                     className="bg-brand-orange text-white hover:bg-brand-orange/90"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                     </svg>
                     Back to Hub
                 </Button>
             </header>

            {/* Loading State */}
            {isLoadingAttempts && (
                <div className="flex justify-center items-center py-16">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-brand-orange mx-auto mb-4" />
                        <p className="text-slate-400">Loading your quiz history...</p>
                    </div>
                </div>
            )}
            {/* Error State */}
            {!isLoadingAttempts && errorLoading && (
                <Alert variant="destructive" className="mt-6">
                    <AlertTitle>Error Loading Quiz History</AlertTitle>
                    <AlertDescription>{errorLoading}</AlertDescription>
                </Alert>
            )}
            {/* No Attempts State */}
             {!isLoadingAttempts && !errorLoading && attempts.length === 0 && (
                 <Card className="text-center py-10 mt-6 border-slate-700 bg-slate-800/50 shadow-xl overflow-hidden">
                     <CardHeader>
                         <CardTitle className="text-white">No Quiz Attempts Yet</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <CardDescription className="text-slate-400 mb-4">Take some quizzes to see your progress here!</CardDescription>
                         <Link href="/dashboard/student-hub/quizzes">
                             <Button className="bg-purple-600 hover:bg-purple-700 text-white">Find a Quiz</Button>
                         </Link>
                     </CardContent>
                 </Card>
             )}

            {/* Display Attempts Table */}
            {!isLoadingAttempts && !errorLoading && attempts.length > 0 && (
                <Card className="border-slate-700 bg-slate-800/50 shadow-xl overflow-hidden">
                    <CardHeader className="bg-slate-800 border-b border-slate-700">
                        <CardTitle className="text-white">Quiz History</CardTitle>
                        <CardDescription className="text-slate-400">Your recent quiz attempts and scores.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table className="text-slate-300">
                            <TableHeader className="bg-slate-800/50">
                                <TableRow className="border-slate-700 hover:bg-slate-800/80">
                                    <TableHead className="text-slate-300">Quiz Title</TableHead>
                                    <TableHead className="text-slate-300">Subject</TableHead>
                                    <TableHead className="text-slate-300">Score</TableHead>
                                    <TableHead className="text-slate-300">Percentage</TableHead>
                                    <TableHead className="text-slate-300 text-right">Date Attempted</TableHead>
                                    <TableHead className="text-slate-300 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attempts.map((attempt) => (
                                    <TableRow key={attempt.attempt_id} className="border-slate-700 hover:bg-slate-800/50">
                                        <TableCell className="font-medium text-white">{attempt.quiz_title || `Quiz ID ${attempt.quiz_id}`}</TableCell>
                                        <TableCell>{attempt.quiz_subject}</TableCell>
                                        <TableCell>{attempt.score} / {attempt.total_questions}</TableCell>
                                        <TableCell className={attempt.percentage >= 70 ? "text-green-400" : "text-orange-400"}>
                                            {parseFloat(String(attempt.percentage)).toFixed(2)}%
                                        </TableCell>
                                        <TableCell className="text-right">{format(new Date(attempt.attempted_at), 'Pp')}</TableCell>
                                        {/* --- ADD REVIEW BUTTON LINK --- */}
                                        <TableCell className="text-right">
                                             <Link href={`/dashboard/student-hub/my-progress/${attempt.attempt_id}`} passHref>
                                                 <Button
                                                     variant="secondary"
                                                     size="sm"
                                                     className="bg-purple-600 text-white hover:bg-purple-700">
                                                     <Eye className="h-4 w-4 mr-1" /> Review
                                                 </Button>
                                             </Link>
                                        </TableCell>
                                        {/* --- END REVIEW BUTTON LINK --- */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}