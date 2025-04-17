"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Video, Play, CheckCircle, Clock } from "lucide-react";

export function LearnWithVideos() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Video className="h-5 w-5 mr-2" />
                Learn with Videos
              </CardTitle>
              <CardDescription>Watch educational videos with interactive questions</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div>
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="p4">Primary 4</SelectItem>
                    <SelectItem value="p5">Primary 5</SelectItem>
                    <SelectItem value="p6">Primary 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="icon" className="rounded-full h-12 w-12">
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <Badge>5:32</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">Understanding Fractions</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>Mathematics</span>
                        <span className="mx-2">•</span>
                        <span>Primary 4</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      Watched
                    </Badge>
                  </div>
                  <Progress value={100} className="h-1 mt-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="icon" className="rounded-full h-12 w-12">
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <Badge>7:15</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">The Water Cycle</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>Science</span>
                        <span className="mx-2">•</span>
                        <span>Primary 4</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      In Progress
                    </Badge>
                  </div>
                  <Progress value={45} className="h-1 mt-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="icon" className="rounded-full h-12 w-12">
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <Badge>6:48</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">Parts of Speech</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>English</span>
                        <span className="mx-2">•</span>
                        <span>Primary 5</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <Play className="h-3 w-3 mr-1" />
                      Not Started
                    </Badge>
                  </div>
                  <Progress value={0} className="h-1 mt-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="icon" className="rounded-full h-12 w-12">
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <Badge>8:22</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">Ghana's Independence</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>Social Studies</span>
                        <span className="mx-2">•</span>
                        <span>Primary 6</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <Play className="h-3 w-3 mr-1" />
                      Not Started
                    </Badge>
                  </div>
                  <Progress value={0} className="h-1 mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
