// frontend/src/app/dashboard/lesson-planner/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@clerk/nextjs';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast"; // Corrected path
import { Loader2, ClipboardCopy, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from '@/stores/useAuthStore'; // Corrected path
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TeacherToolsUsageLimits } from "@/components/teacher/TeacherToolsUsageLimits";

// Validation Schema - Updated
const lessonPlanSchema = z.object({
    subject: z.string().min(3, { message: "Subject is required (min 3 chars)." }),
    classLevel: z.string().min(1, { message: "Class Level is required." }),
    topic: z.string().min(5, { message: "Topic is required (min 5 chars)." }),
    duration: z.string().min(3, { message: "Duration is required (e.g., 45 minutes)." }),
    strand: z.string().min(3, { message: "Strand is required." }),
    subStrand: z.string().optional(), // <-- Make optional
    week: z.string().min(1, { message: "Week is required (e.g., Week 1)." }), // <-- Renamed from contentStandard
});

type LessonPlanFormValues = z.infer<typeof lessonPlanSchema>;

export default function LessonPlannerPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
    const [limitReached, setLimitReached] = useState(false);

    // Auth State & Hydration Fix
    const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => { setHasMounted(true); }, []);
    useEffect(() => {
        if (hasMounted && !isLoadingAuth && !isAuthenticated) {
            toast({ title: "Authentication Required", description: "Please log in.", variant: "destructive" });
            router.push('/login');
        }
        // Optional: Add teacher role check
         if (hasMounted && !isLoadingAuth && isAuthenticated && user?.role !== 'teacher') {
            toast({ title: "Access Denied: Teachers Only", variant: "destructive" });
            router.push('/dashboard');
         }
    }, [hasMounted, isLoadingAuth, isAuthenticated, user, router, toast]);

    // Form Initialization
    const form = useForm<LessonPlanFormValues>({
        resolver: zodResolver(lessonPlanSchema),
        defaultValues: {
            subject: "", classLevel: "", topic: "", duration: "45 minutes",
            strand: "", subStrand: "", // Optional, default empty
            week: "", // Renamed from contentStandard
        },
    });

    // --- onSubmit Function ---
    async function onSubmit(values: LessonPlanFormValues) {
        setIsGenerating(true);
        setGeneratedPlan(null);
        setSaveSuccess(null);
        console.log("Requesting Lesson Plan:", values);

        if (!token) {
            toast({
                title: "Authentication Error",
                description: "Please log in again.",
                variant: "destructive"
            });
            setIsGenerating(false);
            return;
        }

        try {
            // Use our Next.js API route instead of calling the AI service directly
            const response = await fetch('/api/ai/generate/lesson-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(values),
            });

            console.log("Response status:", response.status);

            // Handle usage limit (429) specifically
            if (response.status === 429) {
                setLimitReached(true);
                toast({
                    title: "Usage Limit Reached",
                    description: "You've reached your daily usage limit for this service.",
                    variant: "destructive"
                });
                return;
            }

            // Handle other error responses
            if (!response.ok) {
                toast({
                    title: `Generation Failed (${response.status})`,
                    description: "Error generating lesson plan. Please try again.",
                    variant: "destructive"
                });
                return;
            }

            // Handle successful response
            try {
                const data = await response.json();

                if (!data || !data.lessonPlan) {
                    toast({
                        title: "Generation Failed",
                        description: "Received invalid response format from server.",
                        variant: "destructive"
                    });
                    return;
                }

                console.log("Lesson Plan Generated Successfully.");
                setGeneratedPlan(data.lessonPlan);
                toast({
                    title: "Lesson Plan Generated!",
                    description: "Review the generated plan below."
                });
            } catch (parseError) {
                console.error("Error parsing response:", parseError);
                toast({
                    title: "Generation Failed",
                    description: "Received invalid response from server.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Network error generating lesson plan:", error);
            toast({
                title: "Network Error",
                description: "Could not connect to AI service.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    }

    // --- handleSavePlan Function ---
    const handleSavePlan = async () => {
        if (!generatedPlan || isSaving) return;

        if (!token) {
            toast({
                title: "Authentication Error",
                description: "Please log in again.",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);
        setSaveSuccess(null);

        const currentInputs = form.getValues();
        const payload = {
            subject: currentInputs.subject,
            classLevel: currentInputs.classLevel,
            topic: currentInputs.topic,
            duration: currentInputs.duration,
            strand: currentInputs.strand,
            subStrand: currentInputs.subStrand,
            week: currentInputs.week,
            planContent: generatedPlan
        };

        console.log("Saving Lesson Plan:", payload.subject, payload.topic);

        try {
            // Simple fetch with basic error handling
            const response = await fetch('https://learnbridge-teacher-tools-service.onrender.com/api/teacher-tools/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            console.log("Save response status:", response.status);

            // Handle usage limit (429) specifically
            if (response.status === 429) {
                setSaveSuccess(false);
                setLimitReached(true);
                toast({
                    title: "Usage Limit Reached",
                    description: "You've reached your daily usage limit for this service.",
                    variant: "destructive"
                });
                return;
            }

            // Handle other error responses
            if (!response.ok) {
                setSaveSuccess(false);
                toast({
                    title: `Save Failed (${response.status})`,
                    description: "Error saving lesson plan. Please try again.",
                    variant: "destructive"
                });
                return;
            }

            // Handle successful response
            try {
                const data = await response.json();
                console.log("Lesson Plan Saved Successfully:", data);
                setSaveSuccess(true);
                toast({
                    title: "Lesson Plan Saved!",
                    description: `Plan for "${payload.topic}" saved.`
                });
            } catch (parseError) {
                // Even if parsing fails, the save was successful
                console.log("Lesson Plan Saved Successfully (no JSON response)");
                setSaveSuccess(true);
                toast({
                    title: "Lesson Plan Saved!",
                    description: `Plan for "${payload.topic}" saved.`
                });
            }
        } catch (error) {
            console.error("Network error saving lesson plan:", error);
            setSaveSuccess(false);
            toast({
                title: "Network Error",
                description: "Could not connect to server to save plan.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    // --- NEW: Handle Copy ---
    const handleCopy = useCallback(() => {
        if (!generatedPlan) {
            toast({ title: "Nothing to Copy", description: "Generate a plan first.", variant: "destructive" });
            return;
        }
        if (!navigator.clipboard) {
             toast({ title: "Copy Failed", description: "Clipboard API not available in your browser.", variant: "destructive" });
             return;
        }

        navigator.clipboard.writeText(generatedPlan)
            .then(() => {
                toast({ title: "Copied!", description: "Lesson plan copied to clipboard." });
            })
            .catch(err => {
                console.error("Failed to copy text: ", err);
                toast({ title: "Copy Failed", description: "Could not copy text to clipboard.", variant: "destructive" });
            });
    }, [generatedPlan, toast]); // Dependencies


    // --- RENDER LOGIC ---

    // 1. Pre-Mount Check
    if (!hasMounted) { return null; }

    // 2. Auth Loading Check
    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                 <Loader2 className="h-8 w-8 animate-spin mr-3 text-brand-midblue" /> Loading Session...
            </div>
        );
    }

    // 3. Authentication & Role Check (Post-Load)
    // The useEffect handles redirection, this is a fallback UI state
    if (!isAuthenticated || !user || user.role !== 'teacher') {
         return (
             <div className="flex items-center justify-center min-h-screen bg-slate-100 text-red-500">
                 Access Denied. Please log in as a teacher or redirecting...
            </div>
         );
     }

    // 4. Main Content Render
    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
             <header className="mb-6 flex justify-between items-center">
                 <div>
                     <h1 className="text-3xl font-bold text-brand-darkblue">AI Lesson Planner</h1>
                     <nav className="text-sm text-gray-500">
                         <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                         {' / '}
                         <span>Lesson Planner</span>
                     </nav>
                 </div>
                 <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
             </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Form Card */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Usage Limit Reached Alert */}
                    {limitReached && (
                        <Alert variant="destructive" className="mb-4 bg-red-600 text-white border-red-700 shadow-md">
                            <AlertCircle className="h-4 w-4 text-white" />
                            <AlertTitle className="font-semibold text-white">Usage Limit Reached</AlertTitle>
                            <AlertDescription className="text-white">
                                You've reached your daily usage limit for the Lesson Planner. The limit will reset at midnight.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Usage Limits */}
                    <TeacherToolsUsageLimits />

                    <Card>
                        <CardHeader>
                            <CardTitle>Lesson Details</CardTitle>
                            <CardDescription>Enter the specifics for your lesson.</CardDescription>
                        </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {/* Subject */}
                                <FormField control={form.control} name="subject" render={({ field }) => (
                                    <FormItem> <FormLabel>Subject *</FormLabel> <FormControl><Input placeholder="e.g., Integrated Science" {...field} disabled={isGenerating} /></FormControl> <FormMessage /> </FormItem>
                                )} />
                                {/* Class Level */}
                                <FormField control={form.control} name="classLevel" render={({ field }) => (
                                    <FormItem> <FormLabel>Class Level *</FormLabel> <FormControl><Input placeholder="e.g., JHS 1, SHS 2" {...field} disabled={isGenerating} /></FormControl> <FormMessage /> </FormItem>
                                )} />
                                 {/* Topic */}
                                <FormField control={form.control} name="topic" render={({ field }) => (
                                    <FormItem> <FormLabel>Topic *</FormLabel> <FormControl><Textarea placeholder="e.g., Photosynthesis and its Importance" {...field} rows={2} disabled={isGenerating} /></FormControl> <FormMessage /> </FormItem>
                                )} />
                                 {/* Duration */}
                                <FormField control={form.control} name="duration" render={({ field }) => (
                                    <FormItem> <FormLabel>Duration *</FormLabel> <FormControl><Input placeholder="e.g., 45 minutes, 1 hour 30 minutes" {...field} disabled={isGenerating} /></FormControl> <FormMessage /> </FormItem>
                                )} />
                                 {/* Strand */}
                                <FormField control={form.control} name="strand" render={({ field }) => (
                                    <FormItem> <FormLabel>Strand *</FormLabel> <FormControl><Input placeholder="e.g., Diversity of Matter" {...field} disabled={isGenerating} /></FormControl> <FormMessage /> </FormItem>
                                )} />
                                 {/* Sub-strand (Optional) */}
                                <FormField control={form.control} name="subStrand" render={({ field }) => (
                                    <FormItem> <FormLabel>Sub-strand (Optional)</FormLabel> <FormControl><Input placeholder="e.g., Cycles" {...field} disabled={isGenerating} /></FormControl> <FormMessage /> </FormItem>
                                )} />
                                 {/* Week (was Content Standard) */}
                                <FormField control={form.control} name="week" render={({ field }) => (
                                    <FormItem> <FormLabel>Week *</FormLabel> <FormControl><Input placeholder="e.g., Week 1, Unit 3" {...field} disabled={isGenerating} /></FormControl> <FormMessage /> </FormItem>
                                )} />

                                <Button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange/90" disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isGenerating ? 'Generating Plan...' : 'Generate Lesson Plan'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
                </div>

                {/* Generated Plan Display Area */}
                <Card className="lg:col-span-2" id="generated-plan-section">
                    <CardHeader>
                        <CardTitle>Generated Lesson Plan</CardTitle>
                        <CardDescription>Review the AI-generated plan below. Copy, edit, and save as needed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Loading Generation State */}
                        {isGenerating && (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-brand-midblue" />
                                <p className="ml-3 text-gray-600">Generating...</p>
                            </div>
                        )}
                        {/* Initial State (Not Loading, No Plan) */}
                        {!isGenerating && !generatedPlan && (
                            <div className="text-center text-gray-500 h-40 flex items-center justify-center">
                                Enter lesson details and click "Generate" to see the plan here.
                            </div>
                        )}
                        {/* Display Generated Plan */}
                        {generatedPlan && (
                            <ScrollArea className="h-[65vh] p-4 border rounded-md bg-white">
                                <div className="prose max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
                                            h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-3 mb-1" {...props} />,
                                            h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-2 mb-1" {...props} />,
                                            strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                                            p: ({node, ...props}) => <p className="mb-2" {...props} />,
                                        }}
                                    >
                                        {generatedPlan}
                                    </ReactMarkdown>
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                    {/* Save Button / Status Area */}
                    <CardFooter className="flex flex-wrap items-start gap-2 pt-4"> {/* Use flex-wrap and gap */}
                        {/* Save Button / Status */}
                        <div className="flex flex-col space-y-2"> {/* Group save button and status */}
                            {generatedPlan && ( // Only show if a plan exists
                                <Button
                                    onClick={handleSavePlan}
                                    disabled={isSaving || saveSuccess === true}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isSaving ? 'Saving...' : saveSuccess === true ? 'Saved!' : 'Save Lesson Plan'}
                                </Button>
                            )}
                            {saveSuccess === false && (
                                <Alert variant="destructive" className="w-full max-w-xs">
                                    <AlertTitle>Save Failed</AlertTitle>
                                    <AlertDescription>
                                        There was an error saving the lesson plan. Please try again.
                                    </AlertDescription>
                                </Alert>
                            )}
                            {saveSuccess === true && (
                                <Alert variant="success" className="w-full max-w-xs bg-green-100 border-green-300 text-green-800">
                                    <AlertTitle>Success</AlertTitle>
                                    <AlertDescription>
                                        Lesson plan saved successfully. You can view it in "My Lesson Plans".
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Copy Button */}
                        {generatedPlan && ( // Only show if plan exists
                            <Button
                                variant="outline"
                                onClick={handleCopy}
                                disabled={isSaving || isGenerating} // Disable while saving or generating
                                title="Copy plan content to clipboard"
                            >
                                <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Plan
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}