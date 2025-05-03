// frontend/src/services/discussionService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_DISCUSSION_SERVICE_URL || 'https://learnbridgedu.onrender.com/api'; // Production URL

const discussionService = {
  // == Forums ==
  async getAllForums(token: string) {
    const response = await axios.get(`${API_URL}/forums`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Assuming the backend returns an array of forums
  },

  async getForumById(token: string, forumId: number | string) {
    const response = await axios.get(`${API_URL}/forums/${forumId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Assuming the backend returns a single forum object
  },

  // == Threads ==
  async getThreadsByForum(token: string, forumId: number | string) {
    const response = await axios.get(`${API_URL}/forums/${forumId}/threads`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Assuming the backend returns an array of threads
  },

  async getThreadById(token: string, forumId: number | string, threadId: number | string) {
    const response = await axios.get(`${API_URL}/forums/${forumId}/threads/${threadId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Assuming the backend returns a single thread object
  },

  async createThread(token: string, forumId: number | string, data: { title: string; content: string }) {
    const response = await axios.post(`${API_URL}/forums/${forumId}/threads`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // == Posts ==
  async getPostsByThread(token: string, forumId: number | string, threadId: number | string) {
    const response = await axios.get(`${API_URL}/forums/${forumId}/threads/${threadId}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Assuming the backend returns an array of posts
  },

  async createPost(token: string, forumId: number | string, threadId: number | string, data: { content: string }) {
    const response = await axios.post(`${API_URL}/forums/${forumId}/threads/${threadId}/posts`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Add other methods as needed (edit post, delete post, etc.)
};

export { discussionService };