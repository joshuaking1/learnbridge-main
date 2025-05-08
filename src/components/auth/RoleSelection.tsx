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

    try {
      setIsSubmitting(true);
      setError(null);

      // Set the role in the user's metadata
      await signUp.update({
        unsafeMetadata: {
          role,
        },
        publicMetadata: {
          role,
        },
      });

      // Complete the sign-up process
      await setActive({ session: signUp.createdSessionId });
    } catch (err) {
      console.error("Error setting role:", err);
      setError("Failed to set role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Select Your Role</CardTitle>
        <CardDescription>
          Choose your role to personalize your experience
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                <div className="text-sm text-gray-500">Create content and manage students</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
        
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
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
            "Continue"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
