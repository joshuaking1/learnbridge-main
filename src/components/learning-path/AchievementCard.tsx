"use client";

import { Achievement } from "@/types/learning-path";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Trophy,
  BookOpen,
  Zap,
  Star,
  Flame,
  Target,
  Medal,
  Crown,
  Sparkles,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  achievement: Achievement;
  showDetails?: boolean;
}

export function AchievementCard({ achievement, showDetails = false }: AchievementCardProps) {
  // Get achievement icon
  const getAchievementIcon = (type: string, iconName: string | null) => {
    // If a specific icon name is provided, use that
    if (iconName) {
      switch (iconName) {
        case 'trophy': return <Trophy className="h-full w-full" />;
        case 'star': return <Star className="h-full w-full" />;
        case 'flame': return <Flame className="h-full w-full" />;
        case 'target': return <Target className="h-full w-full" />;
        case 'medal': return <Medal className="h-full w-full" />;
        case 'crown': return <Crown className="h-full w-full" />;
        case 'sparkles': return <Sparkles className="h-full w-full" />;
        default: return <Award className="h-full w-full" />;
      }
    }
    
    // Otherwise, use the achievement type
    switch (type) {
      case 'learning_path_completion':
        return <BookOpen className="h-full w-full" />;
      case 'skill_mastery':
        return <Zap className="h-full w-full" />;
      case 'subject_completion':
        return <Trophy className="h-full w-full" />;
      case 'points_earned':
        return <Star className="h-full w-full" />;
      default:
        return <Award className="h-full w-full" />;
    }
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-amber-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-brand-orange';
    }
  };
  
  // Format achievement type for display
  const formatAchievementType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200 hover:shadow-md h-full",
      !achievement.is_unlocked && "opacity-75"
    )}>
      <CardContent className="p-0 flex h-full">
        {/* Achievement Icon */}
        <div className={cn(
          "w-24 flex items-center justify-center relative",
          getDifficultyColor(achievement.difficulty)
        )}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-white p-4 w-12 h-12">
            {getAchievementIcon(achievement.achievement_type, achievement.icon_name)}
          </div>
        </div>
        
        {/* Achievement Details */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <Badge variant="outline" className="bg-slate-100 text-slate-800">
              {formatAchievementType(achievement.achievement_type)}
            </Badge>
            
            {achievement.is_unlocked ? (
              <Badge className="bg-green-500">
                <Award className="h-3 w-3 mr-1" />
                Unlocked
              </Badge>
            ) : (
              <Badge variant="outline" className="border-slate-300 text-slate-500">
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>
          
          <h3 className="font-medium text-slate-800 mb-1">{achievement.title}</h3>
          
          {achievement.description && (
            <p className="text-xs text-slate-600 mb-2">
              {achievement.description}
            </p>
          )}
          
          <div className="mt-auto flex items-center text-xs text-slate-500">
            <Star className="h-3.5 w-3.5 mr-1 text-yellow-500" />
            <span>{achievement.points} points</span>
            
            {achievement.is_unlocked && achievement.unlocked_at && (
              <span className="ml-auto text-xs text-slate-400">
                Unlocked on {new Date(achievement.unlocked_at).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {showDetails && achievement.requirements && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-medium text-slate-700 mb-1">Requirements:</h4>
              <ul className="text-xs text-slate-600 list-disc list-inside">
                {Object.entries(achievement.requirements).map(([key, value]) => (
                  <li key={key}>
                    {key.replace(/_/g, ' ')}: {value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
