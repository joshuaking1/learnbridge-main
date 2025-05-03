import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Achievement } from '@/services/studentHubService';
import { Award, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface AchievementNotificationsProps {
  achievements: Achievement[];
}

export const AchievementNotifications: React.FC<AchievementNotificationsProps> = ({ achievements }) => {
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);
  
  // Filter recent achievements (earned in the last 24 hours)
  useEffect(() => {
    const now = new Date();
    const recent = achievements.filter(achievement => {
      const earnedDate = new Date(achievement.earned_at);
      const diffInHours = (now.getTime() - earnedDate.getTime()) / (1000 * 60 * 60);
      return diffInHours <= 24;
    });
    
    setRecentAchievements(recent);
  }, [achievements]);
  
  if (recentAchievements.length === 0 || !showNotifications) {
    return null;
  }
  
  return (
    <Card className="mb-6 border-l-4 border-l-yellow-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            <Award className="h-5 w-5 mr-2 text-yellow-500" />
            New Achievements
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowNotifications(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-start space-x-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <div className="flex-shrink-0">
                {achievement.icon_url ? (
                  <img
                    src={achievement.icon_url}
                    alt={achievement.title}
                    className="h-8 w-8"
                  />
                ) : (
                  <Award className="h-8 w-8 text-yellow-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-medium">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  Earned {formatDistanceToNow(new Date(achievement.earned_at))} ago
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 