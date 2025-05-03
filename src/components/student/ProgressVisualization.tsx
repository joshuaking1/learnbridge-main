import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningProgress as LearningProgressType } from '@/services/studentHubService';
import { calculatePercentage } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProgressVisualizationProps {
  progress: LearningProgressType[];
}

export const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({ progress }) => {
  if (progress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No progress data to visualize.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall progress
  const totalCompleted = progress.reduce((sum, item) => sum + item.completed_modules, 0);
  const totalModules = progress.reduce((sum, item) => sum + item.total_modules, 0);
  const overallProgress = calculatePercentage(totalCompleted, totalModules);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Overall Progress</h3>
              <span className="text-sm font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-4" />
            <p className="text-sm text-muted-foreground">
              {totalCompleted} of {totalModules} modules completed
            </p>
          </div>

          {/* Learning Path Progress */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Learning Path Progress</h3>
            {progress.map((item) => (
              <div key={item.learning_path_id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{item.learning_path_title}</h4>
                  <span className="text-sm font-medium">{item.progress_percentage}%</span>
                </div>
                <Progress value={item.progress_percentage} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {item.completed_modules} of {item.total_modules} modules completed
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 