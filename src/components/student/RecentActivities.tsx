import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { StudentActivity } from '@/services/studentHubService';
import { 
  BookOpen, 
  Award, 
  CheckCircle, 
  Clock,
  Activity
} from 'lucide-react';

interface RecentActivitiesProps {
  activities: StudentActivity[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'module_completion':
      return <BookOpen className="h-4 w-4" />;
    case 'achievement_earned':
      return <Award className="h-4 w-4" />;
    case 'quiz_completion':
      return <CheckCircle className="h-4 w-4" />;
    case 'progress_update':
      return <Activity className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getActivityMessage = (activity: StudentActivity) => {
  const data = activity.activity_data;
  
  switch (activity.activity_type) {
    case 'module_completion':
      return `Completed module: ${data.moduleName}`;
    case 'achievement_earned':
      return `Earned achievement: ${data.achievementName}`;
    case 'quiz_completion':
      return `Completed quiz: ${data.quizName} with score ${data.score}%`;
    case 'progress_update':
      return `Updated progress in ${data.learningPathName} to ${data.progressPercentage}%`;
    default:
      return 'Unknown activity';
  }
};

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent activities to show.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="mt-1">
                {getActivityIcon(activity.activity_type)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {getActivityMessage(activity)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at))} ago
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 