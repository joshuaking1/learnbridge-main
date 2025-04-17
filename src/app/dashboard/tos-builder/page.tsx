// frontend/src/app/dashboard/tos-builder/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Label import removed
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast"; // Fixed useToast import path
import { Loader2, ClipboardCopy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from '@/stores/useAuthStore'; // Corrected store import path
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Validation Schema for ToS Inputs - Updated
const tosSchema = z.object({
    subject: z.string().min(3, { message: "Subject is required." }),
    book: z.string().min(1, { message: "Please select the specific book."}), // Changed from classLevel
    assessmentTitle: z.string().min(5, { message: "Assessment Title is required." }),
    coveredTopicsString: z.string().optional(), // Make optional
    objectiveWeight: z.number().min(0).max(100).default(50),
});

type TosFormValues = z.infer<typeof tosSchema>;

// Define Resolver type explicitly if needed, or remove the cast below
// import { Resolver } from 'react-hook-form';

export default function TosBuilderPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedTos, setGeneratedTos] = useState<string | null>(null);
    const [availableBooks, setAvailableBooks] = useState<string[]>([]);
    const [isLoadingBooks, setIsLoadingBooks] = useState(true);

    // --- Get Auth State ---
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();

    // --- State to prevent hydration mismatch ---
    const [hasMounted, setHasMounted] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

    // Handle Copy to Clipboard
    const handleCopy = useCallback(() => {
        if (!generatedTos) {
            toast({ title: "Nothing to Copy", description: "Generate a Table of Specifications first.", variant: "destructive" });
            return;
        }
        if (!navigator.clipboard) {
             toast({ title: "Copy Failed", description: "Clipboard API not available in your browser.", variant: "destructive" });
             return;
        }

        navigator.clipboard.writeText(generatedTos)
            .then(() => {
                toast({ title: "Copied!", description: "Table of Specifications copied to clipboard." });
            })
            .catch(err => {
                console.error("Failed to copy text: ", err);
                toast({ title: "Copy Failed", description: "Could not copy text to clipboard.", variant: "destructive" });
            });
    }, [generatedTos, toast]);

    // --- Effect to set hasMounted on client ---
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // --- Auth Check Effect ---
     useEffect(() => {
        if (hasMounted && !isLoadingAuth && !isAuthenticated) {
            toast({ title: "Authentication Required", description: "Please log in.", variant: "destructive" });
            router.push('/login');
        }
        // Optional: Add teacher role check
        // if (hasMounted && !isLoadingAuth && isAuthenticated && user?.role !== 'teacher') {
        //    toast({ title: "Access Denied", variant: "destructive" });
        //    router.push('/dashboard');
        // }
    }, [hasMounted, isLoadingAuth, isAuthenticated, user, router, toast]);

    // Initialize form
    const form = useForm<TosFormValues>({
        resolver: zodResolver(tosSchema), // Removed cast, should infer correctly
        defaultValues: {
            subject: "Art and Design Studio",
            book: "", // Initialize book as empty, effect will set default
            assessmentTitle: "End of Semester Examination",
            coveredTopicsString: "",
            objectiveWeight: 50,
        },
    });

     // --- Fetch Available Books Effect ---
    useEffect(() => {
        // Ensure form is available before calling methods on it
        if (hasMounted && isAuthenticated && token && form) {
            const fetchBooks = async () => {
                setIsLoadingBooks(true);
                try {
                    const response = await fetch('http://localhost:3004/api/ai/processed-documents', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (!response.ok) throw new Error('Failed to fetch book list');
                    const data = await response.json();
                    const books = data.documents || [];
                    setAvailableBooks(books);
                    console.log("Available books fetched:", books);
                    // Set default book value only if list is not empty and current value is empty
                    if (books.length > 0 && !form.getValues("book")) {
                         form.setValue("book", books[0]);
                    } else if (books.length === 0) {
                         form.resetField("book");
                    }
                } catch (error) {
                    console.error("Error fetching available books:", error);
                    toast({ title: "Error", description: "Could not load available books.", variant: "destructive" });
                    setAvailableBooks([]);
                } finally {
                    setIsLoadingBooks(false);
                }
            };
            fetchBooks();
        } else if (hasMounted && !isLoadingAuth && !isAuthenticated) {
             setIsLoadingBooks(false);
        }
    }, [hasMounted, isAuthenticated, token, toast, form]); // Keep form dependency


    const objectiveWeightValue = form.watch("objectiveWeight");
    const subjectiveWeightValue = 100 - objectiveWeightValue;

    async function onSubmit(values: TosFormValues) {
        setIsGenerating(true);
        setGeneratedTos(null);
        setSaveSuccess(null);

        const coveredTopics = values.coveredTopicsString
                                ? values.coveredTopicsString
                                    .split('\n')
                                    .map(topic => topic.trim())
                                    .filter(topic => topic.length > 0)
                                : [];

        const payload = {
            subject: values.subject,
            book: values.book,
            assessmentTitle: values.assessmentTitle,
            coveredTopics: coveredTopics,
            objectiveWeight: values.objectiveWeight,
            subjectiveWeight: 100 - values.objectiveWeight,
        };

        console.log("Requesting Table of Specifications:", payload);

        if (!token) {
             toast({ title: "Authentication Error", description: "Session expired. Please log in again.", variant: "destructive" });
             router.push('/login');
             setIsGenerating(false);
             return;
        }

        try {
            const response = await fetch('http://localhost:3004/api/ai/generate/tos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json(); // Always try to parse JSON

            if (!response.ok) {
                console.error("ToS Generation Failed:", data);
                toast({
                    title: `Generation Failed (${response.status})`,
                    description: data.error || "An error occurred generating the ToS.", // Use error from JSON if available
                    variant: "destructive",
                });
            } else {
                console.log("ToS Generated Successfully.");
                // Ensure the key matches what the backend sends
                setGeneratedTos(data.tableOfSpecification || "No ToS generated");
                toast({
                    title: "Table of Specifications Generated!",
                    description: "Review the generated table below.",
                });
            }
        } catch (error) {
            console.error("Network error generating ToS:", error);
            toast({ title: "Network Error", description: "Could not connect to AI service.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    }
    // --- NEW: Handle Save ToS ---
    const handleSaveTos = async () => {
        if (!generatedTos || isSaving) return;
        if (!token) { /* ... auth token check ... */ return; }

        setIsSaving(true);
        setSaveSuccess(null);
        const currentInputs = form.getValues();
        const coveredTopics = currentInputs.coveredTopicsString
                                ? currentInputs.coveredTopicsString.split('\n').map(t => t.trim()).filter(t => t.length > 0)
                                : [];

        const payload = {
            // title: `ToS: ${currentInputs.assessmentTitle.substring(0,30)}...`, // Optional: Add title field later
            subject: currentInputs.subject,
            book: currentInputs.book,
            assessmentTitle: currentInputs.assessmentTitle,
            coveredTopics: coveredTopics,
            objectiveWeight: currentInputs.objectiveWeight,
            subjectiveWeight: 100 - currentInputs.objectiveWeight,
            tosContent: generatedTos // The generated Markdown
        };
        console.log("Saving ToS:", payload.subject, payload.assessmentTitle);

        try {
            const response = await fetch('http://localhost:3005/api/teacher-tools/tos', { // Use new ToS endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) {
                setSaveSuccess(false);
                toast({ title: `Save Failed (${response.status})`, description: data.error || "Error saving ToS.", variant: "destructive" });
            } else {
                setSaveSuccess(true);
                toast({ title: "ToS Saved!", description: `Table of Specs for "${payload.assessmentTitle}" saved.` });
            }
        } catch (error) {
            setSaveSuccess(false);
            toast({ title: "Network Error", description: "Could not connect to server to save ToS.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

     // --- Initial Render (Pre-Mount/Hydration) ---
     if (!hasMounted) { return null; }
    // --- Loading State (for initial auth check) ---
     if (isLoadingAuth) {
         return (
             <div className="flex items-center justify-center min-h-screen bg-slate-100">
                 <Loader2 className="h-8 w-8 animate-spin mr-3 text-brand-midblue" /> Loading...
             </div>
         );
     }
    // --- Not Authenticated State ---
     if (!isAuthenticated || !user) {
         // This might flash briefly before redirect
         return (
             <div className="flex items-center justify-center min-h-screen bg-slate-100">
                 Redirecting to login...
             </div>
         );
     }

    // --- Main Page Content ---
    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
             <header className="mb-6 flex justify-between items-center">
                 <div>
                     <h1 className="text-3xl font-bold text-brand-darkblue">AI Table of Specifications Builder</h1>
                     <nav className="text-sm text-gray-500">
                         <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                         {' / '}
                         <span>ToS Builder</span>
                     </nav>
                 </div>
                 <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
             </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Form Card */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Assessment Blueprint Details</CardTitle>
                        <CardDescription>Provide the details for the assessment blueprint.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="subject" render={({ field }) => (
                                    <FormItem> <FormLabel>Subject *</FormLabel> <FormControl><Input placeholder="e.g., Art and Design Studio" {...field} disabled={isGenerating} /></FormControl> <FormMessage /> </FormItem>
                                )} />

                                {/* Book Selection (Dynamic) */}
                                <FormField control={form.control} name="book" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Book / Document *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value || ""}
                                            disabled={isGenerating || isLoadingBooks || availableBooks.length === 0}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingBooks ? "Loading books..." : "Select processed book/document"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white border shadow-md z-50">
                                                {isLoadingBooks ? (
                                                     <SelectItem value="loading" disabled>Loading...</SelectItem>
                                                ) : availableBooks.length > 0 ? (
                                                    availableBooks.map((bookName) => (
                                                        <SelectItem key={bookName} value={bookName}>
                                                            {bookName.replace('uploads/', '').replace(/^[0-9]+_/, '')}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="-" disabled>No processed documents found</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>Select the document the assessment is based on.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="assessmentTitle" render={({ field }) => (
                                    <FormItem> <FormLabel>Assessment Title *</FormLabel> <FormControl><Input placeholder="e.g., End of Semester Examination" {...field} disabled={isGenerating} /></FormControl> <FormMessage /> </FormItem>
                                )} />

                                <FormField control={form.control} name="coveredTopicsString" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Specific Topics/Strands Covered (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter specific topics one per line (leave blank to use all topics from the selected book)..."
                                                {...field}
                                                rows={4}
                                                disabled={isGenerating}
                                            />
                                        </FormControl>
                                        <FormDescription>If blank, the AI will attempt to cover all relevant topics from the selected book.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                 <FormField control={form.control} name="objectiveWeight" render={({ field }) => (
                                    <FormItem>
                                         <FormLabel>Objective vs Subjective Weighting</FormLabel>
                                         <div className="flex justify-between text-sm mb-2">
                                             <span>Objective: {objectiveWeightValue}%</span>
                                             <span>Subjective: {subjectiveWeightValue}%</span>
                                         </div>
                                         <FormControl>
                                            <Slider
                                                defaultValue={[field.value]}
                                                value={[field.value]}
                                                max={100}
                                                step={5}
                                                onValueChange={(value) => field.onChange(value[0])}
                                                className="py-1"
                                                disabled={isGenerating}
                                            />
                                         </FormControl>
                                         <FormDescription>Adjust the balance between objective and subjective questions.</FormDescription>
                                         <FormMessage />
                                     </FormItem>
                                 )} />

                                <Button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange/90" disabled={isGenerating || isLoadingBooks}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isGenerating ? 'Generating ToS...' : 'Generate Table of Specs'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Generated ToS Display Area */}
                <Card className="lg:col-span-2" id="generated-tos-section">
                    <CardHeader>
                        <CardTitle>Generated Table of Specifications</CardTitle>
                        <CardDescription>Review the AI-generated assessment blueprint below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Updated Loading/Initial States */}
                        {isGenerating && (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-brand-midblue" />
                                <p className="ml-3 text-gray-600">Generating...</p>
                            </div>
                        )}
                        {!isGenerating && !generatedTos && (
                            <div className="text-center text-gray-500 h-40 flex items-center justify-center">
                                Enter details and click "Generate" to see the Table of Specs here.
                            </div>
                        )}
                        {/* Display Generated Content */}
                        {generatedTos && (
                            <ScrollArea className="h-[70vh] p-4 border rounded-md bg-white">
                                <div className="prose prose-sm sm:prose-base max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            table: ({node, ...props}) => <table className="table-auto w-full border-collapse border border-slate-400 my-4" {...props} />,
                                            thead: ({node, ...props}) => <thead className="bg-slate-100" {...props} />,
                                            th: ({node, ...props}) => <th className="border border-slate-300 px-2 py-1 text-left font-semibold" {...props} />, // Added font-semibold
                                            td: ({node, ...props}) => <td className="border border-slate-300 px-2 py-1 align-top" {...props} />,
                                        }}
                                     >
                                        {generatedTos}
                                    </ReactMarkdown>
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                    {/* --- ADD SAVE BUTTON / STATUS --- */}
                    <CardFooter className="flex flex-wrap items-start gap-2 pt-4">
                        <div className="flex flex-col space-y-2">
                            {generatedTos && (
                                <Button onClick={handleSaveTos} disabled={isSaving || saveSuccess === true} className="bg-green-600 hover:bg-green-700">
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isSaving ? 'Saving...' : saveSuccess === true ? 'Saved!' : 'Save Table of Specs'}
                                </Button>
                            )}
                            {saveSuccess === false && (
                                <Alert variant="destructive" className="w-full max-w-xs">
                                    <AlertTitle>Save Failed</AlertTitle>
                                    <AlertDescription>
                                        There was an error saving the Table of Specifications. Please try again.
                                    </AlertDescription>
                                </Alert>
                            )}
                            {saveSuccess === true && (
                                <Alert variant="success" className="w-full max-w-xs bg-green-100 border-green-300 text-green-800">
                                    <AlertTitle>Success</AlertTitle>
                                    <AlertDescription>
                                        Table of Specifications saved successfully.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Copy Button */}
                        {generatedTos && (
                            <Button
                                variant="outline"
                                onClick={handleCopy}
                                disabled={isSaving || isGenerating}
                                title="Copy Table of Specifications to clipboard"
                            >
                                <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Table of Specs
                            </Button>
                        )}
                    </CardFooter>
                    {/* --- END SAVE BUTTON / STATUS --- */}
                </Card>
            </div>
        </div>
    );
}