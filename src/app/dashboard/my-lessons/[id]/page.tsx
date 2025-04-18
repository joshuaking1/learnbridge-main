// frontend/src/app/dashboard/my-lessons/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; // Import useParams
import Link from "next/link";
import { useAuthStore } from '@/stores/useAuthStore';
import { toast, useToast } from "@/hooks/use-toast"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Interface for the full lesson plan details - ensure it matches the table + plan_content
interface LessonPlanDetail {
    id: number;
    user_id: number;
    title: string | null;
    subject: string;
    class_level: string;
    topic: string;
    duration: string | null;
    strand: string | null;
    sub_strand: string | null;
    content_standard: string | null;
    plan_content: string; // The full markdown content
    created_at: string;
    updated_at: string;
}

export default function ViewLessonPlanPage() {
    const router = useRouter();
    const params = useParams(); // Hook to get route parameters
    const { toast } = useToast();
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);
    const [lessonPlan, setLessonPlan] = useState<LessonPlanDetail | null>(null);
    const [isLoadingPlan, setIsLoadingPlan] = useState(true);
    const [errorLoading, setErrorLoading] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState("");
    const [editedTitle, setEditedTitle] = useState(""); // State for editable title
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const planId = params.id; // Get the 'id' from the URL (e.g., '123')

    // --- Mount and Auth Check ---
    useEffect(() => { setHasMounted(true); }, []);
    useEffect(() => {
        if (hasMounted && !isLoadingAuth && !isAuthenticated) {
            toast({ title: "Authentication Required", variant: "destructive" });
            router.push('/login');
        }
        // Optional: Add teacher role check
    }, [hasMounted, isLoadingAuth, isAuthenticated, router, toast]);

    // --- Fetch Specific Lesson Plan ---
    useEffect(() => {
        const fetchPlan = async () => {
            // Ensure component is mounted, user is authenticated, and planId is valid
            if (hasMounted && isAuthenticated && token && planId && typeof planId === 'string') {
                setIsLoadingPlan(true);
                setErrorLoading(null);
                console.log(`Fetching lesson plan with ID: ${planId}`);
                try {
                    const response = await fetch(`http://localhost:3005/api/teacher-tools/lessons/${planId}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });

                    if (response.status === 404) {
                         throw new Error('Lesson plan not found or you do not have permission to view it.');
                    }
                    if (!response.ok) {
                        let errorMsg = `Failed to fetch lesson plan (Status: ${response.status})`;
                        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {}
                        throw new Error(errorMsg);
                    } else {
                        const data: LessonPlanDetail = await response.json();
                        setLessonPlan(data);
                        // --- Populate edit state ---
                        setEditedContent(data.plan_content);
                        setEditedTitle(data.title || `Plan: ${data.topic?.substring(0, 30) ?? 'Untitled'}...`); // Use fetched title or generate default
                        // --- End populate edit state ---
                        console.log("Fetched plan details:", data.topic);
                    }

                } catch (error: any) {
                    console.error("Error fetching lesson plan details:", error);
                    setErrorLoading(error.message || "Could not load the lesson plan.");
                    setLessonPlan(null);
                    toast({ title: "Loading Error", description: error.message || "Could not load plan.", variant: "destructive" });
                } finally {
                    setIsLoadingPlan(false);
                }
            } else if (hasMounted && !isLoadingAuth && !isAuthenticated) {
                 setIsLoadingPlan(false); // Don't load if not authenticated
            } else if (hasMounted && !planId) {
                 setErrorLoading("Invalid lesson plan ID specified."); // Handle invalid ID case
                 setIsLoadingPlan(false);
            }
        };
        
        // --- Conditional Logic Moved Inside useEffect Callback ---
        if (hasMounted && isAuthenticated && token && planId && typeof planId === 'string') {
            // Only call fetchPlan if all conditions are met
            fetchPlan();
        } else if (hasMounted && !isLoadingAuth && !isAuthenticated) {
             // If auth fails after mount, stop loading, the other effect handles redirect
             setIsLoadingPlan(false);
             console.log("Fetch skipped: Not authenticated");
        } else if (hasMounted && !planId) {
             // Handle invalid ID case after mount
             setErrorLoading("Invalid lesson plan ID specified.");
             setIsLoadingPlan(false);
             console.log("Fetch skipped: Invalid planId");
        } else if (hasMounted && !token) {
             // Handle missing token case after mount (should be caught by auth check effect too)
             setErrorLoading("Authentication token missing.");
             setIsLoadingPlan(false);
             console.log("Fetch skipped: Token missing");
        } else if (!hasMounted || isLoadingAuth) {
             // If still loading auth or not mounted, ensure plan loading is true or reset
             // This prevents trying to fetch before auth state is settled
             setIsLoadingPlan(true); // Keep loading until auth is resolved
             console.log("Fetch skipped: Component not mounted or auth still loading");
        }
        // --- End Conditional Logic ---

    }, [hasMounted, isAuthenticated, token, planId, toast, router]); // Keep dependencies

    // Add this function within the ViewLessonPlanPage component
    const handleSaveEdit = async () => {
        if (!token || !planId || isSavingEdit || !lessonPlan) return; // Basic checks

        setIsSavingEdit(true);
        console.log(`Saving edits for plan ID: ${planId}`);

        const payload = {
            title: editedTitle,
            planContent: editedContent
        };

        try {
            const response = await fetch(`http://localhost:3005/api/teacher-tools/lessons/${planId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Failed to save edits:", data);
                toast({ title: `Save Failed (${response.status})`, description: data.error || "Error saving changes.", variant: "destructive" });
            } else {
                console.log("Edits Saved Successfully:", data);
                setLessonPlan(data); // Update main state
                setEditedContent(data.plan_content); // Sync edit state
                setEditedTitle(data.title || ''); // Sync edit state
                setIsEditing(false); // Exit edit mode
                toast({ title: "Changes Saved!", description: "Lesson plan updated successfully." });
            }
        } catch (error) {
            console.error("Network error saving edits:", error);
            toast({ title: "Network Error", description: "Could not connect to server to save changes.", variant: "destructive" });
        } finally {
            setIsSavingEdit(false);
            setIsLoadingPlan(false);
        }
    };

    // --- Render Logic ---
    if (!hasMounted || isLoadingAuth || isLoadingPlan) { // Show loading if auth OR plan is loading
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <Loader2 className="h-8 w-8 animate-spin mr-3 text-brand-midblue" />
                Loading Lesson Plan...
            </div>
        );
    }
    if (!isAuthenticated || !user) { // Should be handled by effect, but fallback
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                Redirecting...
            </div>
        );
    }
    if (errorLoading) { // Display error if loading failed
        return (
             <div className="min-h-screen bg-slate-100 p-4 md:p-8">
                 <header className="mb-6 flex justify-between items-center">
                      <h1 className="text-3xl font-bold text-destructive">Error</h1>
                      <Button variant="outline" onClick={() => router.push('/dashboard/my-lessons')}>Back to My Plans</Button>
                 </header>
                 <Alert variant="destructive"><AlertTitle>Error Loading Plan</AlertTitle><AlertDescription>{errorLoading}</AlertDescription></Alert>
             </div>
        );
    }
    if (!lessonPlan) { // Should not happen if no error, but fallback
         return ( <div className="min-h-screen bg-slate-100 p-4 md:p-8">Lesson plan data not available.</div> );
    }

    // --- Main Content: Display Lesson Plan ---
    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
             <header className="mb-6 flex justify-between items-center">
                 <div>
                     {/* Display Title or Topic */}
                     <h1 className="text-3xl font-bold text-brand-darkblue">{lessonPlan.title || `Lesson Plan: ${lessonPlan.topic}`}</h1>
                     <nav className="text-sm text-gray-500">
                         <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                         {' / '}
                         <Link href="/dashboard/my-lessons" className="hover:underline">My Lesson Plans</Link>
                         {' / '}
                         <span>View Plan</span>
                     </nav>
                     {/* Display other metadata */}
                     <p className="text-sm text-gray-600 mt-1">
                         Subject: {lessonPlan.subject} | Class: {lessonPlan.class_level} | Topic: {lessonPlan.topic}
                     </p>
                     <p className="text-xs text-gray-400">
                         Last Updated: {format(new Date(lessonPlan.updated_at), 'PPp')}
                     </p>
                 </div>

                 <div className="flex-shrink-0 flex gap-2"> {/* Buttons group */}
                     {isEditing ? (
                         <>
                             {/* Cancel Button */}
                             <Button variant="outline" onClick={() => {
                                 setIsEditing(false);
                                 // Reset edits to original fetched plan content on cancel
                                 if (lessonPlan) {
                                     setEditedContent(lessonPlan.plan_content);
                                     setEditedTitle(lessonPlan.title || `Plan: ${lessonPlan.topic?.substring(0, 30) ?? 'Untitled'}...`);
                                 }
                             }} disabled={isSavingEdit}>
                                 Cancel
                             </Button>
                             {/* Save Changes Button */}
                             <Button onClick={handleSaveEdit} disabled={isSavingEdit} className="bg-green-600 hover:bg-green-700">
                                 {isSavingEdit ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                 Save Changes
                             </Button>
                         </>
                     ) : (
                         <Button variant="outline" onClick={() => setIsEditing(true)}>
                             <Pencil className="h-4 w-4 mr-1" /> Edit
                         </Button>
                     )}
                     <Button variant="outline" onClick={() => router.push('/dashboard/my-lessons')}>Back to List</Button>
                 </div>
             </header>

            {/* Display Generated Plan Content */}
            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? 'Edit Plan Content' : 'Lesson Plan Content'}</CardTitle>
                </CardHeader>
                <CardContent>
                     {/* --- EDITABLE CONTENT --- */}
                     {isEditing ? (
                         <Textarea
                             value={editedContent}
                             onChange={(e) => setEditedContent(e.target.value)}
                             className="w-full h-[70vh] font-mono text-sm border rounded-md p-4 bg-white" // Basic styling for textarea
                             disabled={isSavingEdit}
                             placeholder="Enter lesson plan content using Markdown..."
                         />
                     ) : (
                         <ScrollArea className="h-[70vh] p-4 border rounded-md bg-white">
                            <div className="prose prose-sm sm:prose-base max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ /* ...table styling components... */ }}>
                                    {lessonPlan.plan_content}
                                </ReactMarkdown>
                            </div>
                        </ScrollArea>
                     )}
                     {/* --- End Editable Content --- */}
                </CardContent>
            </Card>
        </div>
    );
}