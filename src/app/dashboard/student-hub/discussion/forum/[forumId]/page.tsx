"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, PlusCircle, ArrowLeft, List } from "lucide-react";
import { discussionService } from "@/services/discussionService";
// import { ThreadListItem } from "@/components/discussion/ThreadListItem"; // Placeholder

// Placeholder types
interface Forum {
  id: number;
  title: string;
  description: string;
}

interface Thread {
  id: number;
  title: string;
  author_name: string;
  created_at: string;
  reply_count: number;
  last_reply_at?: string;
}

export default function ForumDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);

  const forumId = params.forumId as string;

  const [forum, setForum] = useState<Forum | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasMounted, isLoadingAuth, isAuthenticated, router]);

  useEffect(() => {
    if (hasMounted && isAuthenticated && token && forumId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // TODO: Replace with actual API calls when backend is ready
          // const fetchedForum = await discussionService.getForumById(token, forumId);
          // const fetchedThreads = await discussionService.getThreadsByForum(token, forumId);

          // Mock data for now:
          const mockForum: Forum = { id: parseInt(forumId), title: `Forum ${forumId}`, description: `Description for forum ${forumId}` };
          const mockThreads: Thread[] = [
            { id: 1, title: "Welcome to the forum!", author_name: "Admin", created_at: "2023-10-26T10:00:00Z", reply_count: 5, last_reply_at: "2023-10-27T11:30:00Z" },
            { id: 2, title: "How to use the platform?", author_name: "Student A", created_at: "2023-10-27T09:15:00Z", reply_count: 10 },
            { id: 3, title: "Introduce yourself", author_name: "Student B", created_at: "2023-10-28T14:00:00Z", reply_count: 2 },
          ];

          setForum(mockForum);
          setThreads(mockThreads);
        } catch (error) {
          console.error("Error fetching forum details:", error);
          toast({ 
            title: "Error", 
            description: "Failed to load forum details. Please try again later.", 
            variant: "destructive" 
          });
          // Optionally redirect back or show an error state
          // router.push('/dashboard/student-hub/discussion');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [hasMounted, isAuthenticated, token, forumId, toast, router]);

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
        heading={forum ? forum.title : "Forum"}
        description={forum ? forum.description : "Loading forum details..."}
        icon={MessageSquare}
      >
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/student-hub/discussion')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Forums
        </Button>
        <Button size="sm" onClick={() => router.push(`/dashboard/student-hub/discussion/forum/${forumId}/new-thread`)}>
          <PlusCircle className="h-4 w-4 mr-1" />
          New Thread
        </Button>
      </DashboardHeader>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            </CardContent>
          </Card>
        ) : threads.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <List className="h-5 w-5 mr-2" />
                Threads
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {threads.map((thread) => (
                // Replace with ThreadListItem component when created
                <div key={thread.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/student-hub/discussion/forum/${forumId}/thread/${thread.id}`)}>
                  <div>
                    <p className="font-medium text-slate-800">{thread.title}</p>
                    <p className="text-xs text-slate-500">
                      Started by {thread.author_name} - {new Date(thread.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>{thread.reply_count} replies</p>
                    {thread.last_reply_at && <p>Last reply: {new Date(thread.last_reply_at).toLocaleDateString()}</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-700">No Threads Yet</h3>
              <p className="text-slate-500 mt-1">
                Be the first to start a discussion!
              </p>
              <Button size="sm" className="mt-4" onClick={() => router.push(`/dashboard/student-hub/discussion/forum/${forumId}/new-thread`)}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Create New Thread
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}