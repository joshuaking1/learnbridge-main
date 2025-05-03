\"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, ArrowLeft, Send, PlusCircle } from "lucide-react";
import { discussionService } from "@/services/discussionService";

export default function NewThreadPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);

  const forumId = params.forumId as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forumTitle, setForumTitle] = useState("Forum"); // Placeholder

  useEffect(() => {
    setHasMounted(true);
    // TODO: Fetch forum title based on forumId to display in header
    // For now, just use the ID
    if (forumId) {
      setForumTitle(`Forum ${forumId}`);
    }
  }, [forumId]);

  useEffect(() => {
    if (hasMounted && !isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasMounted, isLoadingAuth, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !token || !forumId) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      // const newThread = await discussionService.createThread(token, forumId, { title, content });

      // Mock success and redirect
      toast({ title: "Thread Created", description: "Your new thread has been posted." });
      // Redirect to the newly created thread (need its ID from backend)
      // For now, redirect back to the forum
      router.push(`/dashboard/student-hub/discussion/forum/${forumId}`);

    } catch (error) {
      console.error("Error creating thread:", error);
      toast({ title: "Error", description: "Failed to create thread. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        heading={`New Thread in ${forumTitle}`}
        description="Start a new discussion topic."
        icon={PlusCircle}
      >
        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/student-hub/discussion/forum/${forumId}`)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Forum
        </Button>
      </DashboardHeader>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Create New Thread</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Thread Title</label>
              <Input
                id="title"
                placeholder="Enter a clear and concise title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Your Post</label>
              <Textarea
                id="content"
                placeholder="Write the content of your first post..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                required
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Create Thread
            </Button>
          </CardFooter>
        </form>
      </Card>
    </DashboardShell>
  );
}