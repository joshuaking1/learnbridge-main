"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Calendar, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminDailyQuizzesPage() {
    const router = useRouter();
    const { token, user } = useAuthStore();
    const { toast } = useToast();

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationResults, setGenerationResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Check if user is admin
    if (user && user.role !== 'admin') {
        router.push('/dashboard');
        return null;
    }

    const handleGenerateQuizzes = async () => {
        if (!token) return;

        setIsGenerating(true);
        setError(null);
        setGenerationResults(null);

        try {
            const response = await fetch('http://localhost:3006/api/daily-quizzes/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to generate quizzes: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setGenerationResults(data);

            toast({
                title: 'Success',
                description: 'Daily quizzes generated successfully',
                variant: 'default'
            });
        } catch (error) {
            console.error('Error generating daily quizzes:', error);
            setError(error instanceof Error ? error.message : 'An unknown error occurred');

            toast({
                title: 'Error',
                description: 'Failed to generate daily quizzes',
                variant: 'destructive'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <DashboardShell>
            <Button
                variant="ghost"
                className="mb-4"
                onClick={() => router.push('/dashboard')}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </Button>

            <DashboardHeader
                heading="Daily Quiz Administration"
                description="Manage daily quiz generation for SBC books"
                icon={Calendar}
            />

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Generate Daily Quizzes</CardTitle>
                    <CardDescription>
                        Manually trigger the generation of daily quizzes for all books in the SBC
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-600">
                        Daily quizzes are automatically generated at 1:00 AM every day. Use this button to manually trigger the generation process if needed.
                    </p>

                    <Alert variant="warning" className="bg-amber-50 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800">Important Note</AlertTitle>
                        <AlertDescription className="text-amber-700">
                            This process may take several minutes to complete, depending on the number of books in the SBC. The system will generate one quiz per book.
                        </AlertDescription>
                    </Alert>

                    <Alert variant="info" className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800">AI Integration</AlertTitle>
                        <AlertDescription className="text-blue-700">
                            If the SERVICE_TOKEN environment variable is not set, the system will use template quizzes instead of AI-generated content. Template quizzes are generic but still provide useful learning material.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={handleGenerateQuizzes}
                        disabled={isGenerating}
                        className="bg-brand-orange hover:bg-brand-orange/90"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Quizzes...
                            </>
                        ) : (
                            <>
                                <Calendar className="mr-2 h-4 w-4" />
                                Generate Daily Quizzes
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {generationResults && (
                <Card>
                    <CardHeader>
                        <CardTitle>Generation Results</CardTitle>
                        <CardDescription>
                            Summary of the quiz generation process
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Total Books Processed:</span>
                            <span>{generationResults.results.length}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="font-medium">Successfully Generated:</span>
                            <span className="text-green-600 font-medium">
                                {generationResults.results.filter((r: any) => r.status === 'success').length}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="font-medium">Failed:</span>
                            <span className="text-red-600 font-medium">
                                {generationResults.results.filter((r: any) => r.status === 'error').length}
                            </span>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <h3 className="font-medium">Details:</h3>
                            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                                {generationResults.results.map((result: any, index: number) => (
                                    <div
                                        key={index}
                                        className={`flex items-center p-2 ${
                                            index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                        }`}
                                    >
                                        {result.status === 'success' ? (
                                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{result.book}</p>
                                            {result.status === 'error' && (
                                                <p className="text-xs text-red-600 truncate">{result.error}</p>
                                            )}
                                            {result.status === 'success' && (
                                                <p className="text-xs text-green-600">Quiz ID: {result.quizId}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </DashboardShell>
    );
}
