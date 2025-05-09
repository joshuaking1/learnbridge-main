// frontend/src/app/dashboard/my-assessments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Eye } from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';

// Interface for assessment summary data - adjust fields to match GET /assessments response
interface AssessmentSummary {
    id: number;
    title: string | null;
    subject: string;
    class_level: string;
    topic: string;
    assessment_type: string; // Added assessment type
    created_at: string;
    updated_at: string;
}

export default function MyAssessmentsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);
    const [assessments, setAssessments] = useState<AssessmentSummary[]>([]); // State for assessments
    const [isLoadingAssessments, setIsLoadingAssessments] = useState(true); // Loading state
    const [errorLoading, setErrorLoading] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // --- Mount and Auth Check ---
    useEffect(() => { setHasMounted(true); }, []);
    useEffect(() => {
        if (hasMounted && !isLoadingAuth && !isAuthenticated) {
            toast({ title: "Authentication Required", variant: "destructive" });
            router.push('/login');
        }
        if (hasMounted && !isLoadingAuth && isAuthenticated && user?.role !== 'teacher') {
           toast({ title: "Access Denied: Teachers Only", variant: "destructive" });
           router.push('/dashboard');
        }
    }, [hasMounted, isLoadingAuth, isAuthenticated, user, router, toast]);

    // --- Fetch Assessments ---
    useEffect(() => {
        const fetchAssessments = async () => {
            if (hasMounted && isAuthenticated && token) {
                setIsLoadingAssessments(true);
                setErrorLoading(null);
                try {
                    // Use the correct endpoint for fetching assessments
                    const response = await fetch('https://learnbridge-teacher-tools-service.onrender.com/api/teacher-tools/assessments', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (!response.ok) {
                        let errorMsg = `Failed to fetch assessments (Status: ${response.status})`;
                        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {}
                        throw new Error(errorMsg);
                    }
                    const data: AssessmentSummary[] = await response.json();
                    setAssessments(data); // Set assessment state
                    console.log(`Fetched ${data.length} assessments.`);
                } catch (error: any) {
                    console.error("Error fetching assessments:", error);
                    const errorMsg = error.message || "Could not load your saved assessments.";
                    setErrorLoading(errorMsg);
                    setAssessments([]);
                    toast({ title: "Loading Error", description: errorMsg, variant: "destructive" });
                } finally {
                    setIsLoadingAssessments(false);
                }
            } else if (hasMounted && !isLoadingAuth && !isAuthenticated) {
                setIsLoadingAssessments(false);
            }
        };
        fetchAssessments();
    }, [hasMounted, isAuthenticated, token, toast]);

    // --- Handle Delete Assessment ---
    const handleDeleteAssessment = async (assessmentId: number) => {
        if (!token || deletingId) return;
        setDeletingId(assessmentId);
        try {
            // Use the correct endpoint for deleting assessments
            const response = await fetch(`https://learnbridge-teacher-tools-service.onrender.com/api/teacher-tools/assessments/${assessmentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                 let errorMsg = `Failed to delete assessment (Status: ${response.status})`;
                 try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch(e) {}
                 throw new Error(errorMsg);
            }
            // Update state
            setAssessments(prev => prev.filter(a => a.id !== assessmentId));
            toast({ title: "Success", description: "Assessment deleted successfully." });
        } catch (error: any) {
            console.error("Error deleting assessment:", error);
            toast({ title: "Delete Error", description: error.message || "Could not delete assessment.", variant: "destructive" });
        } finally {
            setDeletingId(null);
        }
    };

    // --- Render Logic ---
    if (!hasMounted || isLoadingAuth) { 
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-brand-darkblue" />
            </div>
        );
    }
    
    if (!isAuthenticated || !user || user.role !== 'teacher') { 
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You must be logged in as a teacher to view this page.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
             <header className="mb-6 flex justify-between items-center">
                 <div>
                     <h1 className="text-3xl font-bold text-brand-darkblue">My Saved Assessments</h1>
                     <nav className="text-sm text-gray-500">
                         <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                         {' / '}
                         <span>My Assessments</span>
                     </nav>
                 </div>
                 <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
             </header>

            {/* Loading State */}
            {isLoadingAssessments && (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-darkblue" />
                </div>
            )}
            
            {/* Error State */}
            {!isLoadingAssessments && errorLoading && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error Loading Assessments</AlertTitle>
                    <AlertDescription>{errorLoading}</AlertDescription>
                </Alert>
            )}
            
            {/* No Assessments State */}
             {!isLoadingAssessments && !errorLoading && assessments.length === 0 && (
                 <Card className="text-center py-10 mt-6">
                     <CardHeader><CardTitle>No Saved Assessments Yet</CardTitle></CardHeader>
                     <CardContent>
                         <CardDescription className="mb-4">Generate assessments using the AI Assessment Creator!</CardDescription>
                         <Link href="/dashboard/assessment-creator">
                             <Button>Go to Assessment Creator</Button>
                         </Link>
                     </CardContent>
                 </Card>
             )}

            {/* Display Assessments */}
            {!isLoadingAssessments && !errorLoading && assessments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assessments.map((assessment) => (
                        <Card key={assessment.id} className="flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-200">
                            <CardHeader>
                                <CardTitle className="text-lg truncate">{assessment.title || `Assessment: ${assessment.topic?.substring(0, 30) ?? 'Untitled'}...`}</CardTitle>
                                <CardDescription>{assessment.subject} - {assessment.class_level} - {assessment.assessment_type}</CardDescription> {/* Added type */}
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-gray-600 line-clamp-2">Topic: {assessment.topic}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Last Updated: {assessment.updated_at ? format(new Date(assessment.updated_at), 'PPp') : 'N/A'}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                                {/* Link to View/Edit Assessment Page */}
                                <Link href={`/dashboard/my-assessments/${assessment.id}`} passHref>
                                    <Button variant="outline" size="sm" title="View or Edit Assessment">
                                        <Eye className="h-4 w-4 mr-1" /> View/Edit
                                    </Button>
                                </Link>

                                {/* Delete Button */}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <span> {/* Keep wrapper if needed */}
                                            <Button variant="destructive" size="sm" disabled={deletingId === assessment.id} title="Delete Assessment" className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500">
                                                {deletingId === assessment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        </span>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the assessment titled: <br />
                                                <strong className="break-words">{assessment.title || `Assessment for "${assessment.topic}"`}</strong>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteAssessment(assessment.id); }} className="bg-red-600 text-destructive-foreground hover:bg-red-700">
                                                Delete Permanently
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}