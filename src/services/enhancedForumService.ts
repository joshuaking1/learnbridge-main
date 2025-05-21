// src/services/enhancedForumService.ts
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_DISCUSSION_SERVICE_URL || 'https://learnbridgedu.onrender.com/api';
const MEDIA_API_URL = process.env.NEXT_PUBLIC_MEDIA_SERVICE_URL || 'https://media.learnbridgedu.onrender.com/api';

// Types
interface ForumCategory {
  id: string;
  name: string;
  description: string;
  type: 'subject' | 'grade_level' | 'topic';
  levelTag?: string; // "JHS", "SHS", etc.
  subjectTag?: string; // "Algebra", "Creative Arts", etc.
  parentCategoryId?: string; // For hierarchical organization
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Thread {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  authorId: string;
  isPinned: boolean;
  isLocked: boolean;
  isAnswered: boolean;
  needsReview: boolean;
  tags: string[];
  views: number;
  followedBy: string[];
  accessibility: {
    isPrivate: boolean;
    allowedUsers: string[];
  };
  aiSummary?: string;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  id: string;
  threadId: string;
  content: string;
  authorId: string;
  isSolution: boolean;
  upvotes: number;
  reports: {
    userId: string;
    reason: string;
    timestamp: string;
  }[];
  attachments: {
    type: 'image' | 'document' | 'video';
    url: string;
    name: string;
  }[];
  createdAt: string;
  updatedAt: string;
  editHistory: {
    content: string;
    timestamp: string;
  }[];
}

interface MediaUploadResponse {
  url: string;
  key: string;
  type: string;
}

const enhancedForumService = {
  // == Categories ==
  async getAllCategories(token: string) {
    const response = await axios.get(`${API_URL}/forum-categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getCategoryById(token: string, categoryId: string) {
    const response = await axios.get(`${API_URL}/forum-categories/${categoryId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async createCategory(token: string, data: Partial<ForumCategory>) {
    const response = await axios.post(`${API_URL}/forum-categories`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // == Threads ==
  async getThreadsByCategory(token: string, categoryId: string, filters?: {
    tags?: string[];
    answered?: boolean;
    page?: number;
    limit?: number;
  }) {
    const response = await axios.get(`${API_URL}/forum-categories/${categoryId}/threads`, {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    });
    return response.data;
  },

  async getThreadById(token: string, threadId: string) {
    const response = await axios.get(`${API_URL}/threads/${threadId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async createThread(token: string, categoryId: string, data: {
    title: string;
    content: string;
    tags?: string[];
    accessibility?: {
      isPrivate: boolean;
      allowedUsers: string[];
    };
  }) {
    const response = await axios.post(`${API_URL}/forum-categories/${categoryId}/threads`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updateThread(token: string, threadId: string, data: Partial<Thread>) {
    const response = await axios.patch(`${API_URL}/threads/${threadId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async pinThread(token: string, threadId: string, isPinned: boolean) {
    return this.updateThread(token, threadId, { isPinned });
  },

  async lockThread(token: string, threadId: string, isLocked: boolean) {
    return this.updateThread(token, threadId, { isLocked });
  },

  async markThreadAsAnswered(token: string, threadId: string, isAnswered: boolean) {
    return this.updateThread(token, threadId, { isAnswered });
  },

  async flagThreadForReview(token: string, threadId: string, needsReview: boolean) {
    return this.updateThread(token, threadId, { needsReview });
  },

  async followThread(token: string, threadId: string) {
    const response = await axios.post(`${API_URL}/threads/${threadId}/follow`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async unfollowThread(token: string, threadId: string) {
    const response = await axios.delete(`${API_URL}/threads/${threadId}/follow`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // == Posts ==
  async getPostsByThread(token: string, threadId: string, page = 1, limit = 20) {
    const response = await axios.get(`${API_URL}/threads/${threadId}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, limit },
    });
    return response.data;
  },

  async createPost(token: string, threadId: string, data: {
    content: string;
    attachments?: {
      type: 'image' | 'document' | 'video';
      url: string;
      name: string;
    }[];
  }) {
    const response = await axios.post(`${API_URL}/threads/${threadId}/posts`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updatePost(token: string, postId: string, data: {
    content: string;
    attachments?: {
      type: 'image' | 'document' | 'video';
      url: string;
      name: string;
    }[];
  }) {
    const response = await axios.patch(`${API_URL}/posts/${postId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async markPostAsSolution(token: string, threadId: string, postId: string) {
    const response = await axios.post(`${API_URL}/threads/${threadId}/solution`, { postId }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async upvotePost(token: string, postId: string) {
    const response = await axios.post(`${API_URL}/posts/${postId}/upvote`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async reportPost(token: string, postId: string, reason: string) {
    const response = await axios.post(`${API_URL}/posts/${postId}/report`, { reason }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // == Media Upload ==
  async uploadMedia(token: string, file: File): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${MEDIA_API_URL}/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // == Search ==
  async searchForums(token: string, query: string, filters?: {
    categories?: string[];
    tags?: string[];
    author?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await axios.get(`${API_URL}/search/forums`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q: query,
        ...filters,
      },
    });
    return response.data;
  },

  // == AI Features ==
  async summarizeThread(token: string, threadId: string) {
    const response = await axios.post(`${API_URL}/threads/${threadId}/summarize`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getRelatedThreads(token: string, threadId: string) {
    const response = await axios.get(`${API_URL}/threads/${threadId}/related`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async askForumBot(token: string, question: string, threadId?: string) {
    const response = await axios.post(`${API_URL}/forum-bot/ask`, {
      question,
      threadId, // Optional context
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // == Moderation ==
  async getReportedContent(token: string, status = 'pending') {
    const response = await axios.get(`${API_URL}/moderation/reports`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { status },
    });
    return response.data;
  },

  async resolveReport(token: string, reportId: string, action: 'approve' | 'remove' | 'warn') {
    const response = await axios.post(`${API_URL}/moderation/reports/${reportId}/resolve`, {
      action,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // == Offline Sync ==
  async syncOfflineContent(token: string, offlineData: {
    posts: any[];
    replies: any[];
    edits: any[];
  }) {
    const response = await axios.post(`${API_URL}/sync/offline`, offlineData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // == Notification Preferences ==
  async updateNotificationPreferences(token: string, preferences: {
    email: boolean;
    inApp: boolean;
    threadFollows: boolean;
  }) {
    const response = await axios.patch(`${API_URL}/users/notification-preferences`, preferences, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // == Gamification ==
  async getUserPoints(token: string, userId?: string) {
    const response = await axios.get(`${API_URL}/gamification/points${userId ? `/${userId}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async getLeaderboard(token: string, timeframe: 'weekly' | 'monthly' | 'alltime' = 'weekly', limit = 10) {
    const response = await axios.get(`${API_URL}/gamification/leaderboard`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { timeframe, limit },
    });
    return response.data;
  },

  async getUserBadges(token: string, userId?: string) {
    const response = await axios.get(`${API_URL}/gamification/badges${userId ? `/${userId}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export { enhancedForumService };
export type { ForumCategory, Thread, Post, MediaUploadResponse };
