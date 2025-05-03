"use client";

import { useState } from "react";
import { Skill } from "@/types/learning-path";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Award, 
  CheckCircle2,
  PlayCircle,
  BookOpen,
  Video,
  FileText,
  PenTool,
  Lock,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillCardProps {
  skill: Skill;
  isLocked?: boolean;
  onStart?: (skillId: number) => Promise<void>;
  onComplete?: (skillId: number) => Promise<void>;
}

export function SkillCard({ skill, isLocked = false, onStart, onComplete }: SkillCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Get skill type icon
  const getSkillTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'reading':
        return <BookOpen className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'exercise':
        return <PenTool className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };
  
  // Format estimated time
  const formatEstimatedTime = (minutes: number | null) => {
    if (!minutes) return "Varies";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hr ${remainingMinutes} min` 
      : `${hours} hr`;
  };
  
  // Get difficulty stars
  const getDifficultyStars = (difficulty: number) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={i < difficulty ? "text-yellow-400" : "text-slate-300"}>★</span>
    ));
  };
  
  // Handle start button click
  const handleStart = async () => {
    if (onStart && !isLocked) {
      setIsLoading(true);
      try {
        await onStart(skill.id);
      } catch (error) {
        console.error("Error starting skill:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Handle complete button click
  const handleComplete = async () => {
    if (onComplete && !isLocked && skill.status === 'in_progress') {
      setIsLoading(true);
      try {
        await onComplete(skill.id);
      } catch (error) {
        console.error("Error completing skill:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 h-full flex flex-col",
      isLocked ? "opacity-75 bg-slate-50" : "hover:shadow-md"
    )}>
      <CardContent className="p-4 flex-1">
        <div className="flex flex-col h-full">
          <div className="mb-2 flex justify-between items-start">
            <Badge variant="outline" className="bg-slate-100 text-slate-800">
              {getSkillTypeIcon(skill.skill_type)}
              <span className="ml-1">{skill.skill_type}</span>
            </Badge>
            
            {skill.status === 'completed' && (
              <Badge className="bg-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
            
            {skill.status === 'mastered' && (
              <Badge className="bg-purple-500">
                <Award className="h-3 w-3 mr-1" />
                Mastered
              </Badge>
            )}
          </div>
          
          <h3 className="font-medium text-slate-800 mb-2">{skill.title}</h3>
          
          {skill.description && (
            <p className="text-xs text-slate-600 mb-3 line-clamp-2">
              {skill.description}
            </p>
          )}
          
          <div className="flex items-center text-xs text-slate-500 mb-2">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span className="mr-3">{formatEstimatedTime(skill.estimated_minutes)}</span>
            
            <Award className="h-3.5 w-3.5 mr-1" />
            <span>{skill.points} points</span>
          </div>
          
          <div className="text-xs text-slate-500 mb-3">
            <span className="mr-1">Difficulty:</span>
            <span className="inline-flex">{getDifficultyStars(skill.difficulty)}</span>
          </div>
          
          <div className="mt-auto">
            {skill.status !== 'not_started' && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{skill.progress_percentage}%</span>
                </div>
                <Progress value={skill.progress_percentage} className="h-2" />
              </div>
            )}
            
            {skill.resources.length > 0 && (
              <div className="text-xs text-slate-500">
                <span>{skill.resources.length} resource{skill.resources.length !== 1 ? 's' : ''} available</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t border-slate-100">
        {isLocked ? (
          <Button variant="outline" className="w-full" disabled>
            <Lock className="h-4 w-4 mr-1" />
            Locked
          </Button>
        ) : skill.status === 'not_started' ? (
          <Button 
            className="w-full"
            onClick={handleStart}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Starting...</span>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-1" />
                Start Skill
              </>
            )}
          </Button>
        ) : skill.status === 'in_progress' ? (
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline"
              className="flex-1"
              onClick={handleStart}
              disabled={isLoading}
            >
              <ChevronRight className="h-4 w-4 mr-1" />
              Continue
            </Button>
            <Button 
              className="flex-1"
              onClick={handleComplete}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Complete
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline"
            className="w-full"
            onClick={handleStart}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Review
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
