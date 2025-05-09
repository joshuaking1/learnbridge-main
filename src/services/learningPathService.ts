// Learning Path API Service
import { 
  LearningPath, 
  Skill, 
  Achievement, 
  ProgressSummary, 
  SubjectProgress,
  PointsHistory,
  Recommendation
} from '@/types/learning-path';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/learning-paths' 
  : 'https://learnbridge-teacher-tools-service.onrender.com/api/learning-paths';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }
  return response.json();
};

// Learning Path API functions
export const learningPathService = {
  // Get all learning paths
  getAllPaths: async (token: string, filters?: { subject?: string, grade?: string, difficulty?: string }): Promise<LearningPath[]> => {
    let url = API_BASE_URL;
    
    // Add query parameters if filters are provided
    if (filters) {
      const params = new URLSearchParams();
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Get learning path by ID
  getPathById: async (token: string, pathId: number): Promise<LearningPath> => {
    const response = await fetch(`${API_BASE_URL}/${pathId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Start learning path
  startPath: async (token: string, pathId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/${pathId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },
  
  // Update learning path progress
  updatePathProgress: async (token: string, pathId: number, progress: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/${pathId}/progress`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ progress_percentage: progress })
    });
    
    return handleResponse(response);
  },
  
  // Get skills for a learning path
  getSkillsForPath: async (token: string, pathId: number): Promise<Skill[]> => {
    const response = await fetch(`${API_BASE_URL}/skills?learning_path_id=${pathId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Get skill by ID
  getSkillById: async (token: string, skillId: number): Promise<Skill> => {
    const response = await fetch(`${API_BASE_URL}/skills/${skillId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Start skill
  startSkill: async (token: string, skillId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/skills/${skillId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },
  
  // Complete skill
  completeSkill: async (token: string, skillId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/skills/${skillId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },
  
  // Update skill progress
  updateSkillProgress: async (token: string, skillId: number, progress: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/skills/${skillId}/progress`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ progress_percentage: progress })
    });
    
    return handleResponse(response);
  },
  
  // Get all achievements
  getAllAchievements: async (token: string): Promise<Achievement[]> => {
    const response = await fetch(`${API_BASE_URL}/achievements`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Get achievement by ID
  getAchievementById: async (token: string, achievementId: number): Promise<Achievement> => {
    const response = await fetch(`${API_BASE_URL}/achievements/${achievementId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Unlock achievement
  unlockAchievement: async (token: string, achievementId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/achievements/${achievementId}/unlock`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },
  
  // Check achievement progress
  checkAchievementProgress: async (token: string, achievementId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/achievements/${achievementId}/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Get progress summary
  getProgressSummary: async (token: string): Promise<ProgressSummary> => {
    const response = await fetch(`${API_BASE_URL}/progress/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Get subject progress
  getSubjectProgress: async (token: string): Promise<SubjectProgress[]> => {
    const response = await fetch(`${API_BASE_URL}/progress/subjects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Get activity timeline
  getActivityTimeline: async (token: string, limit: number = 20, offset: number = 0): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/progress/timeline?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Get points history
  getPointsHistory: async (token: string): Promise<PointsHistory> => {
    const response = await fetch(`${API_BASE_URL}/progress/points`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Get recommendations
  getRecommendations: async (token: string): Promise<Recommendation[]> => {
    const response = await fetch(`${API_BASE_URL}/recommendations`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  },
  
  // Dismiss recommendation
  dismissRecommendation: async (token: string, recommendationId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/recommendations/${recommendationId}/dismiss`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },
  
  // Refresh recommendations
  refreshRecommendations: async (token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/recommendations/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },
  
  // Get usage limits
  getUsageLimits: async (token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/limits`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};
