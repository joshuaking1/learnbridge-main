"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Recommendation } from "@/types/learning-path";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  BookOpen,
  Zap,
  ChevronRight,
  RefreshCw,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { learningPathService } from "@/services/learningPathService";
import { useAuthStore } from "@/stores/useAuthStore";

interface RecommendationsProps {
  recommendations: Recommendation[];
  onRefresh?: () => Promise<void>;
}

export function Recommendations({ recommendations, onRefresh }: RecommendationsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { token } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissingIds, setDismissingIds] = useState<number[]>([]);
  
  // Get recommendation icon
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'next_skill':
        return <Zap className="h-4 w-4 text-amber-500" />;
      case 'new_path':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'review_skill':
        return <Zap className="h-4 w-4 text-purple-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-brand-orange" />;
    }
  };
  
  // Handle recommendation click
  const handleRecommendationClick = (recommendation: Recommendation) => {
    if (recommendation.resource_type === 'learning_path') {
      router.push(`/dashboard/student-hub/learning-path/${recommendation.resource_id}`);
    } else if (recommendation.resource_type === 'skill') {
      router.push(`/dashboard/student-hub/learning-path/skill/${recommendation.resource_id}`);
    }
  };
  
  // Handle dismiss recommendation
  const handleDismiss = async (recommendation: Recommendation) => {
    if (!recommendation.id) return;
    
    setDismissingIds(prev => [...prev, recommendation.id!]);
    
    try {
      await learningPathService.dismissRecommendation(token, recommendation.id);
      
      // If onRefresh is provided, call it to refresh recommendations
      if (onRefresh) {
        await onRefresh();
      }
      
      toast({
        title: "Recommendation dismissed",
        description: "The recommendation has been removed from your list.",
      });
    } catch (error) {
      console.error("Error dismissing recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to dismiss recommendation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDismissingIds(prev => prev.filter(id => id !== recommendation.id));
    }
  };
  
  // Handle refresh recommendations
  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    
    try {
      await learningPathService.refreshRecommendations(token);
      await onRefresh();
      
      toast({
        title: "Recommendations refreshed",
        description: "Your recommendations have been updated.",
      });
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to refresh recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-brand-orange" />
          Recommended for You
        </CardTitle>
        
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p>No recommendations available</p>
            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Get Recommendations
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div 
                key={recommendation.id || index} 
                className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="mr-3">
                  {getRecommendationIcon(recommendation.recommendation_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {recommendation.title}
                  </div>
                  {recommendation.description && (
                    <div className="text-xs text-slate-500 truncate">
                      {recommendation.description}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center ml-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleDismiss(recommendation)}
                    disabled={dismissingIds.includes(recommendation.id || -1)}
                  >
                    <X className="h-4 w-4 text-slate-400 hover:text-slate-700" />
                    <span className="sr-only">Dismiss</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleRecommendationClick(recommendation)}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
