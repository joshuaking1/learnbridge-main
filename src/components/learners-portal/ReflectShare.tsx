"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Mic, Image, FileText, Calendar } from "lucide-react";

export function ReflectShare() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Pencil className="h-5 w-5 mr-2" />
          Reflect & Share
        </CardTitle>
        <CardDescription>Journal your thoughts and learning experiences</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Entry</TabsTrigger>
            <TabsTrigger value="journal">My Journal</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reflection-title">Title</Label>
                <Input id="reflection-title" placeholder="What I learned today..." />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reflection-type">Reflection Type</Label>
                <Select>
                  <SelectTrigger id="reflection-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="drawing">Drawing</SelectItem>
                    <SelectItem value="audio">Audio Recording</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reflection-subject">Subject (Optional)</Label>
                <Select>
                  <SelectTrigger id="reflection-subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="social-studies">Social Studies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reflection-content">Your Reflection</Label>
                <Textarea
                  id="reflection-content"
                  placeholder="Write about what you learned, what you found interesting, or what questions you still have..."
                  className="min-h-[150px]"
                />
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" className="flex items-center">
                  <Image className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Mic className="h-4 w-4 mr-2" />
                  Record Audio
                </Button>
                <Button>Save Reflection</Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="journal" className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Your Journal Entries</h3>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  View by Date
                </Button>
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">What I Learned About Photosynthesis</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <FileText className="h-3 w-3 mr-1" />
                          <span>Text Entry</span>
                          <span className="mx-2">•</span>
                          <span>Science</span>
                          <span className="mx-2">•</span>
                          <span>Today</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm mt-2">
                      Today I learned that plants make their own food through a process called photosynthesis. They use sunlight, water, and carbon dioxide to create glucose and oxygen...
                    </p>
                    <div className="flex justify-end mt-2">
                      <Button size="sm" variant="ghost">Read More</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">My Drawing of the Water Cycle</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Image className="h-3 w-3 mr-1" />
                          <span>Drawing</span>
                          <span className="mx-2">•</span>
                          <span>Science</span>
                          <span className="mx-2">•</span>
                          <span>Yesterday</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted aspect-video rounded-md flex items-center justify-center mt-2">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button size="sm" variant="ghost">View Full Size</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
