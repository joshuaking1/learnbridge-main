"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "@/hooks/use-toast";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  GraduationCap, 
  BookOpen, 
  Award, 
  ArrowLeft,
  Clock,
  CheckCircle2,
  BarChart,
  Zap,
  Info
} from "lucide-react";
import { SkillCard } from "@/components/learning-path/SkillCard";
import { learningPathService } from "@/services/learningPathService";
import { LearningPath, Skill } from "@/types/learning-path";

interface LearningPathDetailPageProps {
  params: {
    id: string;
  };
}

export default function LearningPathDetailPage({ params }: LearningPathDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);
  
  // State for learning path
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isLoadingPath, setIsLoadingPath] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
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
  
  // Fetch learning path
  useEffect(() => {
    if (hasMounted && isAuthenticated && token && params.id) {
      const fetchLearningPath = async () => {
        setIsLoadingPath(true);
        try {
          const pathId = parseInt(params.id);
          if (isNaN(pathId)) {
            throw new Error("Invalid learning path ID");
          }
          
          const path = await learningPathService.getPathById(token, pathId);
          setLearningPath(path);
        } catch (error) {
          console.error("Error fetching learning path:", error);
          toast({ 
            title: "Error", 
            description: "Failed to load learning path. Please try again later.", 
            variant: "destructive" 
          });
        } finally {
          setIsLoadingPath(false);
        }
      };
      
      fetchLearningPath();
    }
  }, [hasMounted, isAuthenticated, token, params.id, toast]);
  
  // Handle start skill
  const handleStartSkill = async (skillId: number) => {
    if (!token) return;
    
    try {
      await learningPathService.startSkill(token, skillId);
      
      // Update the skill status in the state
      if (learningPath && learningPath.skills) {
        setLearningPath({
          ...learningPath,
          skills: learningPath.skills.map(skill => 
            skill.id === skillId 
              ? { ...skill, status: "in_progress", progress_percentage: 0 } 
              : skill
          )
        });
      }
      
      toast({
        title: "Skill Started",
        description: "You've successfully started this skill.",
      });
      
      // Navigate to the skill detail page
      router.push(`/dashboard/student-hub/learning-path/skill/${skillId}`);
    } catch (error) {
      console.error("Error starting skill:", error);
      toast({
        title: "Error",
        description: "Failed to start skill. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle complete skill
  const handleCompleteSkill = async (skillId: number) => {
    if (!token) return;
    
    try {
      await learningPathService.completeSkill(token, skillId);
      
      // Update the skill status in the state
      if (learningPath && learningPath.skills) {
        const updatedSkills = learningPath.skills.map(skill => 
          skill.id === skillId 
            ? { ...skill, status: "completed", progress_percentage: 100 } 
            : skill
        );
        
        // Calculate new completed skills count
        const completedSkills = updatedSkills.filter(skill => 
          skill.status === "completed" || skill.status === "mastered"
        ).length;
        
        // Calculate new progress percentage
        const totalSkills = updatedSkills.length;
        const progressPercentage = Math.round((completedSkills / totalSkills) * 100);
        
        setLearningPath({
          ...learningPath,
          skills: updatedSkills,
          completed_skills: completedSkills,
          progress_percentage: progressPercentage,
          status: progressPercentage >= 100 ? "completed" : "in_progress"
        });
      }
      
      toast({
        title: "Skill Completed",
        description: "You've successfully completed this skill.",
      });
    } catch (error) {
      console.error("Error completing skill:", error);
      toast({
        title: "Error",
        description: "Failed to complete skill. Please try again.",
        variant: "destructive"
      });
    }
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
  
  // Check if a skill is locked
  const isSkillLocked = (skill: Skill, skills: Skill[]) => {
    // If the skill has no prerequisites, it's not locked
    if (!skill.prerequisites || skill.prerequisites.length === 0) {
      return false;
    }
    
    // Check if all prerequisites are completed
    return !skill.prerequisites.every(prereqId => {
      const prereq = skills.find(s => s.id === prereqId);
      return prereq && (prereq.status === "completed" || prereq.status === "mastered");
    });
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
    <DashboardShell>
      <DashboardHeader
        heading={isLoadingPath ? "Loading..." : learningPath?.title || "Learning Path"}
        description={isLoadingPath ? "" : learningPath?.subject || ""}
        icon={GraduationCap}
      >
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/dashboard/student-hub/learning-path')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Learning Paths
        </Button>
      </DashboardHeader>
      
      {isLoadingPath ? (
        <Card>
          <CardContent className="p-6 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
          </CardContent>
        </Card>
      ) : !learningPath ? (
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-700">Learning Path Not Found</h3>
            <p className="text-slate-500 mt-1 mb-4">
              The learning path you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.push('/dashboard/student-hub/learning-path')}>
              View All Learning Paths
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Learning Path Header Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column - Path Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className={getDifficultyColor(learningPath.difficulty)}>
                      {learningPath.difficulty.charAt(0).toUpperCase() + learningPath.difficulty.slice(1)}
                    </Badge>
                    
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {learningPath.subject}
                    </Badge>
                    
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      {learningPath.grade_level}
                    </Badge>
                    
                    {learningPath.status === 'completed' && (
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{learningPath.title}</h2>
                  
                  {learningPath.description && (
                    <p className="text-slate-600 mb-4">{learningPath.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatEstimatedTime(learningPath.estimated_hours)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{learningPath.total_skills} skills</span>
                    </div>
                    
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span>{learningPath.completed_skills} completed</span>
                    </div>
                    
                    {learningPath.started_at && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Started: {new Date(learningPath.started_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Column - Progress */}
                <div className="md:w-64 flex flex-col">
                  <div className="text-center mb-2">
                    <div className="text-3xl font-bold text-brand-orange">{learningPath.progress_percentage}%</div>
                    <div className="text-sm text-slate-500">Completed</div>
                  </div>
                  
                  <Progress value={learningPath.progress_percentage} className="h-2 mb-4" />
                  
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <div className="text-lg font-semibold text-slate-800">{learningPath.total_skills}</div>
                      <div className="text-xs text-slate-500">Total Skills</div>
                    </div>
                    
                    <div className="bg-green-50 p-2 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">{learningPath.completed_skills}</div>
                      <div className="text-xs text-slate-500">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs for Overview and Skills */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Progress Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-brand-orange" />
                    Your Progress
                  </CardTitle>
                  <CardDescription>
                    Track your progress through this learning path
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <div className="text-sm text-slate-500">Overall Progress</div>
                      <div className="text-sm font-medium">{learningPath.progress_percentage}%</div>
                    </div>
                    <Progress value={learningPath.progress_percentage} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-slate-50 border-slate-200">
                      <CardContent className="p-4 text-center">
                        <BookOpen className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                        <div className="text-2xl font-bold text-slate-800">{learningPath.total_skills}</div>
                        <div className="text-sm text-slate-500">Total Skills</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-amber-50 border-amber-200">
                      <CardContent className="p-4 text-center">
                        <Zap className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                        <div className="text-2xl font-bold text-slate-800">
                          {learningPath.skills?.filter(s => s.status === "in_progress").length || 0}
                        </div>
                        <div className="text-sm text-slate-500">In Progress</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4 text-center">
                        <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                        <div className="text-2xl font-bold text-slate-800">{learningPath.completed_skills}</div>
                        <div className="text-sm text-slate-500">Completed</div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
              
              {/* Next Skills Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-amber-500" />
                    Next Skills
                  </CardTitle>
                  <CardDescription>
                    Continue your learning journey with these skills
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learningPath.skills
                      ?.filter(skill => skill.status === "not_started" || skill.status === "in_progress")
                      .slice(0, 4)
                      .map(skill => (
                        <SkillCard 
                          key={skill.id} 
                          skill={skill} 
                          isLocked={isSkillLocked(skill, learningPath.skills || [])}
                          onStart={handleStartSkill}
                          onComplete={handleCompleteSkill}
                        />
                      ))}
                    
                    {(!learningPath.skills || 
                      learningPath.skills.filter(skill => 
                        skill.status === "not_started" || skill.status === "in_progress"
                      ).length === 0) && (
                      <div className="col-span-2 text-center py-6">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-green-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-700">All Skills Completed!</h3>
                        <p className="text-slate-500 mt-1">
                          You've completed all skills in this learning path.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab("skills")}
                  >
                    View All Skills
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-brand-orange" />
                    Skills ({learningPath.total_skills})
                  </CardTitle>
                  <CardDescription>
                    Master these skills to complete the learning path
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learningPath.skills?.map(skill => (
                      <SkillCard 
                        key={skill.id} 
                        skill={skill} 
                        isLocked={isSkillLocked(skill, learningPath.skills || [])}
                        onStart={handleStartSkill}
                        onComplete={handleCompleteSkill}
                      />
                    ))}
                    
                    {(!learningPath.skills || learningPath.skills.length === 0) && (
                      <div className="col-span-2 text-center py-6">
                        <Info className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-700">No Skills Available</h3>
                        <p className="text-slate-500 mt-1">
                          This learning path doesn't have any skills yet.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-brand-orange" />
                    Learning Resources
                  </CardTitle>
                  <CardDescription>
                    Additional resources to help you master this learning path
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {/* Collect all resources from all skills */}
                  {learningPath.skills && learningPath.skills.some(skill => skill.resources.length > 0) ? (
                    <div className="space-y-4">
                      {learningPath.skills
                        .filter(skill => skill.resources.length > 0)
                        .map(skill => (
                          <div key={skill.id} className="border rounded-lg p-4">
                            <h3 className="font-medium text-slate-800 mb-2">{skill.title}</h3>
                            <div className="space-y-2">
                              {skill.resources.map(resource => (
                                <div key={resource.id} className="flex items-start p-2 bg-slate-50 rounded-md">
                                  {resource.resource_type === 'video' && (
                                    <div className="bg-red-100 p-2 rounded-md mr-3">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                      </svg>
                                    </div>
                                  )}
                                  
                                  {resource.resource_type === 'book' && (
                                    <div className="bg-blue-100 p-2 rounded-md mr-3">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                      </svg>
                                    </div>
                                  )}
                                  
                                  {resource.resource_type === 'article' && (
                                    <div className="bg-green-100 p-2 rounded-md mr-3">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                  
                                  {resource.resource_type === 'quiz' && (
                                    <div className="bg-purple-100 p-2 rounded-md mr-3">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                  
                                  {resource.resource_type === 'exercise' && (
                                    <div className="bg-amber-100 p-2 rounded-md mr-3">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                  
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{resource.title}</div>
                                    {resource.description && (
                                      <div className="text-xs text-slate-500">{resource.description}</div>
                                    )}
                                  </div>
                                  
                                  {resource.content_url && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="ml-2"
                                      onClick={() => window.open(resource.content_url, '_blank')}
                                    >
                                      View
                                    </Button>
                                  )}
                                  
                                  {resource.book_id && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="ml-2"
                                      onClick={() => router.push('/dashboard/student-hub/book-reader')}
                                    >
                                      Open Book
                                    </Button>
                                  )}
                                  
                                  {resource.quiz_id && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="ml-2"
                                      onClick={() => router.push('/dashboard/student-hub/quizzes')}
                                    >
                                      Take Quiz
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                      <h3 className="text-lg font-medium text-slate-700">No Resources Available</h3>
                      <p className="text-slate-500 mt-1">
                        This learning path doesn't have any additional resources yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </DashboardShell>
  );
}
