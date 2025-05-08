"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2,
  GraduationCap,
  Search,
  BookOpen,
  Award,
  BarChart,
  RefreshCw,
  Filter,
  Lightbulb
} from "lucide-react";
import { LearningPathCard } from "@/components/learning-path/LearningPathCard";
import { ProgressSummary } from "@/components/learning-path/ProgressSummary";
import { AchievementCard } from "@/components/learning-path/AchievementCard";
import { Recommendations } from "@/components/learning-path/Recommendations";
import { learningPathService } from "@/services/learningPathService";
import { LearningPath, Achievement, ProgressSummary as ProgressSummaryType, Recommendation } from "@/types/learning-path";

// Note: We're using the imported component types directly rather than redefining them here

export default function LearningPathPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);

  // State for learning paths
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [filteredPaths, setFilteredPaths] = useState<LearningPath[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true); // Combined loading state

  // State for achievements
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // State for progress summary
  const [progressSummary, setProgressSummary] = useState<ProgressSummaryType | null>(null);

  // State for recommendations
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
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

  // Fetch all initial data in parallel
  const fetchData = async () => {
    if (!token) return;
    setIsLoadingData(true);

    try {
      const [paths, fetchedAchievements, summary, fetchedRecommendations] = await Promise.all([
        learningPathService.getAllPaths(token),
        learningPathService.getAllAchievements(token),
        learningPathService.getProgressSummary(token),
        learningPathService.getRecommendations(token)
      ]);

      setLearningPaths(paths);
      setFilteredPaths(paths); // Initialize filtered paths
      setAchievements(fetchedAchievements);
      setProgressSummary(summary);
      setRecommendations(fetchedRecommendations);

    } catch (error) {
      console.error("Error fetching learning path data:", error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load some learning path data. Please try refreshing.",
        variant: "destructive"
      });
      // Set empty arrays/null for failed fetches to avoid crashes
      setLearningPaths(prev => prev || []);
      setFilteredPaths(prev => prev || []);
      setAchievements(prev => prev || []);
      setProgressSummary(prev => prev || null);
      setRecommendations(prev => prev || []);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (hasMounted && isAuthenticated && token) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMounted, isAuthenticated, token]); // Removed toast from dependencies as it's stable

  // Function to refresh recommendations specifically (can be called by Recommendations component)
  const refreshRecommendations = async () => {
    if (!token) return;
    // Optionally show a loading indicator specific to recommendations
    try {
      const fetchedRecommendations = await learningPathService.getRecommendations(token);
      setRecommendations(fetchedRecommendations);
      toast({ title: "Recommendations Refreshed", description: "Your recommendations have been updated." });
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
      toast({ title: "Error", description: "Failed to refresh recommendations.", variant: "destructive" });
    }
  };

  // Filter learning paths based on search, subject, difficulty, and tab
  useEffect(() => {
    if (learningPaths.length === 0) {
      setFilteredPaths([]);
      return;
    }

    let filtered = [...learningPaths];

    // Filter by tab
    if (activeTab === "in_progress") {
      filtered = filtered.filter(path => path.status === "in_progress");
    } else if (activeTab === "completed") {
      filtered = filtered.filter(path => path.status === "completed");
    } else if (activeTab === "not_started") {
      filtered = filtered.filter(path => path.status === "not_started");
    }

    // Filter by subject
    if (selectedSubject !== "all") {
      filtered = filtered.filter(path => path.subject === selectedSubject);
    }

    // Filter by difficulty
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(path => path.difficulty === selectedDifficulty);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(path =>
        path.title.toLowerCase().includes(query) ||
        (path.description && path.description.toLowerCase().includes(query)) ||
        path.subject.toLowerCase().includes(query)
      );
    }

    setFilteredPaths(filtered);
  }, [learningPaths, searchQuery, selectedSubject, selectedDifficulty, activeTab]);

  // Get unique subjects from learning paths
  const subjects = ["all", ...new Set(learningPaths.map(path => path.subject))];

  // Handle start learning path
  const handleStartPath = async (pathId: number) => {
    try {
      await learningPathService.startPath(token, pathId);

      // Update the learning path status in the state
      setLearningPaths(prevPaths =>
        prevPaths.map(path =>
          path.id === pathId
            ? { ...path, status: "in_progress", progress_percentage: 0 }
            : path
        )
      );

      toast({
        title: "Learning Path Started",
        description: "You've successfully started this learning path.",
      });

      // Navigate to the learning path detail page
      router.push(`/dashboard/student-hub/learning-path/${pathId}`);
    } catch (error) {
      console.error("Error starting learning path:", error);
      toast({
        title: "Error",
        description: "Failed to start learning path. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Loading state
  if (!hasMounted || isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <>
      <DashboardHeader
        heading="Learning Path"
        description="Your personalized learning journey"
        icon={GraduationCap}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          {/* Progress Summary */}
          {isLoadingData ? (
            <Card>
              <CardContent className="p-6 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
              </CardContent>
            </Card>
          ) : (
            <ProgressSummary progress={progressSummary} />
          )}

          {/* Learning Path Cards */}
          <LearningPathCard learningPath={learningPath} />

          {/* Achievements */}
          <AchievementCard achievements={achievements} />
        </div>

        {/* Recommendations (1/3 width) */}
        <div>
          <Recommendations recommendations={recommendations} />
        </div>
      </div>
    </>
  );
}

              </CardContent>
            </Card>
          ) : null} {/* Render null if not loading and no summary */}

          {/* Learning Paths */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-brand-orange" />
                  Learning Paths
                </CardTitle>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedSubject("all");
                      setSelectedDifficulty("all");
                      setActiveTab("all");
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    Reset Filters
                  </Button>
                </div>
              </div>

              <CardDescription>
                Explore learning paths tailored to your educational journey
              </CardDescription>

              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-2">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="all">All Paths</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="not_started">Not Started</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search learning paths..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-3.5 w-3.5 mr-1" />
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.filter(s => s !== "all").map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-3.5 w-3.5 mr-1" />
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isLoadingData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="h-48 animate-pulse bg-slate-100"></Card>
                  ))}
                </div>
              ) : filteredPaths.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                  <h3 className="text-lg font-medium text-slate-700">No learning paths found</h3>
                  <p className="text-slate-500 mt-1">
                    {searchQuery || selectedSubject !== "all" || selectedDifficulty !== "all"
                      ? "Try adjusting your filters or search term."
                      : "No learning paths are available at the moment."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                  {filteredPaths.map((path) => (
                    <LearningPathCard
                      key={path.id}
                      path={path}
                      onStart={handleStartPath}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (1/3 width) */}
        <div className="space-y-6">
          {/* Recommendations */}
          {isLoadingData ? (
            <Card>
              <CardContent className="p-6 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
              </CardContent>
            </Card>
          ) : (
            <Recommendations
              recommendations={recommendations}
              onRefresh={refreshRecommendations} // Use the specific refresh function
            />
          )}

          {/* Achievements */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Award className="h-5 w-5 mr-2 text-purple-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>

            <CardContent>
              {isLoadingData ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 animate-pulse bg-slate-100 rounded-lg"></div>
                  ))}
                </div>
              ) : achievements.filter(a => a.is_unlocked).length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <Award className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p>No achievements unlocked yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => router.push('/dashboard/student-hub/learning-path/achievements')}
                  >
                    View All Achievements
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements
                    .filter(a => a.is_unlocked)
                    .slice(0, 3)
                    .map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}

                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => router.push('/dashboard/student-hub/learning-path/achievements')}
                  >
                    View All Achievements
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                Learning Tips
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="font-medium text-slate-800 mb-1">Complete Skills Sequentially</p>
                  <p className="text-slate-600">Skills build upon each other. Complete them in order for the best learning experience.</p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="font-medium text-slate-800 mb-1">Track Your Progress</p>
                  <p className="text-slate-600">Regularly check your progress dashboard to see how far you've come and what's next.</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="font-medium text-slate-800 mb-1">Earn Achievements</p>
                  <p className="text-slate-600">Unlock achievements to track your milestones and stay motivated on your learning journey.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
