// frontend/src/app/dashboard/my-tos/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/components/ui/use-toast";
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

// Interface for ToS summary data - adjust fields to match GET /tos response
interface TosSummary {
    id: number;
    title: string | null;
    subject: string;
    book: string; // Use book instead of class_level
    assessment_title: string;
    created_at: string;
    updated_at: string;
}

export default function MyTosPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);
    const [tablesOfSpecs, setTablesOfSpecs] = useState<TosSummary[]>([]); // State for ToS
    const [isLoadingTos, setIsLoadingTos] = useState(true); // Loading state
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

    // --- Fetch Saved ToS ---
    useEffect(() => {
        const fetchTosList = async () => {
            if (hasMounted && isAuthenticated && token) {
                setIsLoadingTos(true);
                setErrorLoading(null);
                try {
                    // Use the correct endpoint for fetching ToS
                    const response = await fetch('http://localhost:3005/api/teacher-tools/tos', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (!response.ok) {
                        let errorMsg = `Failed to fetch ToS list (Status: ${response.status})`;
                        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {}
                        throw new Error(errorMsg);
                    }
                    const data: TosSummary[] = await response.json();
                    setTablesOfSpecs(data); // Set ToS state
                    console.log(`Fetched ${data.length} Tables of Specification.`);
                } catch (error: any) {
                    console.error("Error fetching ToS list:", error);
                    const errorMsg = error.message || "Could not load your saved ToS.";
                    setErrorLoading(errorMsg);
                    setTablesOfSpecs([]);
                    toast({ title: "Loading Error", description: errorMsg, variant: "destructive" });
                } finally {
                    setIsLoadingTos(false);
                }
            } else if (hasMounted && !isLoadingAuth && !isAuthenticated) {
                setIsLoadingTos(false);
            }
        };
        fetchTosList();
    }, [hasMounted, isAuthenticated, token, toast]);

    // --- Handle Delete ToS ---
    const handleDeleteTos = async (tosId: number) => {
        if (!token || deletingId) return;
        setDeletingId(tosId);
        try {
            // Use the correct endpoint for deleting ToS
            const response = await fetch(`http://localhost:3005/api/teacher-tools/tos/${tosId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                 let errorMsg = `Failed to delete ToS (Status: ${response.status})`;
                 try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch(e) {}
                 throw new Error(errorMsg);
            }
            // Update state
            setTablesOfSpecs(prev => prev.filter(t => t.id !== tosId));
            toast({ title: "Success", description: "Table of Specifications deleted successfully." });
        } catch (error: any) {
            console.error("Error deleting ToS:", error);
            toast({ title: "Delete Error", description: error.message || "Could not delete ToS.", variant: "destructive" });
        } finally {
            setDeletingId(null);
        }
    };

    // --- Render Logic ---
    if (!hasMounted || isLoadingAuth) { /* ... loading auth ... */ }
    if (!isAuthenticated || !user || user.role !== 'teacher') { /* ... not authenticated / wrong role ... */ }

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
             <header className="mb-6 flex justify-between items-center">
                 <div>
                     <h1 className="text-3xl font-bold text-brand-darkblue">My Saved Tables of Specification</h1>
                     <nav className="text-sm text-gray-500">
                         <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                         {' / '}
                         <span>My Tables of Specs</span>
                     </nav>
                 </div>
                 <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
             </header>

            {/* Loading State */}
            {isLoadingTos && ( /* ... Loading UI ... */ )}
            {/* Error State */}
            {!isLoadingTos && errorLoading && ( /* ... Error Alert ... */ )}
            {/* No ToS State */}
             {!isLoadingTos && !errorLoading && tablesOfSpecs.length === 0 && (
                 <Card className="text-center py-10 mt-6">
                     <CardHeader><CardTitle>No Saved ToS Yet</CardTitle></CardHeader>
                     <CardContent>
                         <CardDescription className="mb-4">Generate a Table of Specifications using the AI ToS Builder!</CardDescription>
                         <Link href="/dashboard/tos-builder">
                             <Button>Go to ToS Builder</Button>
                         </Link>
                     </CardContent>
                 </Card>
             )}

            {/* Display ToS List */}
            {!isLoadingTos && !errorLoading && tablesOfSpecs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tablesOfSpecs.map((tos) => (
                        <Card key={tos.id} className="flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-200">
                            <CardHeader>
                                <CardTitle className="text-lg truncate">{tos.title || `ToS: ${tos.assessment_title?.substring(0, 30) ?? 'Untitled'}...`}</CardTitle>
                                <CardDescription>{tos.subject} - {tos.book}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-gray-600 line-clamp-2">For: {tos.assessment_title}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Last Updated: {tos.updated_at ? format(new Date(tos.updated_at), 'PPp') : 'N/A'}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                                {/* Link to View/Edit ToS Page (TODO: Create this page) */}
                                <Button variant="outline" size="sm" title="View or Edit ToS" onClick={() => alert(`View/Edit ToS ID: ${tos.id} - Page not implemented yet.`)}>
                                    <Eye className="h-4 w-4 mr-1" /> View/Edit
                                </Button>

                                {/* Delete Button */}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <span> {/* Keep wrapper */}
                                            <Button variant="destructive" size="sm" disabled={deletingId === tos.id} title="Delete ToS" className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500">
                                                {deletingId === tos.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        </span>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the Table of Specs for: <br />
                                                <strong className="break-words">{tos.title || tos.assessment_title}</strong>
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteTos(tos.id); }} className="bg-red-600 text-destructive-foreground hover:bg-red-700">
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