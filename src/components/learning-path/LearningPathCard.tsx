"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LearningPath } from "@/types/learning-path";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  ChevronRight, 
  Clock, 
  Award, 
  BarChart, 
  CheckCircle2,
  PlayCircle
} from "lucide-react";

interface LearningPathCardProps {
  path: LearningPath;
  onStart?: (pathId: number) => Promise<void>;
}

export function LearningPathCard({ path, onStart }: LearningPathCardProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  
  // Get background color based on subject
  const getSubjectColor = (subject: string) => {
    const subjectColors: Record<string, string> = {
      "Art and Design Studio": "bg-pink-500",
      "Integrated Science": "bg-green-500",
      "Mathematics": "bg-blue-500",
      "English Language": "bg-purple-500",
      "Social Studies": "bg-amber-500"
    };
    
    return subjectColors[subject] || "bg-brand-orange";
  };
  
  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    const difficultyColors: Record<string, string> = {
      "beginner": "bg-green-100 text-green-800 hover:bg-green-200",
      "intermediate": "bg-amber-100 text-amber-800 hover:bg-amber-200",
      "advanced": "bg-red-100 text-red-800 hover:bg-red-200"
    };
    
    return difficultyColors[difficulty] || "bg-slate-100 text-slate-800 hover:bg-slate-200";
  };
  
  // Format estimated time
  const formatEstimatedTime = (hours: number | null) => {
    if (!hours) return "Varies";
    if (hours < 1) return "< 1 hour";
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };
  
  // Handle start button click
  const handleStart = async () => {
    if (onStart && path.status === 'not_started') {
      setIsStarting(true);
      try {
        await onStart(path.id);
      } catch (error) {
        console.error("Error starting learning path:", error);
      } finally {
        setIsStarting(false);
      }
    } else {
      router.push(`/dashboard/student-hub/learning-path/${path.id}`);
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md h-full flex flex-col">
      {/* Card Header with Subject Color */}
      <div className={`${getSubjectColor(path.subject)} h-2`}></div>
      
      <CardContent className="p-5 flex-1">
        <div className="flex flex-col h-full">
          <div className="mb-3 flex justify-between items-start">
            <Badge variant="outline" className={getDifficultyColor(path.difficulty)}>
              {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
            </Badge>
            
            {path.status === 'completed' && (
              <Badge className="bg-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          
          <h3 className="font-semibold text-lg text-slate-800 mb-2">{path.title}</h3>
          
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">
            {path.description || `A learning path for ${path.subject}`}
          </p>
          
          <div className="flex items-center text-xs text-slate-500 mb-3">
            <BookOpen className="h-3.5 w-3.5 mr-1" />
            <span className="mr-3">{path.subject}</span>
            
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>{formatEstimatedTime(path.estimated_hours)}</span>
          </div>
          
          <div className="mt-auto">
            {path.status !== 'not_started' && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{path.progress_percentage}%</span>
                </div>
                <Progress value={path.progress_percentage} className="h-2" />
              </div>
            )}
            
            <div className="flex items-center text-xs text-slate-500">
              <Award className="h-3.5 w-3.5 mr-1" />
              <span className="mr-3">{path.total_skills} skills</span>
              
              <BarChart className="h-3.5 w-3.5 mr-1" />
              <span>{path.completed_skills} completed</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-5 py-3 border-t border-slate-100">
        <Button 
          className="w-full"
          onClick={handleStart}
          disabled={isStarting}
        >
          {isStarting ? (
            <>
              <span className="mr-2">Starting...</span>
            </>
          ) : path.status === 'not_started' ? (
            <>
              <PlayCircle className="h-4 w-4 mr-1" />
              Start Path
            </>
          ) : (
            <>
              <ChevronRight className="h-4 w-4 mr-1" />
              Continue
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
