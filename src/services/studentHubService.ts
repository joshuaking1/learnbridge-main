import axios from 'axios';
import { getAuthToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Types for student hub data
export interface LearningProgress {
  learning_path_id: string;
  learning_path_title: string;
  learning_path_description: string;
  progress_percentage: number;
  last_accessed: string;
  completed_modules: number;
  total_modules: number;
}

export interface StudentActivity {
  activity_type: string;
  activity_data: any;
  created_at: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon_url: string;
  earned_at: string;
}

// API functions
export const getStudentProgress = async (): Promise<LearningProgress[]> => {
  const token = getAuthToken();
  const response = await axios.get(`${API_BASE_URL}/api/users/student/progress`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getRecentActivities = async (): Promise<StudentActivity[]> => {
  const token = getAuthToken();
  const response = await axios.get(`${API_BASE_URL}/api/users/student/recent-activities`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getAchievements = async (): Promise<Achievement[]> => {
  const token = getAuthToken();
  const response = await axios.get(`${API_BASE_URL}/api/users/student/achievements`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateProgress = async (
  learningPathId: string,
  progressPercentage: number,
  completedModules: number,
  totalModules: number
): Promise<LearningProgress> => {
  const token = getAuthToken();
  const response = await axios.post(
    `${API_BASE_URL}/api/users/student/progress/update`,
    {
      learningPathId,
      progressPercentage,
      completedModules,
      totalModules
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}; 