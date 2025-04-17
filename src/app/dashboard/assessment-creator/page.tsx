// frontend/src/app/dashboard/assessment-creator/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react"; // Added useEffect, useCallback
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast" // Corrected useToast import path
import { Loader2, ClipboardCopy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from '@/stores/useAuthStore'; // <-- Import Auth Store
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Validation Schema for Assessment Inputs
const assessmentSchema = z.object({
    subject: z.string().min(3, { message: "Subject is required (min 3 chars)." }),
    classLevel: z.string().min(1, { message: "Class Level is required." }),
    topic: z.string().min(5, { message: "Topic is required (min 5 chars)." }),
    contentStandard: z.string().min(5, { message: "Content Standard is required (e.g., B7.1.1.1)." }),
    assessmentType: z.string().min(3, { message: "Assessment Type is required." }),
    dokLevels: z.array(z.coerce.number().min(1).max(4))
                  .min(1, { message: "Select at least one DoK Level." }),
    numQuestions: z.coerce.number().min(1).max(20, { message: "Number must be 1-20." }),
});

type AssessmentFormValues = z.infer<typeof assessmentSchema>;

export default function AssessmentCreatorPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false); // Renamed isLoading
    const [generatedAssessment, setGeneratedAssessment] = useState<string | null>(null);
    const [isAiServiceAvailable, setIsAiServiceAvailable] = useState<boolean | null>(null);
    const [isCheckingAiService, setIsCheckingAiService] = useState(false);
    // Add missing state variables
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

    // Handle Copy to Clipboard
    const handleCopy = useCallback(() => {
        if (!generatedAssessment) {
            toast({ title: "Nothing to Copy", description: "Generate an assessment first.", variant: "destructive" });
            return;
        }
        if (!navigator.clipboard) {
             toast({ title: "Copy Failed", description: "Clipboard API not available in your browser.", variant: "destructive" });
             return;
        }

        navigator.clipboard.writeText(generatedAssessment)
            .then(() => {
                toast({ title: "Copied!", description: "Assessment copied to clipboard." });
            })
            .catch(err => {
                console.error("Failed to copy text: ", err);
                toast({ title: "Copy Failed", description: "Could not copy text to clipboard.", variant: "destructive" });
            });
    }, [generatedAssessment, toast]);

    // --- Get Auth State ---
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();

    // --- State to prevent hydration mismatch ---
    const [hasMounted, setHasMounted] = useState(false);

    // --- Effect to set hasMounted on client ---
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // --- Check AI Service Availability ---
    useEffect(() => {
        if (hasMounted) {
            checkAiService();
        }
    }, [hasMounted]);

    // --- Function to check AI service availability ---
    const checkAiService = async () => {
        setIsCheckingAiService(true);
        try {
            console.log("Checking AI service availability...");
            const response = await fetch('http://localhost:3004/api/ai/health');
            const data = await response.json();
            console.log("AI service health check:", data);
            setIsAiServiceAvailable(response.ok);
        } catch (error) {
            console.error("AI service health check failed:", error);
            setIsAiServiceAvailable(false);
        } finally {
            setIsCheckingAiService(false);
        }
    };

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


    const form = useForm<AssessmentFormValues>({
        resolver: zodResolver(assessmentSchema),
        defaultValues: {
            subject: "",
            classLevel: "",
            topic: "",
            contentStandard: "",
            assessmentType: "Multiple Choice",
            dokLevels: [], // Initialize as empty array
            numQuestions: 5,
        },
    });

    async function onSubmit(values: AssessmentFormValues) {
        setIsGenerating(true); // Use isGenerating state
        setGeneratedAssessment(null);
        console.log("Requesting Assessment:", values);

        // --- Check if AI service is available ---
        if (isAiServiceAvailable === false) {
            toast({
                title: "AI Service Unavailable",
                description: "The AI service is not running. Please try again later or contact the LearnBridgEdu support Team.",
                variant: "destructive"
            });
            setIsGenerating(false);
            return;
        }

        // --- Use token from store ---
        if (!token) {
            toast({ title: "Authentication Error", description: "Token not found. Please log in again.", variant: "destructive" });
            router.push('/login');
            setIsGenerating(false);
            return;
        }

        try {
            console.log("Sending request to AI service...");
            const response = await fetch('http://localhost:3004/api/ai/generate/assessment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Use token from store
                },
                body: JSON.stringify({
                    ...values,
                    // Backend already expects dokLevels as array
                    numQuestions: Number(values.numQuestions) // Ensure sent as number
                }),
            });

            console.log("Response received:", response.status);
            const data = await response.json();

            if (!response.ok) {
                console.error("Assessment Generation Failed:", data);
                toast({
                    title: `Generation Failed (${response.status})`,
                    description: data.error || "An error occurred generating the assessment.",
                    variant: "destructive",
                });
            } else {
                console.log("Assessment Generated Successfully.");
                setGeneratedAssessment(data.assessment);
                toast({
                    title: "Assessment Generated!",
                    description: "Review the generated assessment below.",
                });
            }
        } catch (error) {
            console.error("Network error generating assessment:", error);
            let errorMessage = "Could not connect to AI service.";

            // Provide more specific error messages based on the error type
            if (error instanceof TypeError && error.message.includes('fetch')) {
                errorMessage = "Could not connect to the AI service. Please check if the service is running.";
            } else if (error instanceof Error) {
                errorMessage = `Error: ${error.message}`;
            }

            toast({
                title: "Network Error",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false); // Use isGenerating state
        }
    }

    const handleSaveAssessment = async () => {
        if (!generatedAssessment || isSaving) return;
        if (!token) { /* ... auth token check ... */ return; }

        setIsSaving(true);
        setSaveSuccess(null);

        // Get current form values (these were used to generate the assessment)
        const currentInputs = form.getValues();

        const payload = {
            // title: `Assessment: ${currentInputs.topic.substring(0,30)}...`, // Auto-generate title or add field later
            subject: currentInputs.subject,
            classLevel: currentInputs.classLevel,
            topic: currentInputs.topic,
            contentStandard: currentInputs.contentStandard,
            assessmentType: currentInputs.assessmentType,
            dokLevels: currentInputs.dokLevels, // Send array
            numQuestions: Number(currentInputs.numQuestions), // Ensure number
            assessmentContent: generatedAssessment // The actual generated markdown/text
        };

        console.log("Saving Assessment:", payload.subject, payload.topic);

        try {
            const response = await fetch('http://localhost:3005/api/teacher-tools/assessments', { // http://localhost:3005/api/teacher-tools/assessments
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Failed to save assessment:", data);
                setSaveSuccess(false);
                toast({ title: `Save Failed (${response.status})`, description: data.error || "Error saving assessment.", variant: "destructive" });
            } else {
                console.log("Assessment Saved Successfully:", data);
                setSaveSuccess(true);
                toast({ title: "Assessment Saved!", description: `Assessment for "${payload.topic}" saved successfully.` });
            }
        } catch (error) {
            console.error("Network error saving assessment:", error);
            setSaveSuccess(false);
            toast({ title: "Network Error", description: "Could not connect to server to save assessment.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };


    // --- Render Logic ---
    if (!hasMounted || isLoadingAuth) { /* ... loading auth ... */ }
    if (!isAuthenticated || !user) { /* ... not authenticated ... */ }
    // Add teacher role check if needed

    // --- Initial Render (Pre-Mount/Hydration) ---
    if (!hasMounted) {
        return null;
    }

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
         return (
             <div className="flex items-center justify-center min-h-screen bg-slate-100">
                 Redirecting to login...
            </div>
         );
    }

    // --- Main Page Content ---
    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8" suppressHydrationWarning>
             <header className="mb-6 flex justify-between items-center">
                 <div>
                     <h1 className="text-3xl font-bold text-brand-darkblue">AI Assessment Creator</h1>
                     <nav className="text-sm text-gray-500">
                         <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                         {' / '}
                         <span>Assessment Creator</span>
                     </nav>
                 </div>
                 <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
             </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Form Card */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Assessment Details</CardTitle>
                        <CardDescription>Specify parameters for the assessment.</CardDescription>
                        {isAiServiceAvailable === null && (
                            <div className="mt-2 p-2 bg-gray-100 text-gray-800 rounded-md text-sm">
                                <div className="flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <p>Checking AI service availability...</p>
                                </div>
                            </div>
                        )}
                        {isAiServiceAvailable === false && (
                            <div className="mt-2 p-2 bg-red-100 text-red-800 rounded-md text-sm">
                                <p className="font-medium">AI Service Unavailable</p>
                                <p>The AI service is not running. Please try again later or contact support.</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 text-red-800 border-red-300 hover:bg-red-200"
                                    onClick={checkAiService}
                                    disabled={isCheckingAiService}
                                >
                                    {isCheckingAiService ? (
                                        <>
                                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                            Checking...
                                        </>
                                    ) : (
                                        "Retry Connection"
                                    )}
                                </Button>
                            </div>
                        )}
                        {isAiServiceAvailable === true && (
                            <div className="mt-2 p-2 bg-green-100 text-green-800 rounded-md text-sm">
                                <p className="font-medium">AI Service Available</p>
                                <p>You can generate assessments.</p>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            {/* Use isGenerating for disabling form */}
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="subject" render={({ field }) => (
                                    <FormItem> <FormLabel>Subject *</FormLabel> <FormControl><Input placeholder="e.g., Integrated Science" {...field} disabled={isGenerating} /></FormControl> <FormMessage /> </FormItem>
                                )} />
                                <FormField control={form.control} name="classLevel" render={({ field }) => (
                                    <FormItem> <FormLabel>Class Level *</FormLabel> <FormControl><Input placeholder="e.g., JHS 1, SHS 2" {...field} disabled={isGenerating} /></FormControl> <FormMessage /> </FormItem>
                                )} />
                                <FormField control={form.control} name="topic" render={({ field }) => (
                                    <FormItem> <FormLabel>Topic *</FormLabel> <FormControl><Textarea placeholder="e.g., Photosynthesis and its Importance" {...field} rows={2} disabled={isGenerating} /></FormControl> <FormMessage /> </FormItem>
                                )} />
                                <FormField control={form.control} name="contentStandard" render={({ field }) => (
                                    <FormItem> <FormLabel>Content Standard *</FormLabel> <FormControl><Textarea placeholder="e.g., B7.2.1.1: Demonstrate understanding..." {...field} rows={3} disabled={isGenerating} /></FormControl> <FormMessage /> </FormItem>
                                )} />
                                <FormField control={form.control} name="assessmentType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assessment Type *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isGenerating}>
                                            <FormControl>
                                                <SelectTrigger> <SelectValue placeholder="Select assessment type" /> </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white border shadow-md z-50">
                                                <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                                                <SelectItem value="Short Answer">Short Answer</SelectItem>
                                                <SelectItem value="Essay">Essay</SelectItem>
                                                <SelectItem value="Project Task">Project Task</SelectItem>
                                                <SelectItem value="Practical">Practical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField
                                    control={form.control}
                                    name="dokLevels"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-2"> {/* Reduced bottom margin */}
                                                <FormLabel className="text-base">Depth of Knowledge (DoK) *</FormLabel>
                                                <FormDescription>Select one or more levels.</FormDescription>
                                            </div>
                                            {[1, 2, 3, 4].map((level) => (
                                                <FormField
                                                    key={level}
                                                    control={form.control}
                                                    name="dokLevels"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem key={level} className="flex flex-row items-center space-x-3 space-y-0 mb-1"> {/* Reduced bottom margin */}
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(level)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...(field.value || []), level])
                                                                                : field.onChange((field.value || []).filter((value) => value !== level));
                                                                        }}
                                                                        disabled={isGenerating} // Disable checkbox when generating
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal text-sm"> {/* Slightly smaller label */}
                                                                    {level} ({ level === 1 ? 'Recall' : level === 2 ? 'Skill/Concept' : level === 3 ? 'Strategic Thinking' : 'Extended Thinking' })
                                                                </FormLabel>
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            ))}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField control={form.control} name="numQuestions" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number of Questions/Tasks *</FormLabel>
                                        <FormControl>
                                            {/* Ensure field value is treated as number for input, handle potential NaN */}
                                            <Input type="number" min="1" max="20" placeholder="e.g., 5"
                                                value={field.value || ''} // Handle potential undefined value
                                                onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)} // Convert to number or undefined
                                                disabled={isGenerating}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <Button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange/90" disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isGenerating ? 'Generating Assessment...' : 'Generate Assessment'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start space-y-2 pt-4">
                        {generatedAssessment && ( // Only show save button if assessment exists
                            <Button
                                onClick={handleSaveAssessment} // Call the correct handler
                                disabled={isSaving || saveSuccess === true}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isSaving ? 'Saving...' : saveSuccess === true ? 'Saved!' : 'Save Assessment'}
                            </Button>
                        )}
                        {saveSuccess === false && ( // Show error message if save failed
                            <Alert variant="destructive" className="w-full">
                                <AlertTitle>Save Failed</AlertTitle>
                                <AlertDescription>
                                    There was an error saving the assessment. Please try again.
                                </AlertDescription>
                            </Alert>
                        )}
                         {saveSuccess === true && ( // Show success message
                            <Alert variant="default" className="w-full bg-green-100 border-green-300 text-green-800">
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>
                                    Assessment saved successfully. You can view it in &quot;My Assessments&quot;.
                                    {/* TODO: Add link to My Assessments page later */}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardFooter>
                </Card>

                {/* Generated Assessment Display Area */}
                <Card className="lg:col-span-2" id="generated-assessment-section">
                    <CardHeader>
                        <CardTitle>Generated Assessment</CardTitle>
                        <CardDescription>Review the AI-generated assessment below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isGenerating && !generatedAssessment && (
                            <div className="flex flex-col items-center justify-center h-[70vh] p-4 border rounded-md bg-white/50">
                                <Loader2 className="h-8 w-8 animate-spin mb-4 text-brand-midblue" />
                                <p className="text-gray-600">Generating your assessment...</p>
                                <p className="text-sm text-gray-500 mt-2">This may take a minute or two.</p>
                            </div>
                        )}
                        {!isGenerating && !generatedAssessment && (
                            <div className="flex flex-col items-center justify-center h-[70vh] p-4 border rounded-md bg-white/50">
                                <p className="text-gray-600">No assessment generated yet.</p>
                                <p className="text-sm text-gray-500 mt-2">Fill out the form and click &quot;Generate Assessment&quot; to create one.</p>
                            </div>
                        )}
                        {generatedAssessment && (
                            <ScrollArea className="h-[70vh] p-4 border rounded-md bg-white">
                                <div className="prose prose-sm sm:prose-base max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {generatedAssessment}
                                    </ReactMarkdown>
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                    {/* Add CardFooter with Copy Button */}
                    <CardFooter className="flex flex-wrap items-start gap-2 pt-4">
                        {generatedAssessment && (
                            <Button
                                variant="outline"
                                onClick={handleCopy}
                                disabled={isGenerating}
                                title="Copy assessment content to clipboard"
                            >
                                <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Assessment
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}