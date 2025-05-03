'use client';

import React from 'react';
import { useStudentHub } from '@/hooks/useStudentHub';
import { LearningProgress } from '@/components/student/LearningProgress';
import { RecentActivities } from '@/components/student/RecentActivities';
import { Achievements } from '@/components/student/Achievements';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentHubPage() {
  const { progress, activities, achievements, loading, error } = useStudentHub();

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/15 text-destructive p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Student Hub</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <LearningProgress progress={progress} />
          )}
          
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <RecentActivities activities={activities} />
          )}
        </div>
        
        <div>
          {loading ? (
            <Skeleton className="h-[600px] w-full" />
          ) : (
            <Achievements achievements={achievements} />
          )}
        </div>
      </div>
    </div>
  );
} 