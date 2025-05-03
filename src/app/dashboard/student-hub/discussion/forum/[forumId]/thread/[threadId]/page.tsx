\"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, ArrowLeft, Send, UserCircle } from "lucide-react";
import { discussionService } from "@/services/discussionService";
// import { PostItem } from "@/components/discussion/PostItem"; // Placeholder

// Placeholder types
interface Thread {
  id: number;
  title: string;
  author_name: string;
  created_at: string;
  content: string; // Content of the initial post
}

interface Post {
  id: number;
  author_name: string;
  created_at: string;
  content: string;
}

export default function ThreadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);

  const forumId = params.forumId as string;
  const threadId = params.threadId as string;

  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasMounted, isLoadingAuth, isAuthenticated, router]);

  const fetchThreadData = async () => {
    if (!token || !forumId || !threadId) return;
    setIsLoading(true);
    try {
      // TODO: Replace with actual API calls when backend is ready
      // const fetchedThread = await discussionService.getThreadById(token, forumId, threadId);
      // const fetchedPosts = await discussionService.getPostsByThread(token, forumId, threadId);

      // Mock data for now:
      const mockThread: Thread = {
        id: parseInt(threadId),
        title: `Thread ${threadId} Title`,
        author_name: "Student A",
        created_at: "2023-10-27T09:15:00Z",
        content: "This is the initial content of the thread. Asking about how to use the platform effectively."
      };
      const mockPosts: Post[] = [
        { id: 1, author_name: "Student B", created_at: "2023-10-27T10:00:00Z", content: "Good question! I found the tutorials section helpful." },
        { id: 2, author_name: "Instructor", created_at: "2023-10-27T10:30:00Z", content: "Welcome! Check out the 'Getting Started' guide linked in the main dashboard." },
        { id: 3, author_name: "Student A", created_at: "2023-10-27T11:00:00Z", content: "Thanks both! I'll take a look." },
      ];

      setThread(mockThread);
      setPosts(mockPosts);
    } catch (error) {
      console.error("Error fetching thread details:", error);
      toast({
        title: "Error",
        description: "Failed to load thread details. Please try again later.",
        variant: "destructive"
      });
      // router.push(`/dashboard/student-hub/discussion/forum/${forumId}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasMounted && isAuthenticated && token && forumId && threadId) {
      fetchThreadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMounted, isAuthenticated, token, forumId, threadId]); // Removed toast, router

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !token || !forumId || !threadId) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      // const newPost = await discussionService.createPost(token, forumId, threadId, { content: replyContent });

      // Mock adding post locally
      const newPost: Post = {
        id: Date.now(), // Temporary ID
        author_name: user?.username || "You", // Use logged-in user's name
        created_at: new Date().toISOString(),
        content: replyContent,
      };
      setPosts([...posts, newPost]);
      setReplyContent(""); // Clear the textarea

      toast({ title: "Reply Posted", description: "Your reply has been added to the thread." });

    } catch (error) {
      console.error("Error posting reply:", error);
      toast({ title: "Error", description: "Failed to post reply. Please try again.", variant: "destructive" });
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
        heading={thread ? thread.title : "Thread"}
        description={`Started by ${thread?.author_name || '...'} on ${thread ? new Date(thread.created_at).toLocaleDateString() : '...'}`}
        icon={MessageSquare}
      >
        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/student-hub/discussion/forum/${forumId}`)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Forum
        </Button>
      </DashboardHeader>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
          </CardContent>
        </Card>
      ) : !thread ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p>Thread not found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Initial Post */}
          <Card>
            <CardHeader className="flex flex-row items-start space-x-3 pb-3">
              <UserCircle className="h-8 w-8 text-slate-400" />
              <div>
                <p className="font-semibold text-slate-800">{thread.author_name}</p>
                <p className="text-xs text-slate-500">Posted on {new Date(thread.created_at).toLocaleString()}</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{thread.content}</p>
            </CardContent>
          </Card>

          {/* Replies */}
          <h3 className="text-lg font-semibold text-slate-700">Replies ({posts.length})</h3>
          <div className="space-y-4">
            {posts.map((post) => (
              // Replace with PostItem component when created
              <Card key={post.id}>
                 <CardHeader className="flex flex-row items-start space-x-3 pb-3">
                  <UserCircle className="h-8 w-8 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-800">{post.author_name}</p>
                    <p className="text-xs text-slate-500">Posted on {new Date(post.created_at).toLocaleString()}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reply Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post a Reply</CardTitle>
            </CardHeader>
            <form onSubmit={handleReplySubmit}>
              <CardContent>
                <Textarea
                  placeholder="Write your reply here..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  required
                  disabled={isSubmitting}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting || !replyContent.trim()}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Post Reply
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}