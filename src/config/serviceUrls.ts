/**
 * Service URLs configuration for LearnBridge
 * This file centralizes all service URLs used in the application
 */

// User Service
export const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'https://user-service-3j2j.onrender.com';

// AI Service
export const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'https://learnbridge-ai-service.onrender.com';

// Teacher Tools Service
export const TEACHER_TOOLS_SERVICE_URL = process.env.NEXT_PUBLIC_TEACHER_TOOLS_SERVICE_URL || 'https://learnbridge-teacher-tools-service.onrender.com';

// Quiz Service
export const QUIZ_SERVICE_URL = process.env.NEXT_PUBLIC_QUIZ_SERVICE_URL || 'https://learnbridgedu.onrender.com';

// Learning Path Service
export const LEARNING_PATH_SERVICE_URL = process.env.NEXT_PUBLIC_LEARNING_PATH_SERVICE_URL || 'https://learnbridge-teacher-tools-service.onrender.com';

// Notification Service
export const NOTIFICATION_SERVICE_URL = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'https://user-service-3j2j.onrender.com';

// Content Service
export const CONTENT_SERVICE_URL = process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || 'https://learnbridge-ai-service.onrender.com';

// Helper function to get API URL with path
export const getApiUrl = (baseUrl: string, path: string) => {
  // Remove trailing slash from baseUrl if present
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${cleanBaseUrl}/${cleanPath}`;
};
