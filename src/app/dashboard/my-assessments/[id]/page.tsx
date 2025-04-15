// frontend/src/app/dashboard/my-assessments/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // For editing title
import { Textarea } from "@/components/ui/textarea"; // For editing content
import { Loader2, Eye, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Interface for full assessment details - adjust based on 'assessments' table
interface AssessmentDetail {
    id: number;
    user_id: number;
    title: string | null;
    subject: string;
    class_level: string;
    topic: string;
    content_standard: string | null;
    assessment_type: string;
    dok_levels: number[]; // Array of numbers
    num_questions: number | null;
    assessment_content: string; // The full markdown content
    created_at: string;
    updated_at: string;
}

export default function ViewAssessmentPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);
    const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
    const [isLoadingAssessment, setIsLoadingAssessment] = useState(true);
    const [errorLoading, setErrorLoading] = useState<string | null>(null);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState("");
    const [editedTitle, setEditedTitle] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const assessmentId = params.id; // Get the 'id' from the URL

    // --- Mount and Auth Check ---
    useEffect(() => { setHasMounted(true); }, []);
    useEffect(() => {
        if (hasMounted && !isLoadingAuth && !isAuthenticated) {
            toast({ title: "Authentication Required", variant: "destructive" });
            router.push('/login');
        }
        // Optional: Role check
    }, [hasMounted, isLoadingAuth, isAuthenticated, router, toast]);

    // --- Fetch Specific Assessment ---
    useEffect(() => {
        const fetchAssessment = async () => {
            if (hasMounted && isAuthenticated && token && assessmentId && typeof assessmentId === 'string') {
                setIsLoadingAssessment(true);
                setErrorLoading(null);
                console.log(`Fetching assessment with ID: ${assessmentId}`);
                try {
                    const response = await fetch(`http://localhost:3005/api/teacher-tools/assessments/${assessmentId}`, { // Use assessment endpoint
                        headers: { 'Authorization': `Bearer ${token}` },
                    });

                    if (response.status === 404) { throw new Error('Assessment not found or permission denied.'); }
                    if (!response.ok) { /* ... generic error handling ... */
                        let errorMsg = `Failed to fetch assessment (Status: ${response.status})`;
                        try { const d = await response.json(); errorMsg = d.error || errorMsg; } catch(e){}
                        throw new Error(errorMsg);
                    }

                    const data: AssessmentDetail = await response.json();
                    setAssessment(data);
                    // Populate edit state
                    setEditedContent(data.assessment_content);
                    setEditedTitle(data.title || `Assessment: ${data.topic?.substring(0, 30) ?? 'Untitled'}...`);
                    console.log("Fetched assessment details:", data.topic);

                } catch (error: any) { /* ... error handling ... */
                    setErrorLoading(error.message || "Could not load the assessment.");
                    setAssessment(null);
                } finally {
                    setIsLoadingAssessment(false);
                }
            } else if (hasMounted && !isLoadingAuth && !isAuthenticated) { setIsLoadingAssessment(false); }
              else if (hasMounted && !assessmentId) { setErrorLoading("Invalid assessment ID."); setIsLoadingAssessment(false); }
              else if (hasMounted && !token) { setErrorLoading("Authentication token missing."); setIsLoadingAssessment(false); }
              else if (!hasMounted || isLoadingAuth) { setIsLoadingAssessment(true); }
        };
        fetchAssessment();
    }, [hasMounted, isAuthenticated, token, assessmentId, toast, router]); // Added router

    // --- Handle Save Edit ---
    const handleSaveEdit = async () => {
        if (!token || !assessmentId || isSavingEdit || !assessment) return;

        setIsSavingEdit(true);
        console.log(`Saving edits for assessment ID: ${assessmentId}`);
        const payload = { title: editedTitle, assessmentContent: editedContent }; // Fields allowed to update

        try {
            const response = await fetch(`http://localhost:3005/api/teacher-tools/assessments/${assessmentId}`, { // Use assessment endpoint
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) { /* ... error handling ... */
                 toast({ title: `Save Failed (${response.status})`, description: data.error || "Error saving changes.", variant: "destructive" });
            } else {
                setAssessment(data); // Update main state
                setEditedContent(data.assessment_content); // Sync edit state
                setEditedTitle(data.title || ''); // Sync edit state
                setIsEditing(false); // Exit edit mode
                toast({ title: "Changes Saved!", description: "Assessment updated successfully." });
            }
        } catch (error) { /* ... network error handling ... */
             toast({ title: "Network Error", description: "Could not connect to server.", variant: "destructive" });
        } finally {
            setIsSavingEdit(false);
        }
    };

    // --- Render Logic ---
    if (!hasMounted || isLoadingAuth || isLoadingAssessment) { /* ... loading state ... */ }
    if (!isAuthenticated || !user) { /* ... not authenticated state ... */ }
    if (errorLoading) { /* ... error loading state ... */ }
    if (!assessment) { 
        return (
            <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Assessment Not Found</h1>
                    <p className="text-gray-600 mb-4">The assessment you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
                    <Link href="/dashboard/my-assessments">
                        <Button>Back to Assessments</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // --- Main Content: Display/Edit Assessment ---
    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
             <header className="mb-6 flex justify-between items-center gap-4">
                 <div className="flex-grow">
                     {/* Editable Title */}
                     {isEditing ? (
                         <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="text-3xl font-bold text-brand-darkblue mb-1" disabled={isSavingEdit} />
                     ) : (
                         <h1 className="text-3xl font-bold text-brand-darkblue">{assessment.title || `Assessment: ${assessment.topic}`}</h1>
                     )}
                     <nav className="text-sm text-gray-500">
                         <Link href="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                         <Link href="/dashboard/my-assessments" className="hover:underline">My Assessments</Link> {' / '}
                         <span>View Assessment</span>
                     </nav>
                     {/* Metadata */}
                     <p className="text-sm text-gray-600 mt-1">
                         Subject: {assessment.subject} | Class: {assessment.class_level} | Type: {assessment.assessment_type} | DoK: {assessment.dok_levels?.join(', ')}
                     </p>
                     <p className="text-xs text-gray-400">
                         Last Updated: {format(new Date(assessment.updated_at), 'PPp')}
                     </p>
                 </div>
                 <div className="flex-shrink-0 flex gap-2">
                     {/* Edit/Save/Cancel Buttons */}
                     {isEditing ? (
                         <>
                             <Button variant="outline" onClick={() => { setIsEditing(false); setEditedContent(assessment.assessment_content); setEditedTitle(assessment.title || ''); }} disabled={isSavingEdit}>Cancel</Button>
                             <Button onClick={handleSaveEdit} disabled={isSavingEdit} className="bg-green-600 hover:bg-green-700">
                                 {isSavingEdit ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null} Save Changes
                             </Button>
                         </>
                     ) : (
                         <Button variant="outline" onClick={() => setIsEditing(true)}>
                             <Pencil className="h-4 w-4 mr-1" /> Edit
                         </Button>
                     )}
                     {/* Link back to the list page */}
                     <Button variant="outline" onClick={() => router.push('/dashboard/my-assessments')}>Back to List</Button>
                 </div>
             </header>

            {/* Display/Edit Assessment Content */}
            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? 'Edit Assessment Content' : 'Assessment Content'}</CardTitle>
                </CardHeader>
                <CardContent>
                     {isEditing ? (
                         <Textarea
                             value={editedContent}
                             onChange={(e) => setEditedContent(e.target.value)}
                             className="w-full h-[70vh] font-mono text-sm border rounded-md p-4 bg-white"
                             disabled={isSavingEdit}
                             placeholder="Enter assessment content using Markdown..."
                         />
                     ) : (
                         <ScrollArea className="h-[70vh] p-4 border rounded-md bg-white">
                            <div className="prose prose-sm sm:prose-base max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ /* ...table styling components... */ }}>
                                    {assessment.assessment_content}
                                </ReactMarkdown>
                            </div>
                        </ScrollArea>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}