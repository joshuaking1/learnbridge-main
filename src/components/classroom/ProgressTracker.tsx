import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Award, 
  Trophy, 
  Star, 
  Clock, 
  Calendar,
  BarChart,
  Target
} from "lucide-react";

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  date: string;
  type: "skill" | "milestone" | "streak";
}

interface SubjectProgress {
  subject: string;
  progress: number;
  lastActivity: string;
  nextMilestone: string;
}

export function ProgressTracker() {
  const achievements: Achievement[] = [
    {
      id: 1,
      title: "Math Master",
      description: "Completed 10 math lessons with 90% accuracy",
      icon: "🎯",
      date: "2024-03-15",
      type: "skill"
    },
    {
      id: 2,
      title: "7 Day Streak",
      description: "Studied for 7 consecutive days",
      icon: "🔥",
      date: "2024-03-14",
      type: "streak"
    },
    {
      id: 3,
      title: "Science Explorer",
      description: "Completed all science modules",
      icon: "🔬",
      date: "2024-03-10",
      type: "milestone"
    }
  ];

  const subjectProgress: SubjectProgress[] = [
    {
      subject: "Mathematics",
      progress: 75,
      lastActivity: "2 hours ago",
      nextMilestone: "Complete Algebra Unit"
    },
    {
      subject: "Integrated Science",
      progress: 60,
      lastActivity: "1 day ago",
      nextMilestone: "Complete Physics Module"
    },
    {
      subject: "English Language",
      progress: 85,
      lastActivity: "3 hours ago",
      nextMilestone: "Complete Essay Writing"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">78%</div>
              <Badge variant="outline" className="text-green-600 bg-green-50">
                <Target className="h-4 w-4 mr-1" />
                On Track
              </Badge>
            </div>
            <Progress value={78} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-brand-orange">12</div>
                <div className="text-sm text-slate-600">Completed Modules</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-slate-600">Achievements</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">7</div>
                <div className="text-sm text-slate-600">Days Streak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Subject Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {subjectProgress.map((subject) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{subject.subject}</div>
                  <div className="text-sm text-slate-600">{subject.progress}%</div>
                </div>
                <Progress value={subject.progress} className="h-2" />
                <div className="flex justify-between text-sm text-slate-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Last activity: {subject.lastActivity}
                  </div>
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    Next: {subject.nextMilestone}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-slate-50"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{achievement.title}</h4>
                    <Badge variant="outline">
                      {achievement.type.charAt(0).toUpperCase() + achievement.type.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {achievement.description}
                  </p>
                  <div className="flex items-center text-xs text-slate-500 mt-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(achievement.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 