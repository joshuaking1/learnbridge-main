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

// Define the ToS interface
interface TableOfSpecification {
    id: string;
    title?: string;
    assessment_title?: string;
    subject?: string;
    book?: string;
    created_at?: string;
    updated_at?: string;
    user_id?: string;
}

export default function MyTosPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);
    const [tablesOfSpecs, setTablesOfSpecs] = useState<TableOfSpecification[]>([]);
    const [isLoadingTos, setIsLoadingTos] = useState(false);
    const [errorLoading, setErrorLoading] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // --- Mount Effect ---
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // --- Auth Check Effect ---
    useEffect(() => {
        if (hasMounted && !isLoadingAuth && !isAuthenticated) {
            toast({
                title: "Authentication Required",
                description: "Please log in to access this page.",
                variant: "destructive",
            });
            router.push('/login');
        }
    }, [hasMounted, isLoadingAuth, isAuthenticated, router, toast]);

    // --- Fetch Saved ToS ---
    useEffect(() => {
        const fetchTosList = async () => {
            if (hasMounted && isAuthenticated && token) {
                setIsLoadingTos(true);
                setErrorLoading(null);
                try {
                    // Use the correct endpoint for fetching ToS
                    const response = await fetch('https://learnbridge-teacher-tools-service.onrender.com/api/teacher-tools/tos', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (!response.ok) {
                        let errorMsg = `Failed to fetch ToS list (Status: ${response.status})`;
                        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {}
                        throw new Error(errorMsg);
                    }
                    const data = await response.json();
                    setTablesOfSpecs(data);
                } catch (error) {
                    console.error("Error fetching ToS:", error);
                    setErrorLoading(error instanceof Error ? error.message : "Failed to load Tables of Specification");
                } finally {
                    setIsLoadingTos(false);
                }
            }
        };

        fetchTosList();
    }, [hasMounted, isAuthenticated, token]);

    // --- Delete ToS Handler ---
    const handleDeleteTos = async (tosId: string) => {
        if (!token) return;
        
        setDeletingId(tosId);
        try {
            const response = await fetch(`https://learnbridge-teacher-tools-service.onrender.com/api/teacher-tools/tos/${tosId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to delete ToS (Status: ${response.status})`);
            }

            // Remove the deleted ToS from state
            setTablesOfSpecs(prev => prev.filter(t => t.id !== tosId));
            toast({ title: "ToS Deleted", description: "The Table of Specification has been permanently deleted." });
        } catch (error) {
            console.error("Error deleting ToS:", error);
            toast({ 
                title: "Delete Failed", 
                description: error instanceof Error ? error.message : "Failed to delete Table of Specification", 
                variant: "destructive" 
            });
        } finally {
            setDeletingId(null);
        }
    };

    // --- Render Logic ---
    if (!hasMounted || isLoadingAuth) { 
        return <div>Loading...</div>; 
    }
    
    if (!isAuthenticated || !user || user.role !== 'teacher') { 
        return <div>Not authenticated or not a teacher</div>; 
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-brand-darkblue">My Saved Tables of Specification</h1>
                    <nav className="text-sm text-gray-500">
                        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                        {' / '}
                        <span>My ToS</span>
                    </nav>
                </div>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
            </header>

            {/* Loading State */}
            {isLoadingTos && (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-darkblue" />
                </div>
            )}
            
            {/* Error State */}
            {!isLoadingTos && errorLoading && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorLoading}</AlertDescription>
                </Alert>
            )}
            
            {/* No ToS State */}
            {!isLoadingTos && !errorLoading && tablesOfSpecs.length === 0 && (
                <Card className="text-center py-10 mt-6">
                    <CardHeader><CardTitle>No Saved ToS Yet</CardTitle></CardHeader>
                    <CardContent>
                        <CardDescription className="mb-4">Generate a Table of Specification using the ToS Builder!</CardDescription>
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
                                {/* Link to View/Edit ToS Page */}
                                <Link href={`/dashboard/my-tos/${tos.id}`}>
                                    <Button variant="outline" size="sm" title="View or Edit ToS">
                                        <Eye className="h-4 w-4 mr-1" /> View/Edit
                                    </Button>
                                </Link>

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
                                                This will permanently delete the Table of Specification for: <br />
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
