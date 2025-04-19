"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowLeft, Loader2, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface QuizResult {
    attemptId: number;
    score: number;
    totalQuestions: number;
    percentage: number;
    attemptedAt: string;
    questions: {
        id: number;
        type: string;
        text: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
        userAnswer: string;
        isCorrect: boolean;
    }[];
}

export default function QuizResultsPage() {
    const { id } = useParams();
    const quizId = Array.isArray(id) ? id[0] : id;
    const { token } = useAuthStore();
    const { toast } = useToast();
    const router = useRouter();
    
    const [results, setResults] = useState<QuizResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchResults = async () => {
            if (!token || !quizId) return;
            
            setIsLoading(true);
            setError(null);
            
            try {
                const response = await fetch(`https://learnbridgedu.onrender.com/api/daily-quizzes/${quizId}/results`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('No attempt found for this quiz');
                    } else {
                        throw new Error('Failed to fetch quiz results');
                    }
                }
                
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error('Error fetching quiz results:', error);
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to load quiz results',
                    variant: 'destructive'
                });
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchResults();
    }, [token, quizId, toast]);
    
    const handleGoBack = () => {
        router.push('/dashboard/student-hub/daily-quizzes');
    };
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };
    
    if (isLoading) {
        return (
            <DashboardShell>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
                    <span className="ml-2 text-gray-600">Loading results...</span>
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
    
    if (!results) {
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
                    <AlertTitle>No Results Found</AlertTitle>
                    <AlertDescription>You haven't attempted this quiz yet.</AlertDescription>
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
                heading="Quiz Results"
                description="Review your answers and see your score"
                icon={Calendar}
            />
            
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Your Score</CardTitle>
                    <CardDescription>
                        Completed on {formatDate(results.attemptedAt)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-medium">
                                {results.score} / {results.totalQuestions} correct
                            </span>
                            <span className="text-lg font-bold text-brand-orange">
                                {results.percentage}%
                            </span>
                        </div>
                        
                        <Progress value={results.percentage} className="h-2" />
                        
                        <div className="pt-2 text-sm text-gray-500">
                            {results.percentage >= 80 ? (
                                <div className="flex items-center text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Excellent! You've mastered this content.
                                </div>
                            ) : results.percentage >= 60 ? (
                                <div className="flex items-center text-amber-600">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Good job! You're on the right track.
                                </div>
                            ) : (
                                <div className="flex items-center text-red-600">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Keep practicing! Review the content and try again.
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <div className="space-y-6">
                <h3 className="text-lg font-semibold">Question Review</h3>
                
                {results.questions.map((question, index) => (
                    <Card 
                        key={question.id} 
                        className={`border-l-4 ${question.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between">
                                <CardTitle className="text-base">Question {index + 1}</CardTitle>
                                {question.isCorrect ? (
                                    <span className="flex items-center text-green-600 text-sm">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Correct
                                    </span>
                                ) : (
                                    <span className="flex items-center text-red-600 text-sm">
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Incorrect
                                    </span>
                                )}
                            </div>
                            <CardDescription className="text-base font-medium text-gray-800 mt-2">
                                {question.text}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {question.type === 'multiple_choice' && question.options && (
                                    <div className="space-y-2">
                                        {question.options.map((option, optionIndex) => (
                                            <div 
                                                key={optionIndex} 
                                                className={`p-2 rounded-md ${
                                                    option === question.correctAnswer 
                                                        ? 'bg-green-100 border border-green-200' 
                                                        : option === question.userAnswer && !question.isCorrect
                                                            ? 'bg-red-100 border border-red-200'
                                                            : 'bg-gray-50 border border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <div className="flex-1">
                                                        {option}
                                                    </div>
                                                    {option === question.correctAnswer && (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    )}
                                                    {option === question.userAnswer && !question.isCorrect && (
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <Separator />
                                
                                <div>
                                    <h4 className="font-medium mb-1">Explanation:</h4>
                                    <p className="text-gray-700">{question.explanation}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </DashboardShell>
    );
}
