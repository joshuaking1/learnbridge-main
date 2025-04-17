"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Upload, Image, Mic, FileText } from "lucide-react";

export function CreativeCorner() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Creative Corner
        </CardTitle>
        <CardDescription>Express what you've learned through art, recordings, or writing</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gallery">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
          </TabsList>
          <TabsContent value="gallery" className="p-4">
            <div className="text-center py-8">
              <Image className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Creative Gallery</h3>
              <p className="text-muted-foreground mb-4">
                See what other students have created and shared
              </p>
              <Button>Browse Gallery</Button>
            </div>
          </TabsContent>
          <TabsContent value="create" className="p-4">
            <div className="text-center py-8">
              <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Create Something New</h3>
              <p className="text-muted-foreground mb-4">
                Upload artwork, record audio, or write a story
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2">
                <Button variant="outline">
                  <Image className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <Button variant="outline">
                  <Mic className="h-4 w-4 mr-2" />
                  Record Audio
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Write Text
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="prompts" className="p-4">
            <div className="text-center py-8">
              <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Creative Prompts</h3>
              <p className="text-muted-foreground mb-4">
                Get inspiration for your creative projects
              </p>
              <Button>View Prompts</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
