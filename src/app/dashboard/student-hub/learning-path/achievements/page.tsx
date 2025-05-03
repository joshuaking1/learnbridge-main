"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Award, 
  Search, 
  ArrowLeft,
  Filter,
  Star,
  Trophy,
  BookOpen,
  Zap,
  Flame
} from "lucide-react";
import { AchievementCard } from "@/components/learning-path/AchievementCard";
import { learningPathService } from "@/services/learningPathService";
import { Achievement } from "@/types/learning-path";

export default function AchievementsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);
  
  // State for achievements
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Component mounted effect
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  // Authentication check
  useEffect(() => {
    if (hasMounted && !isLoadingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasMounted, isLoadingAuth, isAuthenticated, router]);
  
  // Fetch achievements
  useEffect(() => {
    if (hasMounted && isAuthenticated && token) {
      const fetchAchievements = async () => {
        setIsLoadingAchievements(true);
        try {
          const achievements = await learningPathService.getAllAchievements(token);
          setAchievements(achievements);
          setFilteredAchievements(achievements);
        } catch (error) {
          console.error("Error fetching achievements:", error);
          toast({ 
            title: "Error", 
            description: "Failed to load achievements. Please try again later.", 
            variant: "destructive" 
          });
        } finally {
          setIsLoadingAchievements(false);
        }
      };
      
      fetchAchievements();
    }
  }, [hasMounted, isAuthenticated, token, toast]);
  
  // Filter achievements based on search and tab
  useEffect(() => {
    if (achievements.length === 0) {
      setFilteredAchievements([]);
      return;
    }
    
    let filtered = [...achievements];
    
    // Filter by tab
    if (activeTab === "unlocked") {
      filtered = filtered.filter(achievement => achievement.is_unlocked);
    } else if (activeTab === "locked") {
      filtered = filtered.filter(achievement => !achievement.is_unlocked);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(achievement => 
        achievement.title.toLowerCase().includes(query) || 
        (achievement.description && achievement.description.toLowerCase().includes(query)) ||
        achievement.achievement_type.toLowerCase().includes(query)
      );
    }
    
    setFilteredAchievements(filtered);
  }, [achievements, searchQuery, activeTab]);
  
  // Get achievement type icon
  const getAchievementTypeIcon = (type: string) => {
    switch (type) {
      case 'learning_path_completion':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'skill_mastery':
        return <Zap className="h-5 w-5 text-amber-500" />;
      case 'subject_completion':
        return <Trophy className="h-5 w-5 text-purple-500" />;
      case 'points_earned':
        return <Star className="h-5 w-5 text-yellow-500" />;
      default:
        return <Award className="h-5 w-5 text-brand-orange" />;
    }
  };
  
  // Format achievement type for display
  const formatAchievementType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Calculate total points
  const totalPoints = achievements
    .filter(a => a.is_unlocked)
    .reduce((sum, achievement) => sum + achievement.points_earned, 0);
  
  // Calculate achievement stats
  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter(a => a.is_unlocked).length;
  const completionPercentage = totalAchievements > 0 
    ? Math.round((unlockedAchievements / totalAchievements) * 100) 
    : 0;
  
  // Loading state
  if (!hasMounted || isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Achievements"
        description="Track your learning milestones"
        icon={Award}
      >
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/dashboard/student-hub/learning-path')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Learning Path
        </Button>
      </DashboardHeader>
      
      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-3">
              <Trophy className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Total Achievements</div>
              <div className="text-2xl font-bold">{totalAchievements}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-3">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Unlocked</div>
              <div className="text-2xl font-bold">{unlockedAchievements}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-3">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Total Points</div>
              <div className="text-2xl font-bold">{totalPoints}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <Flame className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Completion</div>
              <div className="text-2xl font-bold">{completionPercentage}%</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Achievements List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-brand-orange" />
              Achievements
            </CardTitle>
          </div>
          
          <CardDescription>
            Unlock achievements as you progress through your learning journey
          </CardDescription>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search achievements..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
                <TabsTrigger value="locked">Locked</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoadingAchievements ? (
            <div className="grid grid-cols-1 gap-4 py-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 animate-pulse bg-slate-100 rounded-lg"></div>
              ))}
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-700">No achievements found</h3>
              <p className="text-slate-500 mt-1">
                {searchQuery 
                  ? "Try adjusting your search term." 
                  : activeTab === "unlocked" 
                    ? "You haven't unlocked any achievements yet." 
                    : "No achievements available."}
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Group achievements by type */}
              {Array.from(new Set(filteredAchievements.map(a => a.achievement_type))).map(type => (
                <div key={type} className="space-y-3">
                  <div className="flex items-center">
                    {getAchievementTypeIcon(type)}
                    <h3 className="text-lg font-medium ml-2">{formatAchievementType(type)}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {filteredAchievements
                      .filter(a => a.achievement_type === type)
                      .map(achievement => (
                        <AchievementCard 
                          key={achievement.id} 
                          achievement={achievement} 
                          showDetails
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
