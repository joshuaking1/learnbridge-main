// frontend/src/app/dashboard/rubric-generator/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from '@/stores/useAuthStore';
import { toast, useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Eye, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Interface for full ToS details - adjust based on 'tables_of_specs' table
interface TosDetail {
    id: number;
    user_id: number;
    title: string | null;
    subject: string;
    book: string;
    assessment_title: string;
    covered_topics: string[] | null; // Array of strings
    objective_weight: number | null;
    subjective_weight: number | null;
    tos_content: string; // The full markdown content
    created_at: string;
    updated_at: string;
}

export default function ViewTosPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);
    const [tos, setTos] = useState<TosDetail | null>(null); // State for ToS data
    const [isLoadingTos, setIsLoadingTos] = useState(true);
    const [errorLoading, setErrorLoading] = useState<string | null>(null);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState("");
    const [editedTitle, setEditedTitle] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const tosId = params.id; // Get the 'id' from the URL

    // --- Mount and Auth Check ---
    useEffect(() => { setHasMounted(true); }, []);
    useEffect(() => { /* ... Standard Auth Check Effect ... */ }, [/* ... deps ... */]);

    // --- Fetch Specific ToS ---
    useEffect(() => {
        const fetchTos = async () => {
            if (hasMounted && isAuthenticated && token && tosId && typeof tosId === 'string') {
                setIsLoadingTos(true); setErrorLoading(null);
                try {
                    const response = await fetch(`http://localhost:3005/api/teacher-tools/tos/${tosId}`, { // Use ToS endpoint
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (response.status === 404) throw new Error('ToS not found or permission denied.');
                    if (!response.ok) { /* ... generic error handling ... */ }
                    const data: TosDetail = await response.json();
                    setTos(data);
                    setEditedContent(data.tos_content); // Populate edit state
                    setEditedTitle(data.title || `ToS: ${data.assessment_title?.substring(0, 30) ?? 'Untitled'}...`); // Populate edit state
                } catch (error: any) { /* ... error handling ... */ setErrorLoading(error.message); setTos(null); }
                finally { setIsLoadingTos(false); }
            } else { /* ... handle missing prerequisites ... */ setIsLoadingTos(false); }
        };
        fetchTos();
    }, [hasMounted, isAuthenticated, token, tosId, toast, router]); // Added router

    // --- Handle Save Edit ---
    const handleSaveEdit = async () => {
        if (!token || !tosId || isSavingEdit || !tos) return;
        setIsSavingEdit(true);
        const payload = { title: editedTitle, tosContent: editedContent }; // Only update title and content
        try {
            const response = await fetch(`http://localhost:3005/api/teacher-tools/tos/${tosId}`, { // Use ToS endpoint
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) { /* ... error handling ... */ }
            else {
                setTos(data); setEditedContent(data.tos_content); setEditedTitle(data.title || '');
                setIsEditing(false); toast({ title: "Changes Saved!", description: "ToS updated successfully." });
            }
        } catch (error) { /* ... network error handling ... */ }
        finally { setIsSavingEdit(false); }
    };

    // --- Render Logic ---
    if (!hasMounted || isLoadingAuth || isLoadingTos) { /* ... loading state ... */ }
    if (!isAuthenticated || !user) { /* ... not authenticated state ... */ }
    if (errorLoading) { /* ... error loading state ... */ }
    if (!tos) { /* ... tos not available state ... */ }

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
             <header className="mb-6 flex justify-between items-center gap-4">
                 <div className="flex-grow">
                     {/* Editable Title */}
                     {isEditing ? ( <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="text-3xl ..." disabled={isSavingEdit} />)
                                : ( <h1 className="text-3xl ...">{tos.title || `ToS: ${tos.assessment_title}`}</h1> )}
                     <nav className="text-sm text-gray-500">
                         <Link href="/dashboard" className="hover:underline">Dashboard</Link> {' / '}
                         <Link href="/dashboard/my-tos" className="hover:underline">My Tables of Specs</Link> {' / '}
                         <span>View ToS</span>
                     </nav>
                     {/* Metadata */}
                     <p className="text-sm text-gray-600 mt-1"> Subject: {tos.subject} | Book: {tos.book} | For: {tos.assessment_title} </p>
                     <p className="text-xs text-gray-400"> Last Updated: {format(new Date(tos.updated_at), 'PPp')} </p>
                 </div>
                 <div className="flex-shrink-0 flex gap-2">
                     {/* Edit/Save/Cancel Buttons */}
                     {isEditing ? ( <> <Button variant="outline" onClick={() => { setIsEditing(false); setEditedContent(tos.tos_content); setEditedTitle(tos.title || ''); }} disabled={isSavingEdit}>Cancel</Button> <Button onClick={handleSaveEdit} disabled={isSavingEdit} className="bg-green-600 ..."> Save Changes </Button> </> )
                                : ( <Button variant="outline" onClick={() => setIsEditing(true)}> <Pencil className="h-4 w-4 mr-1" /> Edit </Button> )}
                     <Button variant="outline" onClick={() => router.push('/dashboard/my-tos')}>Back to List</Button>
                 </div>
             </header>

            {/* Display/Edit ToS Content */}
            <Card>
                <CardHeader><CardTitle>{isEditing ? 'Edit ToS Content' : 'Table of Specifications Content'}</CardTitle></CardHeader>
                <CardContent>
                     {isEditing ? (
                         <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="w-full h-[70vh] ..." disabled={isSavingEdit} />
                     ) : (
                         <ScrollArea className="h-[70vh] p-1 border rounded-md bg-white">
                            <div className="prose prose-sm sm:prose-base max-w-none p-3">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ /* ... enhanced table styling ... */ }}>
                                    {tos.tos_content}
                                </ReactMarkdown>
                            </div>
                        </ScrollArea>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}