"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, PlusCircle, ArrowLeft } from "lucide-react";
import { discussionService } from "@/services/discussionService";
// import { ForumCard } from "@/components/discussion/ForumCard"; // Placeholder for ForumCard component

// Define a placeholder type for Forum
interface Forum {
  id: number;
  title: string;
  description: string;
  thread_count?: number; // Optional: Number of threads in the forum
  post_count?: number; // Optional: Number of posts in the forum
}

export default function DiscussionForumsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);

  const [forums, setForums] = useState<Forum[]>([]);
  const [isLoadingForums, setIsLoadingForums] = useState(true);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasMounted, isLoadingAuth, isAuthenticated, router]);

  useEffect(() => {
    if (hasMounted && isAuthenticated && token) {
      const fetchForums = async () => {
        setIsLoadingForums(true);
        try {
          // TODO: Replace with actual API call when backend is ready
          // const fetchedForums = await discussionService.getAllForums(token);
          // Mock data for now:
          const mockForums: Forum[] = [
            { id: 1, title: "General Discussion", description: "Talk about anything related to learning.", thread_count: 15, post_count: 120 },
            { id: 2, title: "Course Q&A", description: "Ask questions about specific courses.", thread_count: 30, post_count: 250 },
            { id: 3, title: "Study Groups", description: "Find study partners and form groups.", thread_count: 8, post_count: 45 },
          ];
          setForums(mockForums);
        } catch (error) {
          console.error("Error fetching forums:", error);
          toast({ 
            title: "Error", 
            description: "Failed to load forums. Please try again later.", 
            variant: "destructive" 
          });
        } finally {
          setIsLoadingForums(false);
        }
      };
      fetchForums();
    }
  }, [hasMounted, isAuthenticated, token, toast]);

  if (!hasMounted || isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Discussion Forums"
        description="Connect with peers, ask questions, and share knowledge."
        icon={MessageSquare}
      >
        {/* Optional: Button to go back or create new forum (if applicable) */}
        {/* <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button> */}
      </DashboardHeader>

      <div className="space-y-6">
        {isLoadingForums ? (
          <Card>
            <CardContent className="p-6 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            </CardContent>
          </Card>
        ) : forums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forums.map((forum) => (
              // Replace with ForumCard component when created
              <Card key={forum.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/student-hub/discussion/forum/${forum.id}`)}>
                <CardHeader>
                  <CardTitle className="text-lg">{forum.title}</CardTitle>
                  <CardDescription>{forum.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-500">
                  {forum.thread_count !== undefined && <p>Threads: {forum.thread_count}</p>}
                  {forum.post_count !== undefined && <p>Posts: {forum.post_count}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-700">No Forums Available</h3>
              <p className="text-slate-500 mt-1">
                Check back later or contact support if you believe this is an error.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}