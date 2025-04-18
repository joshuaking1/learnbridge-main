// frontend/src/app/dashboard/my-lessons/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from '@/stores/useAuthStore'; // Corrected store import path
import { useToast } from "@/hooks/use-toast"; // Corrected useToast import path
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

// Interface for the lesson plan summary data fetched from the list endpoint
interface LessonPlanSummary {
    id: number;
    title: string | null;
    subject: string;
    class_level: string; // Ensure this matches the DB column name (snake_case likely)
    topic: string;
    created_at: string; // Ensure this matches the DB column name
    updated_at: string; // Ensure this matches the DB column name
}

export default function MyLessonPlansPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);
    const [lessonPlans, setLessonPlans] = useState<LessonPlanSummary[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);
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

    // --- Fetch Lesson Plans ---
    useEffect(() => {
        const fetchPlans = async () => {
            if (hasMounted && isAuthenticated && token) {
                setIsLoadingPlans(true);
                setErrorLoading(null);
                try {
                    const response = await fetch('https://learnbridge-teacher-tools-service.onrender.com/api/teacher-tools/lessons', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (!response.ok) {
                        let errorMsg = `Failed to fetch lesson plans (Status: ${response.status})`;
                        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {}
                        throw new Error(errorMsg);
                    }
                    const data: LessonPlanSummary[] = await response.json();
                    // --- Log fetched data ---
                    console.log('Fetched Plans Data:', data);
                    setLessonPlans(data);
                    console.log(`Fetched ${data.length} lesson plans.`);
                } catch (error: any) {
                    console.error("Error fetching lesson plans:", error);
                    const errorMsg = error.message || "Could not load your saved lesson plans.";
                    setErrorLoading(errorMsg);
                    setLessonPlans([]);
                    toast({ title: "Loading Error", description: errorMsg, variant: "destructive" });
                } finally {
                    setIsLoadingPlans(false);
                }
            } else if (hasMounted && !isLoadingAuth && !isAuthenticated) {
                setIsLoadingPlans(false);
            }
        };
        fetchPlans();
    }, [hasMounted, isAuthenticated, token, toast]);

    // --- Handle Delete ---
    const handleDeletePlan = async (planId: number) => {
        console.log(`handleDeletePlan called for ID: ${planId}. Current deletingId: ${deletingId}`);
        if (!token || deletingId === planId) {
             console.log("Delete blocked: No token or already deleting this ID.");
             return;
        }
        setDeletingId(planId);
        console.log(`Set deletingId to: ${planId}`);
        try {
            console.log(`Sending DELETE request for ID: ${planId} with token: ${token ? 'Exists' : 'MISSING!'}`);
            const response = await fetch(`https://learnbridge-teacher-tools-service.onrender.com/api/teacher-tools/lessons/${planId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            console.log(`DELETE request response status: ${response.status}`);
            if (!response.ok) {
                 let errorMsg = `Failed to delete plan (Status: ${response.status})`;
                 try { const errorData = await response.json(); console.error("Delete API Error Response:", errorData); errorMsg = errorData.error || errorMsg; } catch(e) { console.error("Failed to parse error response as JSON."); }
                 throw new Error(errorMsg);
            }
            console.log(`Successfully deleted ID: ${planId}. Updating state.`);
            setLessonPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
            toast({ title: "Success", description: "Lesson plan deleted successfully." });
        } catch (error: any) {
            console.error("Error in handleDeletePlan catch block:", error);
            toast({ title: "Delete Error", description: error.message || "Could not delete lesson plan.", variant: "destructive" });
        } finally {
             console.log(`Resetting deletingId from ${planId} to null.`);
             setDeletingId(null);
        }
    };

    // --- Render Logic ---
    if (!hasMounted || isLoadingAuth) {
        return ( <div className="flex items-center justify-center min-h-screen bg-slate-100"> <Loader2 className="h-8 w-8 animate-spin mr-3 text-brand-midblue" /> Loading Session... </div> );
    }
    if (!isAuthenticated || !user || user.role !== 'teacher') {
        return ( <div className="flex items-center justify-center min-h-screen bg-slate-100"> Redirecting... </div> );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
             <header className="mb-6 flex justify-between items-center">
                 <div>
                     <h1 className="text-3xl font-bold text-brand-darkblue">My Saved Lesson Plans</h1>
                     <nav className="text-sm text-gray-500">
                         <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                         {' / '}
                         <span>My Lesson Plans</span>
                     </nav>
                 </div>
                 <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
             </header>

            {/* Loading State for Plans */}
            {isLoadingPlans && ( <div className="flex justify-center items-center py-10">
                     <Loader2 className="h-8 w-8 animate-spin text-brand-midblue" />
                     <p className="ml-3 text-gray-600">Loading lesson plans...</p>
                 </div> )}
            {/* Error State for Plans */}
            {!isLoadingPlans && errorLoading && ( <Alert variant="destructive" className="my-4">
                     <AlertTitle>Error Loading Plans</AlertTitle>
                     <AlertDescription>{errorLoading}</AlertDescription>
                 </Alert> )}
            {/* No Plans State */}
             {!isLoadingPlans && !errorLoading && lessonPlans.length === 0 && ( <Card className="text-center py-10 mt-6">
                     <CardHeader>
                         <CardTitle>No Saved Plans Yet</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <CardDescription className="mb-4">You haven't saved any lesson plans. Generate one using the AI Lesson Planner!</CardDescription>
                         <Link href="/dashboard/lesson-planner">
                             <Button>Go to Lesson Planner</Button>
                         </Link>
                     </CardContent>
                 </Card>)}

            {/* Display Plans */}
            {!isLoadingPlans && !errorLoading && lessonPlans.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lessonPlans.map((plan) => (
                        <Card key={plan.id} className="flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-200">
                            <CardHeader>
                                {/* --- Ensure correct property names are used --- */}
                                <CardTitle className="text-lg truncate">{plan.title || `Plan: ${plan.topic?.substring(0, 30) ?? 'Untitled'}...`}</CardTitle>
                                <CardDescription>{plan.subject} - {plan.class_level}</CardDescription> {/* Use plan.class_level */}
                            </CardHeader>
                            <CardContent className="flex-grow">
                                {/* --- Ensure correct property names are used --- */}
                                <p className="text-sm text-gray-600 line-clamp-2">Topic: {plan.topic}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    {/* --- Ensure correct property names are used --- */}
                                    Last Updated: {plan.updated_at ? format(new Date(plan.updated_at), 'PPp') : 'N/A'}
                                </p>
                            </CardContent>
                            {/* Corrected CardFooter with both buttons */}
                            <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                            <Link href={`/dashboard/my-lessons/${plan.id}`} passHref>
            <Button
                variant="outline"
                size="sm"
                title="View or Edit Lesson Plan"
            >
                <Eye className="h-4 w-4 mr-1" /> View/Edit
            </Button>
        </Link>

                                {/* Delete Button with Confirmation Dialog */}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        {/* Keep the span wrapper if it solved the rendering issue */}
                                        <span>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={deletingId === plan.id}
                                                title="Delete Lesson Plan"
                                                type="button"
                                                // --- Re-applied explicit styling ---
                                                className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500"
                                            >
                                                {deletingId === plan.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </span>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the lesson plan titled:
                                                <br />
                                                <strong className="break-words">{plan.title || `Plan for "${plan.topic}"`}</strong>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={(e) => {
                                                     e.preventDefault();
                                                     handleDeletePlan(plan.id);
                                                }}
                                                // Apply destructive styles directly here
                                                className="bg-red-600 text-destructive-foreground hover:bg-red-700"
                                            >
                                                Delete Permanently
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                {/* End of AlertDialog block */}
                            </CardFooter>
                            {/* End Corrected CardFooter */}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}