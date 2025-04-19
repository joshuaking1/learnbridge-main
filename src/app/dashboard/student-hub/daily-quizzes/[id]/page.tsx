"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QuizQuestion {
    id: number;
    question_type: string;
    question_text: string;
    options: string[];
}

interface QuizMetadata {
    id: number;
    subject: string;
    book: string;
    topic: string;
    title: string;
    description: string;
    quiz_date: string;
}

export default function DailyQuizPage() {
    const { id } = useParams();
    const quizId = Array.isArray(id) ? id[0] : id;
    const { token } = useAuthStore();
    const { toast } = useToast();
    const router = useRouter();

    const [quiz, setQuiz] = useState<QuizMetadata | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuizData = async () => {
            if (!token || !quizId) return;

            setIsLoading(true);
            setError(null);

            try {
                // Fetch quiz metadata
                // Use relative URL in production, which will be handled by Vercel rewrites
                const apiBaseUrl = process.env.NODE_ENV === 'production'
                    ? '/api/daily-quizzes'
                    : 'https://learnbridgedu.onrender.com/api/daily-quizzes';

                const metadataResponse = await fetch(`${apiBaseUrl}/${quizId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!metadataResponse.ok) {
                    if (metadataResponse.status === 404) {
                        throw new Error('Quiz not found');
                    } else {
                        throw new Error('Failed to fetch quiz details');
                    }
                }

                const metadataData = await metadataResponse.json();

                // Check if quiz has already been attempted
                if (metadataData.attempted) {
                    router.push(`/dashboard/student-hub/daily-quizzes/${quizId}/results`);
                    return;
                }

                setQuiz(metadataData);

                // Fetch quiz questions
                const questionsResponse = await fetch(`${apiBaseUrl}/${quizId}/questions`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!questionsResponse.ok) {
                    if (questionsResponse.status === 403) {
                        // Quiz already attempted
                        const errorData = await questionsResponse.json();
                        router.push(`/dashboard/student-hub/daily-quizzes/${quizId}/results`);
                        return;
                    } else if (questionsResponse.status === 404) {
                        throw new Error('No questions found for this quiz');
                    } else {
                        throw new Error('Failed to fetch quiz questions');
                    }
                }

                const questionsData = await questionsResponse.json();
                setQuestions(questionsData);

                // Initialize answers object
                const initialAnswers: Record<string, string> = {};
                questionsData.forEach((question: QuizQuestion) => {
                    initialAnswers[question.id.toString()] = '';
                });
                setAnswers(initialAnswers);
            } catch (error) {
                console.error('Error fetching quiz data:', error);
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to load quiz',
                    variant: 'destructive'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuizData();
    }, [token, quizId, router, toast]);

    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleSubmit = async () => {
        if (!token || !quizId) return;

        // Check if all questions are answered
        const unansweredQuestions = Object.entries(answers).filter(([_, value]) => !value);

        if (unansweredQuestions.length > 0) {
            toast({
                title: 'Incomplete Quiz',
                description: `Please answer all questions before submitting.`,
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Use relative URL in production, which will be handled by Vercel rewrites
            const apiBaseUrl = process.env.NODE_ENV === 'production'
                ? '/api/daily-quizzes'
                : 'https://learnbridgedu.onrender.com/api/daily-quizzes';

            const response = await fetch(`${apiBaseUrl}/${quizId}/attempt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ answers })
            });

            if (!response.ok) {
                if (response.status === 403) {
                    // Quiz already attempted
                    router.push(`/dashboard/student-hub/daily-quizzes/${quizId}/results`);
                    return;
                } else {
                    throw new Error('Failed to submit quiz');
                }
            }

            const data = await response.json();

            toast({
                title: 'Quiz Submitted',
                description: `Your score: ${data.percentage}%`,
                variant: 'default'
            });

            // Redirect to results page
            router.push(`/dashboard/student-hub/daily-quizzes/${quizId}/results`);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to submit quiz',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoBack = () => {
        router.push('/dashboard/student-hub/daily-quizzes');
    };

    if (isLoading) {
        return (
            <DashboardShell>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
                    <span className="ml-2 text-gray-600">Loading quiz...</span>
                </div>
            </DashboardShell>
        );
    }

    if (error) {
        return (
            <DashboardShell>
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={handleGoBack}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Daily Quizzes
                </Button>

                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </DashboardShell>
        );
    }

    if (!quiz || questions.length === 0) {
        return (
            <DashboardShell>
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={handleGoBack}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Daily Quizzes
                </Button>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Quiz Found</AlertTitle>
                    <AlertDescription>This quiz is not available or has no questions.</AlertDescription>
                </Alert>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell>
            <Button
                variant="ghost"
                className="mb-4"
                onClick={handleGoBack}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Daily Quizzes
            </Button>

            <DashboardHeader
                heading={quiz.title}
                description={`${quiz.subject} - ${quiz.book}`}
                icon={Calendar}
            />

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Quiz Instructions</CardTitle>
                    <CardDescription>
                        Answer all questions to complete the quiz. You can only attempt this quiz once.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Topic:</span>
                            <span className="font-medium">{quiz.topic}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Questions:</span>
                            <span className="font-medium">{questions.length}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {questions.map((question, index) => (
                    <Card key={question.id} className="border-l-4 border-l-brand-orange">
                        <CardHeader>
                            <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                            <CardDescription className="text-base font-medium text-gray-800 mt-2">
                                {question.question_text}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {question.question_type === 'multiple_choice' && question.options && (
                                <RadioGroup
                                    value={answers[question.id.toString()]}
                                    onValueChange={(value) => handleAnswerChange(question.id.toString(), value)}
                                >
                                    <div className="space-y-3">
                                        {question.options.map((option, optionIndex) => (
                                            <div key={optionIndex} className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value={option}
                                                    id={`q${question.id}-option${optionIndex}`}
                                                />
                                                <Label
                                                    htmlFor={`q${question.id}-option${optionIndex}`}
                                                    className="text-base"
                                                >
                                                    {option}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <Button
                    className="bg-brand-orange hover:bg-brand-orange/90 px-8"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Quiz'
                    )}
                </Button>
            </div>
        </DashboardShell>
    );
}
