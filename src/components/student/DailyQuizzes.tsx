"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DailyQuiz {
    id: number;
    subject: string;
    book: string;
    topic: string;
    title: string;
    description: string;
    quiz_date: string;
    attempted: boolean;
}

export function DailyQuizzes() {
    const { token } = useAuthStore();
    const { toast } = useToast();
    const router = useRouter();

    const [quizzes, setQuizzes] = useState<DailyQuiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDailyQuizzes = async () => {
            if (!token) return;

            setIsLoading(true);
            setError(null);

            try {
                // Use relative URL in production, which will be handled by Vercel rewrites
                // or use localhost in development
                const apiUrl = process.env.NODE_ENV === 'production'
                    ? '/api/quizzes'
                    : 'https://learnbridgedu.onrender.com/api/daily-quizzes';

                const response = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    // Handle rate limit error specifically
                    if (response.status === 429) {
                        throw new Error('Daily usage limit reached. Please try again tomorrow.');
                    }
                    throw new Error('Failed to fetch daily quizzes');
                }

                const data = await response.json();
                setQuizzes(data);
            } catch (error) {
                console.error('Error fetching daily quizzes:', error);
                setError('Failed to load daily quizzes. Please try again later.');
                toast({
                    title: 'Error',
                    description: 'Failed to load daily quizzes',
                    variant: 'destructive'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDailyQuizzes();
    }, [token, toast]);

    const handleStartQuiz = (quizId: number) => {
        router.push(`/dashboard/student-hub/daily-quizzes/${quizId}`);
    };

    const handleViewResults = (quizId: number) => {
        router.push(`/dashboard/student-hub/daily-quizzes/${quizId}/results`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
                <span className="ml-2 text-gray-600">Loading daily quizzes...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                <p className="text-red-600">{error}</p>
                <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </Button>
            </div>
        );
    }

    if (quizzes.length === 0) {
        return (
            <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="pt-6 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No daily quizzes available for today.</p>
                    <p className="text-sm text-gray-500 mt-2">Check back tomorrow for new quizzes!</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Today's Daily Quizzes</h2>
                <Badge variant="outline" className="bg-brand-orange/10 text-brand-orange border-brand-orange/20">
                    {quizzes.length} Available
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                    <Card key={quiz.id} className={quiz.attempted ? "border-green-200 bg-green-50" : ""}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                                    <CardDescription className="mt-1">{quiz.book}</CardDescription>
                                </div>
                                {quiz.attempted && (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subject:</span>
                                    <span className="font-medium">{quiz.subject}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Topic:</span>
                                    <span className="font-medium">{quiz.topic}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            {quiz.attempted ? (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleViewResults(quiz.id)}
                                >
                                    View Results
                                </Button>
                            ) : (
                                <Button
                                    className="w-full bg-brand-orange hover:bg-brand-orange/90"
                                    onClick={() => handleStartQuiz(quiz.id)}
                                >
                                    Start Quiz
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
