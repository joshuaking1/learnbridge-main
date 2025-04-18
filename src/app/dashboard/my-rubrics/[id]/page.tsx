// frontend/src/app/dashboard/rubric-generator/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil } from "lucide-react";
// ScrollArea is not needed as we're using a regular div with overflow-auto
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Interface for full Rubric details - adjust based on 'rubrics' table
interface RubricDetail {
    id: number;
    user_id: number;
    title: string | null;
    assessment_title: string;
    assessment_type: string;
    class_level: string;
    task_description?: string;
    max_score?: number;
    rubric_content: string; // The full markdown content
    created_at: string;
    updated_at: string;
}

export default function ViewRubricPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);
    const [rubric, setRubric] = useState<RubricDetail | null>(null); // State for Rubric data
    const [isLoadingRubric, setIsLoadingRubric] = useState(true);
    const [errorLoading, setErrorLoading] = useState<string | null>(null);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState("");
    const [editedTitle, setEditedTitle] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const rubricId = params.id; // Get the 'id' from the URL

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

    // --- Fetch Specific Rubric ---
    useEffect(() => {
        const fetchRubric = async () => {
            if (hasMounted && isAuthenticated && token && rubricId && typeof rubricId === 'string') {
                setIsLoadingRubric(true);
                setErrorLoading(null);
                try {
                    const response = await fetch(`http://localhost:3005/api/teacher-tools/rubrics/${rubricId}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (response.status === 404) throw new Error('Rubric not found or permission denied.');
                    if (!response.ok) {
                        let errorMsg = `Failed to fetch rubric (Status: ${response.status})`;
                        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (_) {}
                        throw new Error(errorMsg);
                    }
                    const data: RubricDetail = await response.json();
                    setRubric(data);
                    setEditedContent(data.rubric_content); // Populate edit state
                    setEditedTitle(data.title || `Rubric: ${data.assessment_title?.substring(0, 30) ?? 'Untitled'}...`); // Populate edit state
                } catch (error: unknown) {
                    console.error("Error fetching rubric:", error);
                    const errorMsg = error instanceof Error ? error.message : "Could not load the rubric.";
                    setErrorLoading(errorMsg);
                    setRubric(null);
                    toast({ title: "Loading Error", description: errorMsg, variant: "destructive" });
                }
                finally { setIsLoadingRubric(false); }
            } else if (hasMounted && !isLoadingAuth && !isAuthenticated) {
                setIsLoadingRubric(false);
                router.push('/login');
            } else if (!rubricId || typeof rubricId !== 'string') {
                setIsLoadingRubric(false);
                setErrorLoading("Invalid Rubric ID");
                toast({ title: "Error", description: "Invalid Rubric ID", variant: "destructive" });
            }
        };
        fetchRubric();
    }, [hasMounted, isAuthenticated, isLoadingAuth, token, rubricId, toast, router]);

    // --- Handle Save Edit ---
    const handleSaveEdit = async () => {
        if (!token || !rubricId || isSavingEdit || !rubric) return;
        setIsSavingEdit(true);
        const payload = { title: editedTitle, rubricContent: editedContent }; // Only update title and content
        try {
            const response = await fetch(`http://localhost:3005/api/teacher-tools/rubrics/${rubricId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorMsg = data.error || `Failed to update rubric (Status: ${response.status})`;
                toast({ title: "Update Failed", description: errorMsg, variant: "destructive" });
                throw new Error(errorMsg);
            }
            else {
                setRubric(data);
                setEditedContent(data.rubric_content);
                setEditedTitle(data.title || '');
                setIsEditing(false);
                toast({ title: "Changes Saved!", description: "Rubric updated successfully." });
            }
        } catch (error: unknown) {
            console.error("Error updating rubric:", error);
            const errorMsg = error instanceof Error ? error.message : "Could not update the rubric.";
            toast({ title: "Update Error", description: errorMsg, variant: "destructive" });
        }
        finally { setIsSavingEdit(false); }
    };

    // --- Render Logic ---
    if (!hasMounted || isLoadingAuth || isLoadingRubric) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <Loader2 className="h-8 w-8 animate-spin mr-3 text-blue-600" /> Loading...
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                Redirecting to login...
            </div>
        );
    }

    if (errorLoading) {
        return (
            <div className="min-h-screen bg-slate-100 p-4 md:p-8">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-blue-900">Rubric</h1>
                    <nav className="text-sm text-gray-500">
                        <Link href="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                        <Link href="/dashboard/my-rubrics" className="hover:underline">My Rubrics</Link> {' / '}
                        <span>Error</span>
                    </nav>
                </header>
                <Alert variant="destructive" className="mt-6">
                    <AlertTitle>Error Loading Rubric</AlertTitle>
                    <AlertDescription>{errorLoading}</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button variant="outline" onClick={() => router.push('/dashboard/my-rubrics')}>Back to List</Button>
                </div>
            </div>
        );
    }

    if (!rubric) {
        return (
            <div className="min-h-screen bg-slate-100 p-4 md:p-8">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-blue-900">Rubric</h1>
                    <nav className="text-sm text-gray-500">
                        <Link href="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                        <Link href="/dashboard/my-rubrics" className="hover:underline">My Rubrics</Link> {' / '}
                        <span>Not Found</span>
                    </nav>
                </header>
                <Card className="text-center py-10 mt-6">
                    <CardHeader><CardTitle>Rubric Not Found</CardTitle></CardHeader>
                    <CardContent>
                        <CardDescription className="mb-4">The requested rubric could not be found or you don't have permission to view it.</CardDescription>
                        <Button variant="outline" onClick={() => router.push('/dashboard/my-rubrics')}>Back to List</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
             <header className="mb-6 flex justify-between items-center gap-4">
                 <div className="flex-grow">
                     {/* Editable Title */}
                     {isEditing ? (
                         <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="text-3xl font-bold" disabled={isSavingEdit} />
                     ) : (
                         <h1 className="text-3xl font-bold text-blue-900">{rubric.title || `Rubric: ${rubric.assessment_title}`}</h1>
                     )}
                     <nav className="text-sm text-gray-500">
                         <Link href="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                         <Link href="/dashboard/my-rubrics" className="hover:underline">My Rubrics</Link> {' / '}
                         <span>View Rubric</span>
                     </nav>
                     {/* Metadata */}
                     <p className="text-sm text-gray-600 mt-1">
                        Type: {rubric.assessment_type} | Class: {rubric.class_level} | For: {rubric.assessment_title}
                        {rubric.max_score && ` | Max Score: ${rubric.max_score}`}
                     </p>
                     <p className="text-xs text-gray-400"> Last Updated: {format(new Date(rubric.updated_at), 'PPp')} </p>
                 </div>
                 <div className="flex-shrink-0 flex gap-2">
                     {/* Edit/Save/Cancel Buttons */}
                     {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditedContent(rubric.rubric_content);
                                    setEditedTitle(rubric.title || '');
                                }}
                                disabled={isSavingEdit}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveEdit}
                                disabled={isSavingEdit}
                                className="bg-green-600 hover:bg-green-700">
                                {isSavingEdit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Changes
                            </Button>
                        </>
                     ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                     )}
                     <Button variant="outline" onClick={() => router.push('/dashboard/my-rubrics')}>Back to List</Button>
                 </div>
             </header>

            {/* Display/Edit Rubric Content */}
            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? 'Edit Rubric Content' : 'Rubric Content'}</CardTitle>
                    {!isEditing && rubric.task_description && (
                        <CardDescription className="mt-2 text-gray-700">
                            <strong>Task Description:</strong> {rubric.task_description}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                     {isEditing ? (
                         <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full h-[70vh] font-mono text-sm"
                            disabled={isSavingEdit}
                         />
                     ) : (
                         <div className="h-[70vh] p-1 border rounded-md bg-white overflow-auto">
                            <div className="prose prose-sm sm:prose-base max-w-none p-3">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        table: ({...props}) => <table className="table-auto w-full border-collapse border border-slate-400 my-4" {...props} />,
                                        thead: ({...props}) => <thead className="bg-slate-100" {...props} />,
                                        th: ({...props}) => <th className="border border-slate-300 px-2 py-1 text-left font-semibold" {...props} />,
                                        td: ({...props}) => <td className="border border-slate-300 px-2 py-1 align-top" {...props} />
                                    }}
                                >
                                    {rubric.rubric_content}
                                </ReactMarkdown>
                            </div>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}