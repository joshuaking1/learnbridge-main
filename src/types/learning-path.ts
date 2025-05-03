// Types for Learning Path feature

// Learning Path
export interface LearningPath {
  id: number;
  title: string;
  description: string | null;
  subject: string;
  grade_level: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number | null;
  is_active: boolean;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string | null;
  total_skills: number;
  completed_skills: number;
  skills?: Skill[];
}

// Skill
export interface Skill {
  id: number;
  learning_path_id: number;
  title: string;
  description: string | null;
  skill_type: string;
  difficulty: number;
  points: number;
  prerequisites: number[];
  order_index: number;
  estimated_minutes: number | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  progress_percentage: number;
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string | null;
  points_earned: number;
  resources: SkillResource[];
}

// Skill Resource
export interface SkillResource {
  id: number;
  skill_id: number;
  resource_type: 'video' | 'article' | 'book' | 'quiz' | 'exercise';
  title: string;
  description: string | null;
  content_url: string | null;
  book_id: string | null;
  chapter_index: number | null;
  quiz_id: number | null;
}

// Achievement
export interface Achievement {
  id: number;
  title: string;
  description: string | null;
  achievement_type: string;
  icon_name: string | null;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  requirements: any;
  is_active: boolean;
  is_unlocked: boolean;
  unlocked_at: string | null;
  points_earned: number;
}

// Progress Summary
export interface ProgressSummary {
  learning_paths: {
    total: number;
    completed: number;
    in_progress: number;
    avg_progress: number;
  };
  skills: {
    total: number;
    completed: number;
    mastered: number;
    in_progress: number;
    total_points: number;
  };
  achievements: {
    total: number;
    unlocked: number;
    points: number;
    completion_percentage: number;
  };
  subjects: SubjectProgress[];
  recent_activity: ActivityItem[];
}

// Subject Progress
export interface SubjectProgress {
  subject: string;
  path_count: number;
  avg_progress: number;
  total_paths?: number;
  completed_paths?: number;
  total_skills?: number;
  completed_skills?: number;
  total_points?: number;
  skill_completion_percentage?: number;
}

// Activity Item
export interface ActivityItem {
  activity_type: 'learning_path' | 'skill' | 'achievement';
  title: string;
  item_id: number;
  status: string;
  progress_percentage: number;
  activity_date: string;
}

// Points History
export interface PointsHistory {
  total_points: number;
  points_history: PointItem[];
  chart_data: MonthlyPoints[];
}

// Point Item
export interface PointItem {
  item_id: number;
  item_title: string;
  source_type: 'skill' | 'achievement';
  points: number;
  earned_at: string;
}

// Monthly Points
export interface MonthlyPoints {
  month: string;
  points: number;
}

// Recommendation
export interface Recommendation {
  id?: number;
  recommendation_type: 'next_skill' | 'new_path' | 'review_skill';
  title: string;
  description: string;
  resource_type: 'skill' | 'learning_path';
  resource_id: number;
  priority: number;
  is_dismissed?: boolean;
}
