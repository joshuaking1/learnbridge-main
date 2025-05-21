"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, GraduationCap } from "lucide-react";

export function RoleSelection() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [school, setSchool] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoaded) {
    return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const handleSubmit = async () => {
    if (!role) {
      setError("Please select a role");
      return;
    }

    if (!school.trim()) {
      setError("Please enter your school name");
      return;
    }

    if (!location.trim()) {
      setError("Please enter your location");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Set the role and additional info in the user's metadata
      await signUp.update({
        unsafeMetadata: {
          role,
          school,
          location
        },
        publicMetadata: {
          role,
          school,
          location
        },
      });

      // Complete the sign-up process
      await setActive({ session: signUp.createdSessionId });
    } catch (err) {
      console.error("Error setting user data:", err);
      setError("Failed to set user data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Choose your role and provide additional information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Select Your Role</h3>
          <RadioGroup
            value={role}
            onValueChange={(value) => setRole(value as "student" | "teacher")}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="student" id="student" />
              <Label htmlFor="student" className="flex items-center cursor-pointer">
                <GraduationCap className="h-5 w-5 mr-2" />
                <div>
                  <div className="font-medium">Student</div>
                  <div className="text-sm text-gray-500">Access learning materials and quizzes</div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="teacher" id="teacher" />
              <Label htmlFor="teacher" className="flex items-center cursor-pointer">
                <BookOpen className="h-5 w-5 mr-2" />
                <div>
                  <div className="font-medium">Teacher</div>
                  <div className="text-sm text-gray-500">Create content and manage classes</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="school">School Name</Label>
            <input
              id="school"
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter your school name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter your location"
            />
          </div>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          className="w-full bg-brand-orange hover:bg-brand-orange/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up your account...
            </>
          ) : (
            "Complete Registration"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
