// frontend/src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { AiChatInterfaceWithThinking } from '@/components/ai/AiChatInterfaceWithThinking';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Add declaration for lucide-react to fix TypeScript error
declare module 'lucide-react';

// Keep User interface or enhance it based on actual DB fields
interface User {
    id: number;
    email: string;
    first_name: string;
    surname?: string;
    role: string;
    school?: string;
    location?: string;
    phone?: string;
    gender?: string;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast();

    // --- State to prevent hydration mismatch ---
    const [hasMounted, setHasMounted] = useState(false);
    const [greeting, setGreeting] = useState("Welcome");
    const [userName, setUserName] = useState("User");

    // --- Get state and actions from the store ---
    // Only access auth state after component has mounted
    const { user, isAuthenticated, isLoading: isLoadingAuth, clearAuth } = useAuthStore();

    // --- Effect to set hasMounted on client ---
    useEffect(() => {
        setHasMounted(true);
        console.log("Component mounted, auth state:", {
            isLoading: isLoadingAuth,
            isAuthenticated,
            hasUser: !!user,
            user: user
        });

        // Set greeting based on time of day
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting('Good morning');
        } else if (hour < 18) {
            setGreeting('Good afternoon');
        } else {
            setGreeting('Good evening');
        }
    }, [isAuthenticated, user, isLoadingAuth]);

    // --- Debug effect for user data ---
    useEffect(() => {
        if (user) {
            console.log("User data:", {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                surname: user.surname,
                role: user.role,
                fullUser: JSON.stringify(user)
            });

            // Set the user name if available
            if (user.first_name) {
                console.log("Setting user name to:", user.first_name);
                setUserName(user.first_name);
            } else {
                console.log("User first_name not available");
                // Try to set a hardcoded name for testing
                setUserName("TestUser");
            }
        } else {
            console.log("User object is null or undefined");
            // Set a hardcoded name for testing
            setUserName("TestUser");
        }
    }, [user]);

    // --- Effect to handle authentication ---
    useEffect(() => {
        if (hasMounted && !isLoadingAuth && !isAuthenticated) {
            console.log("Not authenticated, redirecting to login");
            router.push('/login');
        }
    }, [hasMounted, isAuthenticated, isLoadingAuth, router]);

    // --- Loading state ---
    if (!hasMounted || isLoadingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            </div>
        );
    }

    // --- Not authenticated state ---
    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    // --- Logout handler ---
    const handleLogout = () => {
        clearAuth();
        router.push('/');
    };

    // --- Render dashboard ---
    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-2 sm:p-4">
            <div className="container mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-arvo font-bold text-white">
                        {greeting}, {user?.firstName || user?.first_name || 'User'}👋!
                    </h1>
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20 w-full sm:w-auto"
                    >
                        Logout
                    </Button>
                </div>

                {/* Teacher Tools - Only visible to teachers */}
                {user && user.role === 'teacher' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Dashboard Cards */}
                        <Link href="/dashboard/lesson-planner" className="block">
                            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                                <h2 className="text-lg sm:text-xl font-arvo font-bold text-white mb-2">Lesson Planner</h2>
                                <p className="text-white/80 text-sm sm:text-base">Create and manage your lesson plans with AI assistance</p>
                            </div>
                        </Link>

                        <Link href="/dashboard/my-lessons" className="block">
                            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                                <h2 className="text-lg sm:text-xl font-arvo font-bold text-white mb-2">My Lessons</h2>
                                <p className="text-white/80 text-sm sm:text-base">View and manage your saved lesson plans</p>
                            </div>
                        </Link>

                        <Link href="/dashboard/assessment-creator" className="block">
                            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                                <h2 className="text-lg sm:text-xl font-arvo font-bold text-white mb-2">Assessment Creator</h2>
                                <p className="text-white/80 text-sm sm:text-base">Generate assessments and quizzes for your students</p>
                            </div>
                        </Link>

                        <Link href="/dashboard/my-assessments" className="block">
                            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                                <h2 className="text-lg sm:text-xl font-arvo font-bold text-white mb-2">My Assessments</h2>
                                <p className="text-white/80 text-sm sm:text-base">View and manage your saved assessments</p>
                            </div>
                        </Link>

                        <Link href="/dashboard/rubric-generator" className="block">
                            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                                <h2 className="text-lg sm:text-xl font-arvo font-bold text-white mb-2">Rubric Generator</h2>
                                <p className="text-white/80 text-sm sm:text-base">Create grading rubrics for your assessments</p>
                            </div>
                        </Link>

                        <Link href="/dashboard/tos-builder" className="block">
                            <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                                <h2 className="text-lg sm:text-xl font-arvo font-bold text-white mb-2">TOS Builder</h2>
                                <p className="text-white/80 text-sm sm:text-base">Generate a Table of Specification to align content with learning goals and balanced assessment coverage.</p>
                            </div>
                        </Link>
                    </div>
                )}

                {/* AI Chat Interface */}
                <div className="mt-6 sm:mt-8">
                    <AiChatInterfaceWithThinking />
                </div>

                {/* Role-specific content */}
                {/* --- UPDATED Student Hub Block --- */}
                {user && user.role === 'student' && (
                    <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
                        <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 hover:bg-white/15 transition-all space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-brand-orange/20 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-brand-orange">Student Hub</h3>
                            </div>
                            <p className="text-slate-200 ml-11">Access curriculum content, track your progress, and get AI help with your studies.</p>
                            <div className="flex flex-wrap gap-2 mt-4 ml-11">
                                <Link href="/dashboard/student-hub">
                                    <Button variant="secondary" className="bg-brand-orange text-white hover:bg-brand-orange/90">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Browse SBC Content
                                    </Button>
                                </Link>
                                <Link href="/dashboard/student-hub?tab=progress">
                                    <Button variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        My Progress
                                    </Button>
                                </Link>
                                <Link href="/dashboard/student-hub/quizzes">
                                    <Button variant="secondary" className="bg-purple-600 text-white hover:bg-purple-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                        Browse Quizzes
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
                {/* --- END Student Hub Block --- */}

                {user && user.role === 'admin' && (
                    <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
                        <div className="p-4 sm:p-6 bg-white border rounded-lg shadow space-y-3">
                            <h3 className="text-lg sm:text-xl font-semibold text-brand-orange">Admin Tools</h3>
                            <div className="flex flex-wrap gap-2">
                                <Link href="/admin/uploads"><Button variant="secondary" className="w-full sm:w-auto">Upload Documents</Button></Link>
                                {/* Add links to user management, etc. later */}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- OTHER ROLES (Generic Welcome) --- */}
                {user && user.role !== 'teacher' && user.role !== 'student' && user.role !== 'admin' && (
                    <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white border rounded-lg shadow">
                        <h3 className="text-lg sm:text-xl font-semibold text-brand-orange">Welcome</h3>
                        <p className="text-slate-600">Your dashboard content will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- NEW: Student Content Viewer Component (defined in the same file for simplicity initially) ---

interface ContentChunk {
    id: number;
    content: string;
    source_document_name: string | null;
    chunk_index: number;
    similarity?: number; // Optional similarity score from search
}

function StudentContentViewer() {
    const { token } = useAuthStore(); // Need token for API calls
    const { toast } = useToast();

    // State for selections and content
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedGrade, setSelectedGrade] = useState<string>(""); // Assuming grade maps to class_level
    const [selectedTopic, setSelectedTopic] = useState<string>(""); // Optional topic input
    const [contentChunks, setContentChunks] = useState<ContentChunk[]>([]);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [errorLoadingContent, setErrorLoadingContent] = useState<string | null>(null);

    // TODO: Populate these dynamically later if needed
    const subjects = ["Integrated Science", "Mathematics", "English Language", "Social Studies", "Art and Design Studio", "Computing"];
    const grades = ["JHS 1", "JHS 2", "JHS 3", "SHS 1", "SHS 2", "SHS 3"];

    const fetchContent = async () => {
        if (!selectedSubject || !selectedGrade || !token) {
            setContentChunks([]); // Clear content if inputs are missing
            return;
        }

        setIsLoadingContent(true);
        setErrorLoadingContent(null);
        setContentChunks([]); // Clear previous content

        // Construct query parameters
        const params = new URLSearchParams({
            subject: selectedSubject,
            grade: selectedGrade,
        });
        if (selectedTopic.trim()) {
            params.append('topic', selectedTopic.trim());
        }

        try {
            const response = await fetch(`http://localhost:3003/api/content/student-material?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                let errorMsg = `Failed to fetch content (Status: ${response.status})`;
                try {
                    const data = await response.json();
                    errorMsg = data.error || errorMsg;
                } catch {
                    // Ignore JSON parse error
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            setContentChunks(data.chunks || []);

        } catch (error: Error | unknown) {
            console.error("Error fetching student content:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not load learning material.";
            setErrorLoadingContent(errorMessage);
            toast({
                title: "Loading Error",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsLoadingContent(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Learning Material</CardTitle>
                <CardDescription>Select your subject and grade to find relevant SBC content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Selection Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Subject Select */}
                    <div className="space-y-1">
                        <Label htmlFor="student-subject">Subject</Label>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger id="student-subject">
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Grade Select */}
                    <div className="space-y-1">
                        <Label htmlFor="student-grade">Grade/Level</Label>
                        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                            <SelectTrigger id="student-grade">
                                <SelectValue placeholder="Select Grade" />
                            </SelectTrigger>
                            <SelectContent>
                                {grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Topic Input (Optional) */}
                    <div className="space-y-1">
                        <Label htmlFor="student-topic">Topic (Optional)</Label>
                        <Input
                            id="student-topic"
                            placeholder="Enter specific topic..."
                            value={selectedTopic}
                            onChange={(e) => setSelectedTopic(e.target.value)}
                        />
                    </div>
                </div>
                {/* Fetch Button */}
                <Button onClick={fetchContent} disabled={!selectedSubject || !selectedGrade || isLoadingContent} className="w-full sm:w-auto">
                    {isLoadingContent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Load Material
                </Button>

                <Separator />

                {/* Content Display Area */}
                <div className="mt-4 space-y-4">
                    {isLoadingContent && (
                        <div className="flex justify-center items-center py-6"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
                    )}
                    {!isLoadingContent && errorLoadingContent && (
                        <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{errorLoadingContent}</AlertDescription></Alert>
                    )}
                    {!isLoadingContent && !errorLoadingContent && contentChunks.length === 0 && (
                        <p className="text-center text-gray-500 py-6">Select subject and grade, then click &quot;Load Material&quot;. No content found for the current selection.</p>
                    )}
                    {!isLoadingContent && !errorLoadingContent && contentChunks.length > 0 && (
                        <ScrollArea className="h-[40vh] sm:h-[50vh] p-3 sm:p-4 border rounded-md bg-white text-black"> {/* Scrollable content */}
                            <h3 className="text-base sm:text-lg font-semibold mb-3 text-brand-darkblue">Relevant Content:</h3>
                            {contentChunks.map(chunk => (
                                <div key={chunk.id} className="mb-4 pb-4 border-b last:border-b-0">
                                    <p className="text-xs text-gray-500 mb-1">
                                        Source: {chunk.source_document_name || 'Unknown'} (Chunk {chunk.chunk_index})
                                        {chunk.similarity && ` | Similarity: ${(chunk.similarity * 100).toFixed(1)}%`}
                                    </p>
                                    {/* Render chunk content using Markdown */}
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {chunk.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </ScrollArea>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}