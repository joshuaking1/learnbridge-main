"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Compass, Lightbulb, Map, Camera } from "lucide-react";

export function ExploreDiscover() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Compass className="h-5 w-5 mr-2" />
          Explore & Discover
        </CardTitle>
        <CardDescription>Broaden your horizons beyond textbooks</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="facts">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="facts">Did You Know?</TabsTrigger>
            <TabsTrigger value="fieldtrips">Field Trips</TabsTrigger>
            <TabsTrigger value="ghana">Discover Ghana</TabsTrigger>
          </TabsList>
          <TabsContent value="facts" className="p-4">
            <div className="text-center py-8">
              <Lightbulb className="h-16 w-16 mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Did You Know?</h3>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="italic">
                  "Ghana is home to Lake Volta, the largest artificial lake in the world by surface area. It was created by the Akosombo Dam, which provides electricity for much of the country."
                </p>
              </div>
              <Button>Get Another Fact</Button>
            </div>
          </TabsContent>
          <TabsContent value="fieldtrips" className="p-4">
            <div className="text-center py-8">
              <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Virtual Field Trips</h3>
              <p className="text-muted-foreground mb-4">
                Explore interesting places without leaving your classroom
              </p>
              <Button>Browse Field Trips</Button>
            </div>
          </TabsContent>
          <TabsContent value="ghana" className="p-4">
            <div className="text-center py-8">
              <Map className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Discover Ghana</h3>
              <p className="text-muted-foreground mb-4">
                Learn about the geography, culture, and history of Ghana
              </p>
              <Button>Explore Ghana</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
