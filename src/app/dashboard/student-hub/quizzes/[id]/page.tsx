// frontend/src/app/dashboard/student-hub/quizzes/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // For Multiple Choice
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress"; // To show quiz progress
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Interface for a single question (without answer)
interface QuizQuestion {
    id: number; // Question ID
    quiz_id: number;
    question_type: string; // e.g., 'multiple_choice'
    question_text: string;
    options: string[] | null; // Array of strings for MCQs
}

// Interface for quiz metadata (optional, can fetch if needed)
interface QuizMetadata {
    id: number;
    title: string | null;
    subject: string;
    // Add other fields if needed
}

// Interface for submission results
interface QuizResults {
    message: string;
    attemptId: number;
    score: number;
    totalQuestions: number;
    percentage: number;
    attemptedAt: string;
}

export default function TakeQuizPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);

    const [quizMetadata, setQuizMetadata] = useState<QuizMetadata | null>(null); // Optional: Fetch quiz title etc.
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({}); // Store answers as { questionId: selectedOptionText }
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
    const [errorLoading, setErrorLoading] = useState<string | null>(null);

    const quizId = params.id as string; // Get quiz ID from URL

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

    // --- Fetch Quiz Questions ---
    useEffect(() => {
        const fetchQuestions = async () => {
            if (hasMounted && isAuthenticated && token && quizId) {
                setIsLoadingQuiz(true);
                setErrorLoading(null);
                setQuizResults(null); // Clear previous results if any
                try {
                    // Fetch questions (no answers)
                    const response = await fetch(`http://localhost:3006/api/quizzes/${quizId}/questions`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (!response.ok) {
                        let errorMsg = `Failed to load quiz questions (Status: ${response.status})`;
                        try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch {}
                        throw new Error(errorMsg);
                    }
                    const data: QuizQuestion[] = await response.json();
                    if (data.length === 0) {
                        throw new Error("No questions found for this quiz.");
                    }
                    setQuestions(data);
                    // Optionally fetch quiz metadata here too if needed
                    // const metaResponse = await fetch(`/api/quizzes/${quizId}`, ...);
                    // setQuizMetadata(await metaResponse.json());

                } catch (error: unknown) {
                    console.error("Error fetching quiz questions:", error);
                    const errorMessage = error instanceof Error ? error.message : "Could not load the quiz.";
                    setErrorLoading(errorMessage);
                    setQuestions([]);
                    toast({ title: "Loading Error", description: errorMessage, variant: "destructive" });
                } finally {
                    setIsLoadingQuiz(false);
                }
            } else if (hasMounted && !isLoadingAuth && !isAuthenticated) { setIsLoadingQuiz(false); }
              else if (hasMounted && !quizId) { setErrorLoading("Invalid quiz ID."); setIsLoadingQuiz(false); }
        };
        fetchQuestions();
    }, [hasMounted, isAuthenticated, isLoadingAuth, token, quizId, toast]); // Re-fetch if quizId changes

    // --- Handle Answer Selection ---
    const handleAnswerSelect = (questionId: number, selectedValue: string) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: selectedValue
        }));
    };

    // --- Navigation ---
    const goToNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };
    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    // --- Handle Quiz Submission ---
    const handleSubmitQuiz = async () => {
        if (!token || isSubmitting) return;

        const unansweredQuestions = questions.filter(q => !selectedAnswers[q.id]);
        if (unansweredQuestions.length > 0) {
             toast({ title: "Incomplete", description: `Please answer question ${unansweredQuestions[0].id} before submitting.`, variant: "default" });
             // Optionally navigate to the first unanswered question
             setCurrentQuestionIndex(questions.findIndex(q => q.id === unansweredQuestions[0].id));
             return;
        }

        // Optional: Add confirmation dialog here?

        setIsSubmitting(true);
        setQuizResults(null);
        console.log("Submitting answers:", selectedAnswers);

        try {
            const response = await fetch(`http://localhost:3006/api/quizzes/attempts/${quizId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ answers: selectedAnswers }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Quiz Submission Failed:", data);
                toast({ title: `Submission Failed (${response.status})`, description: data.error || "Error submitting quiz.", variant: "destructive" });
            } else {
                console.log("Quiz Submitted Successfully:", data);
                setQuizResults(data); // Store results
                toast({ title: "Quiz Submitted!", description: "Your results are shown below." });
                // Keep user on page to see results
            }
        } catch (error) {
            console.error("Network error submitting quiz:", error);
            toast({ title: "Network Error", description: "Could not connect to server to submit.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };


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

    const currentQuestion = questions[currentQuestionIndex];
    const progressValue = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 md:p-8 flex flex-col">
             <header className="mb-4 flex justify-between items-center">
                 <div>
                     <h1 className="text-2xl font-bold text-white">
                         {quizMetadata?.title || `Quiz ID: ${quizId}`} {/* Show title if fetched */}
                     </h1>
                     <nav className="text-sm text-slate-400 mt-2">
                         <Link href="/dashboard" className="hover:text-brand-orange transition-colors">Dashboard</Link> {' / '}
                         <Link href="/dashboard/student-hub" className="hover:text-brand-orange transition-colors">Student Hub</Link> {' / '}
                         <Link href="/dashboard/student-hub/quizzes" className="hover:text-brand-orange transition-colors">Quizzes</Link> {' / '}
                         <span className="text-brand-orange">Taking Quiz</span>
                     </nav>
                 </div>
                 {/* Maybe show timer later */}
             </header>

            {/* Loading/Error State for Quiz Questions */}
            {isLoadingQuiz && (
                <div className="flex justify-center items-center py-16">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-brand-orange mx-auto mb-4" />
                        <p className="text-gray-500">Loading quiz questions...</p>
                    </div>
                </div>
            )}
            {!isLoadingQuiz && errorLoading && (
                <Alert variant="destructive" className="mt-6">
                    <AlertTitle>Error Loading Quiz</AlertTitle>
                    <AlertDescription>{errorLoading}</AlertDescription>
                </Alert>
            )}

            {/* Main Quiz Area */}
            {!isLoadingQuiz && !errorLoading && questions.length > 0 && !quizResults && (
                <Card className="flex-grow flex flex-col border-slate-700 bg-slate-800/50 shadow-xl overflow-hidden">
                    <CardHeader className="bg-slate-800 border-b border-slate-700">
                         <Progress value={progressValue} className="w-full h-2 mb-2" />
                         <CardTitle className="text-white">Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                         {/* <CardDescription>Select the best answer.</CardDescription> */}
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4 p-6">
                        {/* Display Question Text */}
                        <p className="text-lg font-medium text-white">{currentQuestion?.question_text}</p>

                        {/* Display Options (Only for Multiple Choice for now) */}
                        {currentQuestion?.question_type === 'multiple_choice' && currentQuestion.options && (
                            <RadioGroup
                                value={selectedAnswers[currentQuestion.id] || ""}
                                onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                                className="space-y-2"
                            >
                                {currentQuestion.options.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-2 p-3 border border-slate-700 rounded-md hover:bg-slate-700/50 transition-colors">
                                        <RadioGroupItem value={option} id={`q${currentQuestion.id}-opt${index}`} />
                                        <Label htmlFor={`q${currentQuestion.id}-opt${index}`} className="flex-1 cursor-pointer text-slate-200">{option}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                        {/* TODO: Add input types for other question_types later */}

                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-slate-700 pt-4 bg-slate-800/50 p-6">
                        <Button
                            variant="secondary"
                            onClick={goToPreviousQuestion}
                            disabled={currentQuestionIndex === 0 || isSubmitting}
                            className="bg-slate-600 text-white hover:bg-slate-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </Button>
                        {currentQuestionIndex < questions.length - 1 ? (
                            <Button
                                onClick={goToNextQuestion}
                                disabled={isSubmitting}
                                className="bg-brand-orange text-white hover:bg-brand-orange/90">
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmitQuiz}
                                disabled={isSubmitting || Object.keys(selectedAnswers).length !== questions.length}
                                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Submit Quiz
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            )}

             {/* Results Display Area */}
             {quizResults && (
                 <Card className="mt-6 border-slate-700 bg-slate-800/50 shadow-xl overflow-hidden">
                     <CardHeader className="bg-slate-800 border-b border-slate-700">
                         <CardTitle className="text-center text-2xl text-white">Quiz Results</CardTitle>
                     </CardHeader>
                     <CardContent className="text-center space-y-3 p-6">
                         <p className="text-lg text-slate-200">You scored:</p>
                         <p className="text-4xl font-bold text-brand-orange">
                             {quizResults.score} / {quizResults.totalQuestions} ({quizResults.percentage}%)
                         </p>
                         <p className="text-sm text-slate-400">
                             Attempted on: {format(new Date(quizResults.attemptedAt), 'PPpp')}
                         </p>
                         {/* TODO: Add button to review answers or link back to quizzes */}
                          <Button
                            variant="secondary"
                            onClick={() => router.push('/dashboard/student-hub/quizzes')}
                            className="mt-4 bg-brand-orange text-white hover:bg-brand-orange/90">
                             Back to Quizzes
                         </Button>
                     </CardContent>
                 </Card>
             )}

        </div>
    );
}