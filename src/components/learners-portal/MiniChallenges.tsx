"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Trophy, Clock, Calendar, CheckCircle } from "lucide-react";

export function MiniChallenges() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2" />
          Mini Challenges
        </CardTitle>
        <CardDescription>Weekly brain teasers and fun assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="p-4">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">This Week's Challenge</CardTitle>
                    <CardDescription>Ends in 3 days</CardDescription>
                  </div>
                  <Badge>Science</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium mb-2">Create a Water Cycle Poster</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Design a poster that shows the different stages of the water cycle. Be creative and use colors!
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1 text-amber-500" />
                    <span className="text-sm">20 points</span>
                  </div>
                  <Button size="sm">Start Challenge</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Daily Brain Teaser</CardTitle>
                    <CardDescription>New puzzle every day</CardDescription>
                  </div>
                  <Badge>Mathematics</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium mb-2">Number Puzzle</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  I am a number. If you multiply me by 3 and add 7, you get 22. What number am I?
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1 text-amber-500" />
                    <span className="text-sm">5 points</span>
                  </div>
                  <Button size="sm">Solve Puzzle</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="completed" className="p-4">
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Your Completed Challenges</h3>
              <p className="text-muted-foreground mb-4">
                You haven't completed any challenges yet. Start one from the Active tab!
              </p>
            </div>
          </TabsContent>
          <TabsContent value="leaderboard" className="p-4">
            <div className="text-center py-8">
              <Trophy className="h-16 w-16 mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Challenge Leaderboard</h3>
              <p className="text-muted-foreground mb-4">
                Complete challenges to appear on the leaderboard!
              </p>
              <Button>View Leaderboard</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
