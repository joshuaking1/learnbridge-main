import { useState, useEffect } from 'react';
import { 
  getStudentProgress, 
  getRecentActivities, 
  getAchievements, 
  updateProgress,
  LearningProgress,
  StudentActivity,
  Achievement
} from '@/services/studentHubService';

export const useStudentHub = () => {
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all student hub data
  const fetchStudentHubData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [progressData, activitiesData, achievementsData] = await Promise.all([
        getStudentProgress(),
        getRecentActivities(),
        getAchievements()
      ]);
      
      setProgress(progressData);
      setActivities(activitiesData);
      setAchievements(achievementsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student hub data');
    } finally {
      setLoading(false);
    }
  };

  // Update learning progress
  const handleProgressUpdate = async (
    learningPathId: string,
    progressPercentage: number,
    completedModules: number,
    totalModules: number
  ) => {
    try {
      setError(null);
      const updatedProgress = await updateProgress(
        learningPathId,
        progressPercentage,
        completedModules,
        totalModules
      );
      
      // Update the progress in the state
      setProgress(prevProgress => 
        prevProgress.map(p => 
          p.learning_path_id === learningPathId ? updatedProgress : p
        )
      );
      
      // Refresh activities to show the new progress update
      const newActivities = await getRecentActivities();
      setActivities(newActivities);
      
      return updatedProgress;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
      throw err;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStudentHubData();
  }, []);

  return {
    progress,
    activities,
    achievements,
    loading,
    error,
    refreshData: fetchStudentHubData,
    updateProgress: handleProgressUpdate
  };
}; 