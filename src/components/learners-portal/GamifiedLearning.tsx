"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomProgress as Progress } from "@/components/ui/custom-progress";
import { SimpleTabs } from "@/components/ui/simple-tabs";
import { SimpleSelect } from "@/components/ui/simple-select";
import { Label } from "@/components/ui/label";
import { Loader2, Star, Trophy, Award, Gift, Zap, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Removed Dialog import to avoid dependency issues

interface Mission {
  id: number;
  title: string;
  description: string;
  subject: string;
  grade: string;
  strand: string;
  points: number;
  mission_type: string;
  completed: boolean;
  completed_at: string | null;
  score: number | null;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  image_path: string;
  points_required: number;
}

interface LeaderboardEntry {
  id: string;
  first_name: string;
  points: number;
}

export function GamifiedLearning() {
  const { token } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [points, setPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [subject, setSubject] = useState("all");
  const [grade, setGrade] = useState("all");
  const [lastDailySpin, setLastDailySpin] = useState<Date | null>(null);
  const [canSpin, setCanSpin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<{ type: string; value: number } | null>(null);
  const [showSpinResult, setShowSpinResult] = useState(false);

  const subjects = [
    "all",
    "Mathematics",
    "English",
    "Science",
    "Social Studies",
    "Creative Arts",
    "Religious and Moral Education",
    "Computing",
    "Ghanaian Language",
  ];

  const grades = [
    "all",
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
    "JHS 1",
    "JHS 2",
    "JHS 3",
  ];

  useEffect(() => {
    if (!token) return;
    fetchGamificationProfile();
    fetchLeaderboard();
    fetchMissions();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchMissions();
  }, [subject, grade, token]);

  useEffect(() => {
    // Check if user can spin today
    if (lastDailySpin) {
      const lastSpinDate = new Date(lastDailySpin);
      const today = new Date();
      setCanSpin(lastSpinDate.toDateString() !== today.toDateString());
    } else {
      setCanSpin(true);
    }
  }, [lastDailySpin]);

  const fetchGamificationProfile = async () => {
    setIsLoading(true);
    try {
      // Mock data for now
      const mockProfile = {
        points: 125,
        badges: [
          {
            id: 1,
            name: "Beginner",
            description: "You've started your learning journey!",
            image_path: "/images/badges/beginner.png",
            points_required: 0
          },
          {
            id: 2,
            name: "Explorer",
            description: "You've earned 50 points",
            image_path: "/images/badges/explorer.png",
            points_required: 50
          },
          {
            id: 3,
            name: "Scholar",
            description: "You've earned 100 points",
            image_path: "/images/badges/scholar.png",
            points_required: 100
          }
        ],
        lastDailySpin: new Date(new Date().setDate(new Date().getDate() - 1))
      };

      setPoints(mockProfile.points);
      setBadges(mockProfile.badges);
      setLastDailySpin(mockProfile.lastDailySpin);

      // Uncomment when backend is ready
      /*
      const response = await fetch("http://localhost:3007/api/learners-portal/gamification/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPoints(data.points);
        setBadges(data.badges);
        setLastDailySpin(data.lastDailySpin ? new Date(data.lastDailySpin) : null);
      }
      */
    } catch (error) {
      console.error("Error fetching gamification profile:", error);
      toast({
        title: "Error",
        description: "Failed to load your gamification profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // Mock leaderboard data
      const mockLeaderboard = [
        { id: "1", first_name: "Kofi", points: 250 },
        { id: "2", first_name: "Ama", points: 220 },
        { id: "3", first_name: "Kwame", points: 180 },
        { id: "4", first_name: "Akua", points: 175 },
        { id: "5", first_name: "Yaw", points: 150 },
        { id: "6", first_name: "Abena", points: 145 },
        { id: "7", first_name: "Kwesi", points: 130 },
        { id: "8", first_name: "Adwoa", points: 125 },
        { id: "9", first_name: "Kojo", points: 110 },
        { id: "10", first_name: "Efua", points: 100 }
      ];

      setLeaderboard(mockLeaderboard);

      // Uncomment when backend is ready
      /*
      const response = await fetch("http://localhost:3007/api/learners-portal/gamification/leaderboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
      */
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const fetchMissions = async () => {
    try {
      // For now, use mock data since the backend might not be fully set up
      const mockMissions = [
        {
          id: 1,
          title: "Water Cycle Explorer",
          description: "Complete the interactive water cycle simulation and answer questions.",
          subject: "Science",
          grade: "Primary 4",
          strand: "Earth Science",
          points: 15,
          mission_type: "simulation",
          completed: false
        },
        {
          id: 2,
          title: "Fraction Master",
          description: "Complete the fractions quiz with at least 80% accuracy.",
          subject: "Mathematics",
          grade: "Primary 4",
          strand: "Fractions",
          points: 10,
          mission_type: "quiz",
          completed: true,
          completed_at: new Date().toISOString(),
          score: 90
        },
        {
          id: 3,
          title: "Ghana's Independence",
          description: "Read the story about Ghana's independence and answer the questions.",
          subject: "Social Studies",
          grade: "Primary 6",
          strand: "History",
          points: 20,
          mission_type: "lesson",
          completed: false
        },
        {
          id: 4,
          title: "Creative Writing Challenge",
          description: "Write a short story about your favorite Ghanaian festival.",
          subject: "English",
          grade: "Primary 5",
          strand: "Creative Writing",
          points: 25,
          mission_type: "creative",
          completed: false
        }
      ];

      // Filter missions based on subject and grade
      let filteredMissions = mockMissions;
      if (subject && subject !== "all") {
        filteredMissions = filteredMissions.filter(m => m.subject === subject);
      }
      if (grade && grade !== "all") {
        filteredMissions = filteredMissions.filter(m => m.grade === grade);
      }

      setMissions(filteredMissions);

      // Uncomment this when the backend is ready
      /*
      let url = "http://localhost:3007/api/learners-portal/gamification/missions";

      // Add query parameters if subject or grade is selected
      const params = new URLSearchParams();
      if (subject && subject !== "all") params.append("subject", subject);
      if (grade && grade !== "all") params.append("grade", grade);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMissions(data);
      }
      */
    } catch (error) {
      console.error("Error fetching missions:", error);
    }
  };

  const handleDailySpin = async () => {
    if (!canSpin || !token) return;

    setIsSpinning(true);
    try {
      // Mock daily spin result
      const mockReward = { type: 'points', value: Math.floor(Math.random() * 46) + 5 }; // Random between 5-50

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSpinResult(mockReward);
      setShowSpinResult(true);
      setCanSpin(false);
      setLastDailySpin(new Date());
      setPoints((prev) => prev + mockReward.value);

      toast({
        title: "Daily Spin Complete!",
        description: `You won ${mockReward.value} points!`,
      });

      // Uncomment when backend is ready
      /*
      const response = await fetch("http://localhost:3007/api/learners-portal/gamification/daily-spin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSpinResult(data.reward);
        setShowSpinResult(true);
        setCanSpin(false);
        setLastDailySpin(new Date());
        setPoints((prev) => prev + data.reward.value);

        toast({
          title: "Daily Spin Complete!",
          description: `You won ${data.reward.value} points!`,
        });
      }
      */
    } catch (error) {
      console.error("Error with daily spin:", error);
      toast({
        title: "Error",
        description: "Failed to process your daily spin. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSpinning(false);
    }
  };

  const startMission = (mission: Mission) => {
    // In a real implementation, this would navigate to the mission
    // For now, we'll just show a toast
    toast({
      title: "Mission Started",
      description: `You've started the mission: ${mission.title}`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Learning Journey</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="flex items-center">
                  <Star className="h-3 w-3 mr-1 text-amber-500" />
                  <span>{points} Points</span>
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  <Trophy className="h-3 w-3 mr-1 text-purple-500" />
                  <span>{badges.length} Badges</span>
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>Complete missions to earn points and badges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject-filter">Subject</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger id="subject-filter">
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subj) => (
                          <SelectItem key={subj} value={subj}>
                            {subj === "all" ? "All Subjects" : subj}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="grade-filter">Grade</Label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger id="grade-filter">
                        <SelectValue placeholder="All Grades" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g === "all" ? "All Grades" : g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleDailySpin}
                  disabled={!canSpin || isSpinning}
                >
                  {isSpinning ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Gift className="h-4 w-4 mr-2" />
                  )}
                  Daily Spin {!canSpin && "(Come back tomorrow)"}
                </Button>

                {/* Simple modal for spin result */}
                {showSpinResult && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4 relative">
                      <button
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        onClick={() => setShowSpinResult(false)}
                      >
                        ✕
                      </button>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Daily Spin Result</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Congratulations on your daily spin reward!
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center py-6">
                        <div className="bg-amber-100 text-amber-800 rounded-full p-8 mb-4">
                          <Star className="h-16 w-16 text-amber-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                          You won {spinResult?.value} points!
                        </h3>
                        <p className="text-muted-foreground">
                          Come back tomorrow for another chance to win!
                        </p>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button onClick={() => setShowSpinResult(false)}>Close</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {missions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No missions available for the selected filters. Try changing your subject or grade.
                    </p>
                  ) : (
                    missions.map((mission) => (
                      <Card key={mission.id} className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <div className="flex-grow p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold">{mission.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {mission.description}
                                </p>
                              </div>
                              <Badge variant={mission.completed ? "secondary" : "outline"}>
                                {mission.mission_type}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline">{mission.subject}</Badge>
                              <Badge variant="outline">{mission.grade}</Badge>
                              {mission.strand && (
                                <Badge variant="outline">{mission.strand}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="bg-muted p-4 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 sm:gap-4">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-amber-500" />
                              <span>{mission.points} pts</span>
                            </div>
                            <Button
                              variant={mission.completed ? "secondary" : "default"}
                              size="sm"
                              onClick={() => startMission(mission)}
                              disabled={mission.completed}
                            >
                              {mission.completed ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4 mr-1" />
                                  Start
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Top 10 learners by points</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-300"
                            : index === 2
                            ? "bg-amber-700"
                            : "bg-muted-foreground"
                        }`}
                      >
                        <span className="text-xs font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium">{entry.first_name}</span>
                    </div>
                    <Badge variant="secondary">{entry.points} pts</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Badges</CardTitle>
            <CardDescription>Achievements you've unlocked</CardDescription>
          </CardHeader>
          <CardContent>
            {badges.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Complete missions to earn your first badge!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-2 rounded-md bg-muted"
                  >
                    <Award className="h-8 w-8 text-primary mb-1" />
                    <span className="text-sm font-medium text-center">
                      {badge.name}
                    </span>
                    <span className="text-xs text-muted-foreground text-center">
                      {badge.description}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
