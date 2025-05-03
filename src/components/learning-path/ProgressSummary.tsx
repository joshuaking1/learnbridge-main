"use client";

import { ProgressSummary as ProgressSummaryType } from "@/types/learning-path";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Award, 
  BookOpen,
  Zap,
  BarChart,
  Trophy,
  Clock
} from "lucide-react";

interface ProgressSummaryProps {
  summary: ProgressSummaryType;
}

export function ProgressSummary({ summary }: ProgressSummaryProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'learning_path':
      case 'learning_path_started':
      case 'learning_path_completed':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'skill':
      case 'skill_started':
      case 'skill_completed':
        return <Zap className="h-4 w-4 text-amber-500" />;
      case 'achievement':
      case 'achievement_unlocked':
        return <Trophy className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };
  
  // Get activity text
  const getActivityText = (activity: any) => {
    switch (activity.activity_type) {
      case 'learning_path':
        return `${activity.status === 'completed' ? 'Completed' : 'Worked on'} learning path "${activity.title}"`;
      case 'learning_path_started':
        return `Started learning path "${activity.item_title}"`;
      case 'learning_path_completed':
        return `Completed learning path "${activity.item_title}"`;
      case 'skill':
        return `${activity.status === 'completed' ? 'Completed' : 'Worked on'} skill "${activity.title}"`;
      case 'skill_started':
        return `Started skill "${activity.item_title}"`;
      case 'skill_completed':
        return `Completed skill "${activity.item_title}"`;
      case 'achievement':
      case 'achievement_unlocked':
        return `Unlocked achievement "${activity.title || activity.item_title}"`;
      default:
        return `Activity: ${activity.title || activity.item_title}`;
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Learning Paths Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
            Learning Paths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2">
            <div className="text-sm text-slate-500">Overall Progress</div>
            <div className="text-sm font-medium">{summary.learning_paths.avg_progress}%</div>
          </div>
          <Progress value={summary.learning_paths.avg_progress} className="h-2 mb-4" />
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="text-2xl font-semibold text-slate-800">{summary.learning_paths.total}</div>
              <div className="text-xs text-slate-500">Total</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-semibold text-blue-600">{summary.learning_paths.in_progress}</div>
              <div className="text-xs text-slate-500">In Progress</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-semibold text-green-600">{summary.learning_paths.completed}</div>
              <div className="text-xs text-slate-500">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Skills Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Zap className="h-5 w-5 mr-2 text-amber-500" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2">
            <div className="text-sm text-slate-500">Skills Completed</div>
            <div className="text-sm font-medium">
              {summary.skills.completed + summary.skills.mastered} / {summary.skills.total}
            </div>
          </div>
          <Progress 
            value={(summary.skills.completed + summary.skills.mastered) / Math.max(1, summary.skills.total) * 100} 
            className="h-2 mb-4" 
          />
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-amber-50 p-3 rounded-lg">
              <div className="text-2xl font-semibold text-amber-600">{summary.skills.in_progress}</div>
              <div className="text-xs text-slate-500">In Progress</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-semibold text-green-600">{summary.skills.completed}</div>
              <div className="text-xs text-slate-500">Completed</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-semibold text-purple-600">{summary.skills.mastered}</div>
              <div className="text-xs text-slate-500">Mastered</div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500 flex items-center">
                <Award className="h-4 w-4 mr-1 text-yellow-500" />
                Total Points Earned
              </div>
              <div className="text-lg font-semibold text-yellow-600">{summary.skills.total_points}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-purple-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2">
            <div className="text-sm text-slate-500">Unlocked</div>
            <div className="text-sm font-medium">{summary.achievements.unlocked} / {summary.achievements.total}</div>
          </div>
          <Progress value={summary.achievements.completion_percentage} className="h-2 mb-4" />
          
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-semibold text-purple-600">{summary.achievements.unlocked}</div>
              <div className="text-xs text-slate-500">Unlocked</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-semibold text-yellow-600">{summary.achievements.points}</div>
              <div className="text-xs text-slate-500">Points</div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-sm font-medium text-slate-700 mb-2">Top Subjects</div>
            {summary.subjects.slice(0, 3).map((subject, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{subject.subject}</span>
                  <span>{subject.avg_progress}%</span>
                </div>
                <Progress value={subject.avg_progress} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-slate-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
            {summary.recent_activity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-800">{getActivityText(activity)}</div>
                  <div className="text-xs text-slate-500">{formatDate(activity.activity_date)}</div>
                </div>
              </div>
            ))}
            
            {summary.recent_activity.length === 0 && (
              <div className="text-center py-6 text-slate-500">
                <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
