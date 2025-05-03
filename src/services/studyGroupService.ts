import axios from 'axios';
import { getAuthToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Types for study group data
export interface StudyGroupMember {
  id: number;
  name: string;
  avatar: string;
  role: 'leader' | 'member';
}

export interface StudyGroup {
  id: number;
  name: string;
  subject: string;
  members: StudyGroupMember[];
  meetingTime?: string;
}

// API functions
export const studyGroupService = {
  // Get all study groups
  getAllGroups: async (): Promise<StudyGroup[]> => {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/api/study-groups`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Create a new study group
  createGroup: async (data: { name: string; subject: string }): Promise<StudyGroup> => {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/api/study-groups`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  // Join a study group
  joinGroup: async (groupId: number): Promise<StudyGroup> => {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_BASE_URL}/api/study-groups/${groupId}/join`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  // Leave a study group
  leaveGroup: async (groupId: number): Promise<void> => {
    const token = getAuthToken();
    await axios.post(
      `${API_BASE_URL}/api/study-groups/${groupId}/leave`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  },

  // Update study group meeting time
  updateMeetingTime: async (groupId: number, meetingTime: string): Promise<StudyGroup> => {
    const token = getAuthToken();
    const response = await axios.patch(
      `${API_BASE_URL}/api/study-groups/${groupId}/meeting-time`,
      { meetingTime },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }
}; 