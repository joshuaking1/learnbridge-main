import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://user-service-3j2j.onrender.com/api';
let socket: Socket | null = null;

export interface ClassroomData {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  participants: Participant[];
  breakoutRooms: BreakoutRoom[];
  resources: Resource[];
  messages: Message[];
  isActive: boolean;
}

export interface Participant {
  userId: string;
  name: string;
  role: 'teacher' | 'student';
  status: 'online' | 'offline';
  isSpeaking: boolean;
  isHandRaised: boolean;
}

export interface BreakoutRoom {
  id: string;
  name: string;
  participants: string[];
  isActive: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'link';
  url: string;
  date: Date;
  size?: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  isTeacher: boolean;
}

export const classroomService = {
  // Socket.IO connection
  connectSocket(): Socket {
    if (!socket) {
      socket = io(API_URL.replace('/api', ''));
    }
    return socket;
  },

  disconnectSocket() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  // REST API calls
  async createClassroom(data: { name: string; description: string; teacherId: string; teacherName: string }): Promise<ClassroomData> {
    const response = await fetch(`${API_URL}/classrooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create classroom');
    return response.json();
  },

  async getClassroom(id: string): Promise<ClassroomData> {
    const response = await fetch(`${API_URL}/classrooms/${id}`);
    if (!response.ok) throw new Error('Failed to get classroom');
    return response.json();
  },

  async joinClassroom(id: string, data: { userId: string; userName: string; role: 'teacher' | 'student' }): Promise<ClassroomData> {
    const response = await fetch(`${API_URL}/classrooms/${id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to join classroom');
    return response.json();
  },

  async leaveClassroom(id: string, userId: string): Promise<ClassroomData> {
    const response = await fetch(`${API_URL}/classrooms/${id}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!response.ok) throw new Error('Failed to leave classroom');
    return response.json();
  },

  async createBreakoutRoom(id: string, name: string): Promise<ClassroomData> {
    const response = await fetch(`${API_URL}/classrooms/${id}/breakout-rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!response.ok) throw new Error('Failed to create breakout room');
    return response.json();
  },

  async toggleBreakoutRoom(classroomId: string, roomId: string): Promise<ClassroomData> {
    const response = await fetch(`${API_URL}/classrooms/${classroomId}/breakout-rooms/${roomId}/toggle`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to toggle breakout room');
    return response.json();
  },

  async addMessage(id: string, data: { userId: string; userName: string; content: string; isTeacher: boolean }): Promise<ClassroomData> {
    const response = await fetch(`${API_URL}/classrooms/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add message');
    return response.json();
  },

  async addResource(id: string, data: { title: string; type: 'document' | 'video' | 'link'; url: string; size?: string }): Promise<ClassroomData> {
    const response = await fetch(`${API_URL}/classrooms/${id}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add resource');
    return response.json();
  },

  async updateParticipantStatus(
    id: string,
    data: { userId: string; status?: 'online' | 'offline'; isSpeaking?: boolean; isHandRaised?: boolean }
  ): Promise<ClassroomData> {
    const response = await fetch(`${API_URL}/classrooms/${id}/participant-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update participant status');
    return response.json();
  }
};