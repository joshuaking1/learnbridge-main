// frontend/src/app/dashboard/student-hub/my-progress/[attemptId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Info, ArrowLeft } from "lucide-react"; // Icons - removed unused import
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Separator } from "@/components/ui/separator"; // Removed unused import
import { format } from 'date-fns';
import { cn } from "@/lib/utils"; // For conditional classes - removed unused import

// Interface for a question with answer/explanation
interface ReviewQuestion {
    id: number; // Question ID
    quiz_id: number;
    question_type: string;
    question_text: string;
    options: string[] | null;
    correct_answer: string;
    explanation: string | null;
}

// Interface for the attempt details
interface AttemptDetails {
    id: number;
    quizId: number;
    score: number;
    totalQuestions: number;
    percentage: number;
    attemptedAt: string;
    submittedAnswers: { [key: string]: string }; // { questionId: submittedAnswer }
}

// Interface for the combined review data
interface QuizReviewData {
    attempt: AttemptDetails;
    questions: ReviewQuestion[];
}

export default function QuizReviewPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);

    const [reviewData, setReviewData] = useState<QuizReviewData | null>(null);
    const [isLoadingReview, setIsLoadingReview] = useState(true);
    const [errorLoading, setErrorLoading] = useState<string | null>(null);

    const attemptId = params.attemptId as string; // Get attempt ID from URL

    // --- Mount and Auth Check ---
    useEffect(() => { setHasMounted(true); }, []);
    useEffect(() => {
        if (hasMounted && !isLoadingAuth && !isAuthenticated) {
            toast({ title: "Authentication Required", variant: "destructive" });
            router.push('/login');
        }
        if (hasMounted && !isLoadingAuth && isAuthenticated && user?.role !== 'student') {
           toast({ title: "Access Denied: Students Only", variant: "destructive" });
           router.push('/dashboard'); // Redirect non-students
        }
    }, [hasMounted, isLoadingAuth, isAuthenticated, user, router, toast]);

    // --- Fetch Quiz Review Data ---
    useEffect(() => {
        const fetchReview = async () => {
            if (hasMounted && isAuthenticated && token && attemptId) {
                setIsLoadingReview(true);
                setErrorLoading(null);
                try {
                    const response = await fetch(`http://localhost:3006/api/quizzes/attempts/${attemptId}/review`, { // Use new review endpoint
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (!response.ok) {
                        let errorMsg = `Failed to load review (Status: ${response.status})`;
                        try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch {}
                        throw new Error(errorMsg);
                    }
                    const data: QuizReviewData = await response.json();
                    setReviewData(data);
                    console.log("Fetched review data for attempt:", attemptId);
                } catch (error: unknown) {
                    console.error("Error fetching review data:", error);
                    const errorMessage = error instanceof Error ? error.message : "Could not load quiz review.";
                    setErrorLoading(errorMessage);
                    setReviewData(null);
                    toast({ title: "Loading Error", description: errorMessage, variant: "destructive" });
                } finally {
                    setIsLoadingReview(false);
                }
            } else if (hasMounted && !isLoadingAuth && !isAuthenticated) { setIsLoadingReview(false); }
              else if (hasMounted && !attemptId) { setErrorLoading("Invalid attempt ID."); setIsLoadingReview(false); }
        };
        fetchReview();
    }, [hasMounted, isAuthenticated, isLoadingAuth, token, attemptId, toast]);


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

    // Helper to check if answer was correct
    const isCorrect = (question: ReviewQuestion, submittedAnswers: { [key: string]: string }) => {
         const submitted = submittedAnswers[question.id.toString()];
         const correct = question.correct_answer;
         return submitted && correct && submitted.trim().toLowerCase() === correct.trim().toLowerCase();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 md:p-8">
             <header className="mb-6 flex justify-between items-center">
                 <div>
                     <h1 className="text-3xl font-bold text-white">Quiz Review</h1>
                     <nav className="text-sm text-slate-400 mt-2">
                         <Link href="/dashboard" className="hover:text-brand-orange transition-colors">Dashboard</Link> {' / '}
                         <Link href="/dashboard/student-hub" className="hover:text-brand-orange transition-colors">Student Hub</Link> {' / '}
                         <Link href="/dashboard/student-hub/my-progress" className="hover:text-brand-orange transition-colors">My Progress</Link> {' / '}
                         <span className="text-brand-orange">Review Attempt</span>
                     </nav>
                 </div>
                 <Button
                     variant="secondary"
                     onClick={() => router.push('/dashboard/student-hub/my-progress')}
                     className="bg-purple-600 text-white hover:bg-purple-700"
                 >
                     <ArrowLeft className="h-4 w-4 mr-2" /> Back to Progress
                 </Button>
             </header>

            {/* Loading State */}
            {isLoadingReview && (
                <div className="flex justify-center items-center py-16">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-brand-orange mx-auto mb-4" />
                        <p className="text-slate-400">Loading quiz review...</p>
                    </div>
                </div>
            )}
            {/* Error State */}
            {!isLoadingReview && errorLoading && (
                <Alert variant="destructive" className="mt-6 bg-red-900/50 border-red-800 text-white">
                    <AlertTitle>Error Loading Review</AlertTitle>
                    <AlertDescription>{errorLoading}</AlertDescription>
                </Alert>
            )}
            {/* No Data State */}
             {!isLoadingReview && !errorLoading && !reviewData && (
                 <Card className="text-center py-10 mt-6 border-slate-700 bg-slate-800/50 shadow-xl overflow-hidden">
                     <CardHeader>
                         <CardTitle className="text-white">Quiz Review Not Found</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <CardDescription className="text-slate-400">Could not load the details for this quiz attempt.</CardDescription>
                     </CardContent>
                 </Card>
             )}

            {/* Display Review */}
            {!isLoadingReview && !errorLoading && reviewData && (
                <div className="space-y-6">
                    {/* Summary Card */}
                    <Card className="border-slate-700 bg-slate-800/50 shadow-xl overflow-hidden">
                         <CardHeader className="bg-slate-800 border-b border-slate-700">
                             <CardTitle className="text-white">Attempt Summary</CardTitle>
                             {/* Optionally fetch quiz title here if needed */}
                             {/* <CardDescription className="text-slate-400">Quiz: {reviewData.quiz?.title || `ID ${reviewData.attempt.quizId}`}</CardDescription> */}
                         </CardHeader>
                         <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center p-6">
                             <div>
                                 <p className="text-sm text-slate-400">Score</p>
                                 <p className="text-xl font-semibold text-white">{reviewData.attempt.score}/{reviewData.attempt.totalQuestions}</p>
                             </div>
                             <div>
                                 <p className="text-sm text-slate-400">Percentage</p>
                                 <p className={`text-xl font-semibold ${reviewData.attempt.percentage >= 70 ? "text-green-400" : "text-orange-400"}`}>
                                     {parseFloat(String(reviewData.attempt.percentage)).toFixed(2)}%
                                 </p>
                             </div>
                             <div>
                                 <p className="text-sm text-slate-400">Attempt ID</p>
                                 <p className="text-xl font-semibold text-white">{reviewData.attempt.id}</p>
                             </div>
                             <div>
                                 <p className="text-sm text-slate-400">Date</p>
                                 <p className="text-xl font-semibold text-white">{format(new Date(reviewData.attempt.attemptedAt), 'PP')}</p>
                             </div>
                         </CardContent>
                    </Card>

                    {/* Questions Review */}
                    <Card className="border-slate-700 bg-slate-800/50 shadow-xl overflow-hidden">
                         <CardHeader className="bg-slate-800 border-b border-slate-700">
                             <CardTitle className="text-white">Questions Review</CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-6 p-6">
                             {reviewData.questions.map((q, index) => {
                                 const questionIdStr = q.id.toString();
                                 const submittedAnswer = reviewData.attempt.submittedAnswers[questionIdStr];
                                 const correct = isCorrect(q, reviewData.attempt.submittedAnswers);

                                 return (
                                     <div key={q.id} className="pb-6 border-b border-slate-700 last:border-b-0">
                                         <p className="font-semibold mb-2 text-white">Question {index + 1}:</p>
                                         <p className="mb-3 text-slate-300">{q.question_text}</p>

                                         {/* Display Options for MCQs */}
                                         {q.question_type === 'multiple_choice' && q.options && (
                                             <div className="space-y-2 mb-3">
                                                 {q.options.map((option, optIndex) => {
                                                     const isSubmitted = submittedAnswer === option;
                                                     const isCorrectAnswer = q.correct_answer === option;
                                                     return (
                                                         <div
                                                             key={optIndex}
                                                             className={cn(
                                                                 "flex items-center space-x-2 p-2 border rounded-md text-sm",
                                                                 isSubmitted && !correct ? "bg-red-900/30 border-red-800/50 text-red-300" : "",
                                                                 isCorrectAnswer ? "bg-green-900/30 border-green-800/50 text-green-300 font-medium" : ""
                                                             )}
                                                         >
                                                             {/* Indicate selection and correctness */}
                                                             {isSubmitted && !correct && <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                                                             {isCorrectAnswer && <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />}
                                                             {!isCorrectAnswer && !isSubmitted && <div className="w-4 h-4 flex-shrink-0"></div>} {/* Placeholder for alignment */}

                                                             <span>{option}</span>
                                                             {isSubmitted && !correct && <span className="ml-auto text-xs font-semibold text-red-400">(Your Answer)</span>}
                                                             {isCorrectAnswer && !isSubmitted && <span className="ml-auto text-xs font-semibold text-green-400">(Correct Answer)</span>}
                                                              {isCorrectAnswer && isSubmitted && <span className="ml-auto text-xs font-semibold text-green-400">(Correct)</span>}
                                                         </div>
                                                     );
                                                 })}
                                             </div>
                                         )}

                                         {/* Display Submitted vs Correct for other types (basic) */}
                                         {q.question_type !== 'multiple_choice' && (
                                             <div className="space-y-1 text-sm mb-3">
                                                  <p>Your Answer: <span className={cn(!correct ? "text-red-400" : "text-green-400")}>{submittedAnswer || <span className="italic text-slate-500">Not Answered</span>}</span></p>
                                                  {!correct && <p>Correct Answer: <span className="text-green-400">{q.correct_answer}</span></p>}
                                             </div>
                                         )}

                                         {/* Display Explanation */}
                                         {q.explanation && (
                                             <Alert variant="default" className="bg-blue-900/20 border-blue-800/50 text-blue-300">
                                                 <Info className="h-4 w-4 !text-blue-400" /> {/* Force icon color */}
                                                 <AlertTitle className="text-blue-200">Explanation</AlertTitle>
                                                 <AlertDescription className="prose prose-sm max-w-none prose-p:text-slate-300 prose-headings:text-blue-200">
                                                      {q.explanation && <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.explanation}</ReactMarkdown>}
                                                 </AlertDescription>
                                             </Alert>
                                         )}
                                     </div>
                                 );
                             })}
                         </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}