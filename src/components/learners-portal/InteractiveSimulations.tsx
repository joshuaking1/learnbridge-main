"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Beaker, Calculator, Utensils } from "lucide-react";

export function InteractiveSimulations() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gamepad2 className="h-5 w-5 mr-2" />
            Interactive Simulations
          </CardTitle>
          <CardDescription>Experiment and learn with interactive tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                  <Beaker className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Water Cycle Simulation</h3>
                    <Badge>Science</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore how water moves through our environment in this interactive simulation.
                  </p>
                  <Button className="w-full">Launch Simulation</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                  <Calculator className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Geometric Shapes Explorer</h3>
                    <Badge>Mathematics</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Build and explore 2D and 3D shapes with this interactive tool.
                  </p>
                  <Button className="w-full">Launch Simulation</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                  <Utensils className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Build a Healthy Meal</h3>
                    <Badge>Health</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop foods to create a balanced meal and learn about nutrition.
                  </p>
                  <Button className="w-full">Launch Simulation</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                  <Beaker className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Simple Machines</h3>
                    <Badge>Science</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn about levers, pulleys, and inclined planes with interactive examples.
                  </p>
                  <Button className="w-full">Launch Simulation</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
