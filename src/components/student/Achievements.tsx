import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Achievement } from '@/services/studentHubService';
import { Trophy } from 'lucide-react';

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  if (achievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No achievements earned yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-start space-x-4 p-4 rounded-lg border bg-card"
            >
              <div className="flex-shrink-0">
                {achievement.icon_url ? (
                  <img
                    src={achievement.icon_url}
                    alt={achievement.title}
                    className="h-8 w-8"
                  />
                ) : (
                  <Trophy className="h-8 w-8 text-yellow-500" />
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