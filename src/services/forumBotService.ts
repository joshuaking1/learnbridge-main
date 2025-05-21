// src/services/forumBotService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'https://ai.learnbridgedu.onrender.com/api';

interface BotResponse {
  answer: string;
  source?: string;
  type: 'direct' | 'generated';
  followUpPrompts?: string[];
  confidence?: number;
}

interface ThreadSummary {
  summary: string;
  keyPoints: string[];
  participants: number;
  topContributors: string[];
}

interface ContentModerationResult {
  isApproved: boolean;
  flags: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    text: string;
  }[];
  suggestions: string[];
  score: number;
}

interface SuggestedTags {
  tags: string[];
  confidence: number;
}

const forumBotService = {
  async askQuestion(token: string, question: string, context?: {
    threadId?: string;
    categoryId?: string;
    previousMessages?: { role: 'user' | 'bot'; content: string }[];
  }): Promise<BotResponse> {
    const response = await axios.post(`${API_URL}/bot/ask`, {
      question,
      context
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async summarizeThread(token: string, threadId: string): Promise<ThreadSummary> {
    const response = await axios.post(`${API_URL}/bot/summarize`, {
      threadId
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async moderateContent(token: string, content: string): Promise<ContentModerationResult> {
    const response = await axios.post(`${API_URL}/bot/moderate`, {
      content
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async suggestTags(token: string, content: string): Promise<SuggestedTags> {
    const response = await axios.post(`${API_URL}/bot/suggest-tags`, {
      content
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async transcribeSpeech(token: string, audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await axios.post(`${API_URL}/bot/transcribe`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.text;
  },

  async detectMisconceptions(token: string, threadId: string): Promise<{
    misconceptions: { text: string; correction: string; confidence: number }[];
  }> {
    const response = await axios.post(`${API_URL}/bot/misconceptions`, {
      threadId
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async generateFollowUpQuestions(token: string, threadId: string): Promise<{
    questions: string[];
  }> {
    const response = await axios.post(`${API_URL}/bot/follow-up-questions`, {
      threadId
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
};

export { forumBotService };
export type { BotResponse, ThreadSummary, ContentModerationResult, SuggestedTags };
