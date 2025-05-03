import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { LearningProgress as LearningProgressType } from '@/services/studentHubService';

interface LearningProgressProps {
  progress: LearningProgressType[];
}

export const LearningProgress: React.FC<LearningProgressProps> = ({ progress }) => {
  if (progress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No learning paths in progress yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {progress.map((item) => (
          <div key={item.learning_path_id} className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{item.learning_path_title}</h3>
              <span className="text-sm text-muted-foreground">
                {item.completed_modules}/{item.total_modules} modules
              </span>
            </div>
            <Progress value={item.progress_percentage} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Last accessed {formatDistanceToNow(new Date(item.last_accessed))} ago
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}; 