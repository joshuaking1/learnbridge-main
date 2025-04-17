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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ClipboardCopy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from '@/stores/useAuthStore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Validation Schema
const lessonPlanSchema = z.object({
    subject: z.string().min(3, { message: "Subject is required (min 3 chars)." }),
    classLevel: z.string().min(1, { message: "Class Level is required." }),
    topic: z.string().min(5, { message: "Topic is required (min 5 chars)." }),
    duration: z.string().min(3, { message: "Duration is required (e.g., 45 minutes)." }),
    strand: z.string().min(3, { message: "Strand is required." }),
    subStrand: z.string().optional(),
    week: z.string().min(1, { message: "Week is required (e.g., Week 1)." }),
});

type LessonPlanFormValues = z.infer<typeof lessonPlanSchema>;

export default function LessonPlannerPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

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
            strand: "", subStrand: "",
            week: "",
        },
    });

    // --- onSubmit Function ---
    async function onSubmit(values: LessonPlanFormValues) {
        setIsGenerating(true);
        setGeneratedPlan(null);
        setSaveSuccess(null);
        console.log("Requesting Lesson Plan:", values);
        if (!token) { /* ... auth check ... */ return; }
        try {
            const response = await fetch('http://localhost:3004/api/ai/generate/lesson-plan', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                 body: JSON.stringify(values),
             });
            const data = await response.json();
            if (!response.ok) {
                console.error("Lesson Plan Generation Failed:", data);
                toast({ title: `Generation Failed (${response.status})`, description: data.error || "Error generating plan.", variant: "destructive" });
            } else {
                console.log("Lesson Plan Generated Successfully.");
                setGeneratedPlan(data.lessonPlan);
                toast({ title: "Lesson Plan Generated!", description: "Review the generated plan below." });
            }
        } catch (error) {
            console.error("Network error generating lesson plan:", error);
            toast({ title: "Network Error", description: "Could not connect to AI service.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    }

    // --- handleSavePlan Function ---
    const handleSavePlan = async () => {
        if (!generatedPlan || isSaving) return;
        if (!token) { /* ... auth check ... */ return; }
        setIsSaving(true);
        setSaveSuccess(null);
        const currentInputs = form.getValues();
        const payload = {
            subject: currentInputs.subject, classLevel: currentInputs.classLevel, topic: currentInputs.topic,
            duration: currentInputs.duration, strand: currentInputs.strand,
            subStrand: currentInputs.subStrand,
            week: currentInputs.week,
            planContent: generatedPlan
        };
        console.log("Saving Lesson Plan:", payload.subject, payload.topic);
        try {
            const response = await fetch('http://localhost:3005/api/teacher-tools/lessons', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                 body: JSON.stringify(payload),
             });
            const data = await response.json();
            if (!response.ok) {
                console.error("Failed to save lesson plan:", data);
                setSaveSuccess(false);
                toast({ title: `Save Failed (${response.status})`, description: data.error || "Error saving plan.", variant: "destructive" });
            } else {
                console.log("Lesson Plan Saved Successfully:", data);
                setSaveSuccess(true);
                toast({ title: "Lesson Plan Saved!", description: `Plan for "${payload.topic}" saved.` });
            }
        } catch (error) {
            console.error("Network error saving lesson plan:", error);
            setSaveSuccess(false);
            toast({ title: "Network Error", description: "Could not connect to server to save plan.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    // --- Handle Copy ---
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
    }, [generatedPlan, toast]);

    // --- RENDER LOGIC ---
    if (!hasMounted) { return null; }
    if (isLoadingAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                 <Loader2 className="h-8 w-8 animate-spin mr-3 text-brand-midblue" /> Loading Session...
            </div>
        );
    }
    if (!isAuthenticated || !user || user.role !== 'teacher') {
         return (
             <div className="flex items-center justify-center min-h-screen bg-slate-100 text-red-500">
                 Access Denied. Please log in as a teacher or redirecting...
            </div>
         );
     }

    // Main Content Render
    return (
        <div className="min-h-screen bg-slate-100">
            <div className="p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-brand-darkblue">AI Lesson Planner</h1>
                    <div className="text-sm text-gray-500">
                        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                        {' / '}
                        <span>Lesson Planner</span>
                    </div>
                </div>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                    Back to Dashboard
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                {/* Left Column - Form */}
                <div className="bg-white rounded-md border border-gray-200 p-4">
                    <h2 className="text-lg font-bold mb-1">Lesson Details</h2>
                    <p className="text-sm text-gray-500 mb-4">Enter the specifics for your lesson.</p>
                    
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="e.g., Integrated Science"
                                {...form.register('subject')}
                                disabled={isGenerating}
                                className="w-full"
                            />
                            {form.formState.errors.subject && (
                                <p className="text-red-500 text-xs mt-1">{form.formState.errors.subject.message}</p>
                            )}
                        </div>

                        {/* Class Level */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Class Level <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="e.g., JHS 1, SHS 2"
                                {...form.register('classLevel')}
                                disabled={isGenerating}
                                className="w-full"
                            />
                            {form.formState.errors.classLevel && (
                                <p className="text-red-500 text-xs mt-1">{form.formState.errors.classLevel.message}</p>
                            )}
                        </div>

                        {/* Topic */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Topic <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                placeholder="e.g., Photosynthesis and its Importance"
                                {...form.register('topic')}
                                disabled={isGenerating}
                                className="w-full min-h-[80px]"
                            />
                            {form.formState.errors.topic && (
                                <p className="text-red-500 text-xs mt-1">{form.formState.errors.topic.message}</p>
                            )}
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Duration <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="e.g., 45 minutes"
                                {...form.register('duration')}
                                disabled={isGenerating}
                                className="w-full"
                            />
                            {form.formState.errors.duration && (
                                <p className="text-red-500 text-xs mt-1">{form.formState.errors.duration.message}</p>
                            )}
                        </div>

                        {/* Strand */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Strand <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="e.g., Diversity of Matter"
                                {...form.register('strand')}
                                disabled={isGenerating}
                                className="w-full"
                            />
                            {form.formState.errors.strand && (
                                <p className="text-red-500 text-xs mt-1">{form.formState.errors.strand.message}</p>
                            )}
                        </div>

                        {/* Sub-Strand */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Sub-Strand (Optional)
                            </label>
                            <Input
                                placeholder="e.g., Materials"
                                {...form.register('subStrand')}
                                disabled={isGenerating}
                                className="w-full"
                            />
                        </div>

                        {/* Week */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Week <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="e.g., Week 1, Unit 3"
                                {...form.register('week')}
                                disabled={isGenerating}
                                className="w-full"
                            />
                            {form.formState.errors.week && (
                                <p className="text-red-500 text-xs mt-1">{form.formState.errors.week.message}</p>
                            )}
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-brand-orange hover:bg-brand-orange/90" 
                            disabled={isGenerating}
                        >
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isGenerating ? 'Generating Plan...' : 'Generate Lesson Plan'}
                        </Button>
                    </form>
                </div>

                {/* Right Column - Generated Plan */}
                <div className="bg-white rounded-md border border-gray-200 p-4">
                    <h2 className="text-lg font-bold mb-1">Generated Lesson Plan</h2>
                    <p className="text-sm text-gray-500 mb-4">Review the AI-generated plan below. Copy, edit, and save as needed.</p>
                    
                    {/* Loading State */}
                    {isGenerating && (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-brand-midblue" />
                            <p className="ml-3 text-gray-600">Generating...</p>
                        </div>
                    )}
                    
                    {/* Empty State */}
                    {!isGenerating && !generatedPlan && (
                        <div className="text-center text-gray-500 h-40 flex items-center justify-center">
                            Enter lesson details and click "Generate" to see the plan here.
                        </div>
                    )}
                    
                    {/* Generated Plan */}
                    {generatedPlan && (
                        <>
                            <div className="border border-gray-200 rounded-md bg-white p-4 mb-4 max-h-[500px] overflow-auto">
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
                            
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    onClick={handleSavePlan}
                                    disabled={isSaving || saveSuccess === true}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isSaving ? 'Saving...' : saveSuccess === true ? 'Saved!' : 'Save Lesson Plan'}
                                </Button>
                                
                                <Button
                                    variant="outline"
                                    onClick={handleCopy}
                                    disabled={isSaving}
                                >
                                    <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Plan
                                </Button>
                            </div>
                            
                            {saveSuccess === false && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertTitle>Save Failed</AlertTitle>
                                    <AlertDescription>
                                        There was an error saving the lesson plan. Please try again.
                                    </AlertDescription>
                                </Alert>
                            )}
                            
                            {saveSuccess === true && (
                                <Alert className="mt-4 bg-green-100 border-green-300 text-green-800">
                                    <AlertTitle>Success</AlertTitle>
                                    <AlertDescription>
                                        Lesson plan saved successfully. You can view it in "My Lesson Plans".
                                    </AlertDescription>
                                </Alert>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
