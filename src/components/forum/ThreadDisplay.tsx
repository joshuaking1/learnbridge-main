// src/components/forum/ThreadDisplay.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { enhancedForumService, Thread, Post } from '@/services/enhancedForumService';
import { forumBotService } from '@/services/forumBotService';
import RichTextEditor from './RichTextEditor';
import ThreadSummary from './ThreadSummary';
import PostItem from './PostItem';
import ThreadTags from './ThreadTags';

interface Props {
  threadId: string;
  initialThread?: Thread;
  initialPosts?: Post[];
}

const ThreadDisplay: React.FC<Props> = ({ threadId, initialThread, initialPosts }) => {
  const [thread, setThread] = useState<Thread | undefined>(initialThread);
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const { token, getToken, user } = useAuth();
  const router = useRouter();
  const limit = 20;

  useEffect(() => {
    if (!initialThread || !initialPosts) {
      loadThreadAndPosts();
    } else {
      setThread(initialThread);
      setPosts(initialPosts);
    }
  }, [threadId]);

  useEffect(() => {
    if (thread) {
      checkIfFollowing();
    }
  }, [thread, user]);

  const loadThreadAndPosts = async () => {
    try {
      const t = await getToken();
      if (!t) return;

      const [threadData, postsData] = await Promise.all([
        enhancedForumService.getThreadById(t, threadId),
        enhancedForumService.getPostsByThread(t, threadId, page, limit)
      ]);

      setThread(threadData);
      setPosts(postsData.posts);
      setHasMore(postsData.posts.length === limit);
    } catch (error) {
      console.error('Error loading thread:', error);
    }
  };

  const loadMorePosts = async () => {
    try {
      const t = await getToken();
      if (!t) return;

      const nextPage = page + 1;
      const postsData = await enhancedForumService.getPostsByThread(t, threadId, nextPage, limit);

      setPosts(prev => [...prev, ...postsData.posts]);
      setPage(nextPage);
      setHasMore(postsData.posts.length === limit);
    } catch (error) {
      console.error('Error loading more posts:', error);
    }
  };

  const handleSubmitPost = async () => {
    if (!newPostContent.trim()) return;

    setIsSubmitting(true);
    try {
      const t = await getToken();
      if (!t) {
        setIsSubmitting(false);
        return;
      }

      const newPost = await enhancedForumService.createPost(t, threadId, { 
        content: newPostContent 
      });

      setPosts(prev => [...prev, newPost]);
      setNewPostContent('');
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('Failed to submit your post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvotePost = async (postId: string) => {
    try {
      const t = await getToken();
      if (!t) return;

      await enhancedForumService.upvotePost(t, postId);
      
      // Update local state
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, upvotes: post.upvotes + 1 } 
            : post
        )
      );
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };

  const handleMarkAsSolution = async (postId: string) => {
    try {
      const t = await getToken();
      if (!t) return;

      await enhancedForumService.markPostAsSolution(t, threadId, postId);
      
      // Update local state for thread
      setThread(prev => prev ? { ...prev, isAnswered: true } : prev);
      
      // Update local state for posts
      setPosts(prev => 
        prev.map(post => ({
          ...post,
          isSolution: post.id === postId
        }))
      );
    } catch (error) {
      console.error('Error marking as solution:', error);
    }
  };

  const handleGenerateSummary = async () => {
    if (!thread?.aiSummary && !isSummarizing) {
      setIsSummarizing(true);
      try {
        const t = await getToken();
        if (!t) {
          setIsSummarizing(false);
          return;
        }

        const summary = await forumBotService.summarizeThread(t, threadId);
        
        // Update thread with summary
        setThread(prev => 
          prev ? { ...prev, aiSummary: summary.summary } : prev
        );
      } catch (error) {
        console.error('Error generating summary:', error);
      } finally {
        setIsSummarizing(false);
      }
    }
  };

  const checkIfFollowing = () => {
    if (thread && user && thread.followedBy) {
      setIsFollowing(thread.followedBy.includes(user.id));
    }
  };

  const handleToggleFollow = async () => {
    try {
      const t = await getToken();
      if (!t) return;

      if (isFollowing) {
        await enhancedForumService.unfollowThread(t, threadId);
        setIsFollowing(false);
      } else {
        await enhancedForumService.followThread(t, threadId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  if (!thread) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading thread...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Thread Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">{thread.title}</h1>
          <div className="flex space-x-2">
            <button
              onClick={handleToggleFollow}
              className={`flex items-center px-3 py-1 rounded-full text-sm ${isFollowing ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${isFollowing ? 'text-blue-600' : 'text-gray-600'}`} viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center mt-3 text-sm text-gray-500">
          <span>Posted by {thread.authorId}</span>
          <span className="mx-2">•</span>
          <span>{format(new Date(thread.createdAt), 'MMM d, yyyy')}</span>
          {thread.isAnswered && (
            <>
              <span className="mx-2">•</span>
              <span className="text-green-600 font-medium">Answered</span>
            </>
          )}
        </div>
        
        <ThreadTags tags={thread.tags} />

        {/* AI Summary (if available) */}
        {(thread.aiSummary || isSummarizing) && (
          <ThreadSummary 
            summary={thread.aiSummary} 
            isLoading={isSummarizing} 
          />
        )}
      </div>

      {/* Thread Content */}
      <div className="p-6 border-b">
        <div dangerouslySetInnerHTML={{ __html: thread.content }} />
      </div>

      {/* Generate Summary Button (if not already available) */}
      {!thread.aiSummary && !isSummarizing && (
        <div className="px-6 py-3 border-b bg-gray-50">
          <button
            onClick={handleGenerateSummary}
            className="text-sm flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Generate AI Summary
          </button>
        </div>
      )}

      {/* Posts */}
      <div className="divide-y">
        {posts.map(post => (
          <PostItem
            key={post.id}
            post={post}
            onUpvote={() => handleUpvotePost(post.id)}
            onMarkAsSolution={() => handleMarkAsSolution(post.id)}
            canMarkSolution={!thread.isAnswered && thread.authorId === user?.id}
            threadLocked={thread.isLocked}
          />
        ))}

        {hasMore && (
          <div className="p-4 text-center">
            <button
              onClick={loadMorePosts}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Load More Replies
            </button>
          </div>
        )}
      </div>

      {/* Reply Form (if thread not locked) */}
      {!thread.isLocked && (
        <div className="p-6 bg-gray-50">
          <h3 className="text-lg font-medium mb-3">Your Reply</h3>
          <RichTextEditor
            initialValue={newPostContent}
            onChange={setNewPostContent}
            placeholder="Write your reply here..."
            minHeight="150px"
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleSubmitPost}
              disabled={isSubmitting || !newPostContent.trim()}
              className={`px-4 py-2 rounded-md ${isSubmitting || !newPostContent.trim() 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      )}

      {thread.isLocked && (
        <div className="p-6 bg-gray-50 text-center">
          <div className="inline-block bg-yellow-50 border border-yellow-200 rounded-md px-4 py-3 text-yellow-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            This thread has been locked. No new replies can be added.
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadDisplay;
