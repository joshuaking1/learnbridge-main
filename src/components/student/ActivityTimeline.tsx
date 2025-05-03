import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTime } from '@/lib/utils';
import { StudentActivity } from '@/services/studentHubService';
import { 
  BookOpen, 
  Award, 
  CheckCircle, 
  Clock,
  Activity,
  Calendar,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ActivityTimelineProps {
  activities: StudentActivity[];
}

type ActivityFilter = 'all' | 'module_completion' | 'quiz_completion' | 'achievement_earned' | 'progress_update';

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

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const [filter, setFilter] = useState<ActivityFilter>('all');
  
  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = formatDate(activity.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, StudentActivity[]>);
  
  // Filter activities based on selected filter
  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.activity_type === filter
  );
  
  // Group filtered activities by date
  const filteredGroupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = formatDate(activity.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, StudentActivity[]>);
  
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No activities to show.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Activity Timeline</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            <Filter className="h-4 w-4 mr-1" />
            All
          </Button>
          <Button 
            variant={filter === 'module_completion' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('module_completion')}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Modules
          </Button>
          <Button 
            variant={filter === 'quiz_completion' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('quiz_completion')}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Quizzes
          </Button>
          <Button 
            variant={filter === 'achievement_earned' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('achievement_earned')}
          >
            <Award className="h-4 w-4 mr-1" />
            Achievements
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Object.entries(filteredGroupedActivities).map(([date, dayActivities]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">{date}</h3>
              </div>
              <div className="space-y-4 pl-6 border-l-2 border-muted">
                {dayActivities.map((activity, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary" />
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          {getActivityMessage(activity)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 