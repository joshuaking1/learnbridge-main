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
import { Slider } from "@/components/ui/slider";
import { 
  Loader2, 
  Zap, 
  BookOpen, 
  ArrowLeft,
  Clock,
  CheckCircle2,
  Award,
  Video,
  FileText,
  PenTool,
  ArrowRight,
  Star
} from "lucide-react";
import { learningPathService } from "@/services/learningPathService";
import { Skill, SkillResource } from "@/types/learning-path";

interface SkillDetailPageProps {
  params: {
    id: string;
  };
}

export default function SkillDetailPage({ params }: SkillDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { token, isAuthenticated, isLoading: isLoadingAuth } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);
  
  // State for skill
  const [skill, setSkill] = useState<Skill | null>(null);
  const [isLoadingSkill, setIsLoadingSkill] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [progressValue, setProgressValue] = useState(0);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  
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
  
  // Fetch skill
  useEffect(() => {
    if (hasMounted && isAuthenticated && token && params.id) {
      const fetchSkill = async () => {
        setIsLoadingSkill(true);
        try {
          const skillId = parseInt(params.id);
          if (isNaN(skillId)) {
            throw new Error("Invalid skill ID");
          }
          
          const skill = await learningPathService.getSkillById(token, skillId);
          setSkill(skill);
          setProgressValue(skill.progress_percentage);
        } catch (error) {
          console.error("Error fetching skill:", error);
          toast({ 
            title: "Error", 
            description: "Failed to load skill. Please try again later.", 
            variant: "destructive" 
          });
        } finally {
          setIsLoadingSkill(false);
        }
      };
      
      fetchSkill();
    }
  }, [hasMounted, isAuthenticated, token, params.id, toast]);
  
  // Handle start skill
  const handleStartSkill = async () => {
    if (!token || !skill) return;
    
    try {
      await learningPathService.startSkill(token, skill.id);
      
      // Update the skill status in the state
      setSkill({
        ...skill,
        status: "in_progress",
        progress_percentage: 0
      });
      
      setProgressValue(0);
      
      toast({
        title: "Skill Started",
        description: "You've successfully started this skill.",
      });
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
  const handleCompleteSkill = async () => {
    if (!token || !skill) return;
    
    try {
      await learningPathService.completeSkill(token, skill.id);
      
      // Update the skill status in the state
      setSkill({
        ...skill,
        status: "completed",
        progress_percentage: 100,
        points_earned: skill.points
      });
      
      setProgressValue(100);
      
      toast({
        title: "Skill Completed",
        description: `You've successfully completed this skill and earned ${skill.points} points!`,
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
  
  // Handle update progress
  const handleUpdateProgress = async () => {
    if (!token || !skill) return;
    
    setIsSavingProgress(true);
    
    try {
      await learningPathService.updateSkillProgress(token, skill.id, progressValue);
      
      // Update the skill status in the state
      const newStatus = progressValue >= 100 ? "completed" : "in_progress";
      const newPointsEarned = progressValue >= 100 ? skill.points : Math.floor((progressValue / 100) * skill.points);
      
      setSkill({
        ...skill,
        status: newStatus,
        progress_percentage: progressValue,
        points_earned: newPointsEarned
      });
      
      toast({
        title: "Progress Updated",
        description: `Your progress has been updated to ${progressValue}%.`,
      });
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingProgress(false);
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
  
  // Get resource icon
  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'book':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'article':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'quiz':
        return <PenTool className="h-5 w-5 text-purple-500" />;
      case 'exercise':
        return <PenTool className="h-5 w-5 text-amber-500" />;
      default:
        return <FileText className="h-5 w-5 text-slate-500" />;
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
    <DashboardShell>
      <DashboardHeader
        heading={isLoadingSkill ? "Loading..." : skill?.title || "Skill"}
        description={isLoadingSkill ? "" : skill?.skill_type || ""}
        icon={Zap}
      >
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            if (skill?.learning_path_id) {
              router.push(`/dashboard/student-hub/learning-path/${skill.learning_path_id}`);
            } else {
              router.push('/dashboard/student-hub/learning-path');
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Learning Path
        </Button>
      </DashboardHeader>
      
      {isLoadingSkill ? (
        <Card>
          <CardContent className="p-6 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
          </CardContent>
        </Card>
      ) : !skill ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-700">Skill Not Found</h3>
            <p className="text-slate-500 mt-1 mb-4">
              The skill you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.push('/dashboard/student-hub/learning-path')}>
              View All Learning Paths
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Skill Header Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column - Skill Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="bg-slate-100 text-slate-800">
                      {skill.skill_type}
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
                  
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{skill.title}</h2>
                  
                  {skill.description && (
                    <p className="text-slate-600 mb-4">{skill.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatEstimatedTime(skill.estimated_minutes)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      <span>{skill.points} points</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="mr-1">Difficulty:</span>
                      <span className="inline-flex">{getDifficultyStars(skill.difficulty)}</span>
                    </div>
                    
                    {skill.started_at && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Started: {new Date(skill.started_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {skill.learning_path && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="text-sm text-slate-500 mb-1">Part of Learning Path:</div>
                      <div className="font-medium">{skill.learning_path.title}</div>
                      <div className="text-sm text-slate-500">{skill.learning_path.subject}</div>
                    </div>
                  )}
                </div>
                
                {/* Right Column - Progress */}
                <div className="md:w-64 flex flex-col">
                  <div className="text-center mb-2">
                    <div className="text-3xl font-bold text-brand-orange">{skill.progress_percentage}%</div>
                    <div className="text-sm text-slate-500">Completed</div>
                  </div>
                  
                  <Progress value={skill.progress_percentage} className="h-2 mb-4" />
                  
                  <div className="grid grid-cols-1 gap-2 text-center">
                    <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <div className="text-sm font-medium text-slate-700">Points Earned</div>
                      </div>
                      <div className="text-lg font-semibold text-yellow-600">{skill.points_earned} / {skill.points}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {skill.status === 'not_started' ? (
                      <Button 
                        className="w-full"
                        onClick={handleStartSkill}
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Start Skill
                      </Button>
                    ) : skill.status === 'in_progress' ? (
                      <Button 
                        className="w-full"
                        onClick={handleCompleteSkill}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark as Completed
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          if (skill.learning_path_id) {
                            router.push(`/dashboard/student-hub/learning-path/${skill.learning_path_id}`);
                          } else {
                            router.push('/dashboard/student-hub/learning-path');
                          }
                        }}
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Continue Learning Path
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs for Overview and Resources */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="track-progress">Track Progress</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-brand-orange" />
                    About This Skill
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {skill.description ? (
                    <div className="prose prose-slate max-w-none">
                      <p>{skill.description}</p>
                    </div>
                  ) : (
                    <p className="text-slate-500">No detailed description available for this skill.</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h3 className="font-medium text-slate-800 mb-2">What You'll Learn</h3>
                      <ul className="space-y-1 text-slate-600">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Master the core concepts of {skill.title}</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Apply your knowledge through practical exercises</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Build a strong foundation for advanced topics</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-medium text-slate-800 mb-2">Requirements</h3>
                      {skill.prerequisites && skill.prerequisites.length > 0 ? (
                        <div className="text-slate-600">
                          <p>Complete the following skills first:</p>
                          <ul className="list-disc list-inside mt-1">
                            {skill.prerequisites.map(prereqId => (
                              <li key={prereqId}>Skill #{prereqId}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-slate-600">No prerequisites required for this skill.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Resources Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                    Learning Resources
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  {skill.resources && skill.resources.length > 0 ? (
                    <div className="space-y-3">
                      {skill.resources.slice(0, 3).map(resource => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}
                      
                      {skill.resources.length > 3 && (
                        <Button 
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={() => setActiveTab("resources")}
                        >
                          View All Resources ({skill.resources.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                      <h3 className="text-lg font-medium text-slate-700">No Resources Available</h3>
                      <p className="text-slate-500 mt-1">
                        This skill doesn't have any learning resources yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                    Learning Resources
                  </CardTitle>
                  <CardDescription>
                    Resources to help you master this skill
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {skill.resources && skill.resources.length > 0 ? (
                    <div className="space-y-3">
                      {skill.resources.map(resource => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                      <h3 className="text-lg font-medium text-slate-700">No Resources Available</h3>
                      <p className="text-slate-500 mt-1">
                        This skill doesn't have any learning resources yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Track Progress Tab */}
            <TabsContent value="track-progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-brand-orange" />
                    Track Your Progress
                  </CardTitle>
                  <CardDescription>
                    Update your progress for this skill
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">Your Progress</div>
                      <div className="text-sm text-slate-500">{progressValue}%</div>
                    </div>
                    <Slider
                      value={[progressValue]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(value) => setProgressValue(value[0])}
                      disabled={skill.status === 'completed' || skill.status === 'mastered'}
                    />
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 25, 50, 75, 100].map(value => (
                      <Button
                        key={value}
                        variant="outline"
                        size="sm"
                        onClick={() => setProgressValue(value)}
                        disabled={skill.status === 'completed' || skill.status === 'mastered'}
                        className={progressValue === value ? "border-brand-orange text-brand-orange" : ""}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="font-medium text-slate-800 mb-2">Progress Guidelines</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start">
                        <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium mr-2">0%</span>
                        <span>Not started or just beginning</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-xs font-medium mr-2">25%</span>
                        <span>Started learning the basics</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 text-xs font-medium mr-2">50%</span>
                        <span>Halfway through the material</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs font-medium mr-2">75%</span>
                        <span>Most concepts understood, practicing application</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs font-medium mr-2">100%</span>
                        <span>Fully completed and mastered</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-4">
                  <Button 
                    className="w-full"
                    onClick={handleUpdateProgress}
                    disabled={
                      isSavingProgress || 
                      progressValue === skill.progress_percentage || 
                      skill.status === 'completed' || 
                      skill.status === 'mastered'
                    }
                  >
                    {isSavingProgress ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Save Progress
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </DashboardShell>
  );
}

// Resource Card Component
function ResourceCard({ resource }: { resource: SkillResource }) {
  const router = useRouter();
  
  // Get resource icon
  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'book':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'article':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'quiz':
        return <PenTool className="h-5 w-5 text-purple-500" />;
      case 'exercise':
        return <PenTool className="h-5 w-5 text-amber-500" />;
      default:
        return <FileText className="h-5 w-5 text-slate-500" />;
    }
  };
  
  // Get resource background color
  const getResourceBgColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return 'bg-red-50 border-red-100';
      case 'book':
        return 'bg-blue-50 border-blue-100';
      case 'article':
        return 'bg-green-50 border-green-100';
      case 'quiz':
        return 'bg-purple-50 border-purple-100';
      case 'exercise':
        return 'bg-amber-50 border-amber-100';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };
  
  return (
    <div className={`p-4 rounded-lg border ${getResourceBgColor(resource.resource_type)}`}>
      <div className="flex items-start">
        <div className="mr-3 mt-1">
          {getResourceIcon(resource.resource_type)}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-slate-800">{resource.title}</h3>
          {resource.description && (
            <p className="text-sm text-slate-600 mt-1">{resource.description}</p>
          )}
          
          <div className="mt-3 flex flex-wrap gap-2">
            {resource.content_url && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open(resource.content_url, '_blank')}
              >
                View Resource
              </Button>
            )}
            
            {resource.book_id && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => router.push('/dashboard/student-hub/book-reader')}
              >
                Open Book
              </Button>
            )}
            
            {resource.quiz_id && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => router.push('/dashboard/student-hub/quizzes')}
              >
                Take Quiz
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
