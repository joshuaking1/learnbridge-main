"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Lock, Unlock, ChevronRight } from "lucide-react";

export function StoryMode() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Story Mode
              </CardTitle>
              <CardDescription>Learn through engaging stories</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Progress:</span>
              <Progress value={25} className="w-[100px]" />
              <span className="text-sm">25%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">Chapter 1: The Journey Begins</h3>
                      <p className="text-sm text-muted-foreground">
                        Meet Ama and Kofi as they start their adventure
                      </p>
                    </div>
                    <Badge variant="secondary" className="flex items-center">
                      <Unlock className="h-3 w-3 mr-1" />
                      Unlocked
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Badge>Social Studies</Badge>
                    <Button size="sm">
                      Read Chapter
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">Chapter 2: The Ancient Kingdom</h3>
                      <p className="text-sm text-muted-foreground">
                        Discover the history of Ghana's ancient kingdoms
                      </p>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Badge>Social Studies</Badge>
                    <Button size="sm" variant="outline" disabled>
                      Complete Chapter 1 First
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">Chapter 1: The Math Mystery</h3>
                      <p className="text-sm text-muted-foreground">
                        Help solve a mystery using math skills
                      </p>
                    </div>
                    <Badge variant="secondary" className="flex items-center">
                      <Unlock className="h-3 w-3 mr-1" />
                      Unlocked
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Badge>Mathematics</Badge>
                    <Button size="sm">
                      Read Chapter
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">Chapter 2: The Pattern Palace</h3>
                      <p className="text-sm text-muted-foreground">
                        Explore patterns and sequences in the Pattern Palace
                      </p>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Badge>Mathematics</Badge>
                    <Button size="sm" variant="outline" disabled>
                      Complete Chapter 1 First
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">View All Stories</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
