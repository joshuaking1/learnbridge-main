"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, BookOpen, GraduationCap, CheckCircle, AlertCircle, MapPin, School } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function RoleSelection() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [school, setSchool] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Field validation states
  const [schoolError, setSchoolError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formValid, setFormValid] = useState(false);

  // Validate form on field changes
  useEffect(() => {
    // Validate school (at least 2 characters, no numbers)
    if (school.trim().length > 0 && school.trim().length < 2) {
      setSchoolError("School name must be at least 2 characters");
    } else if (/\d/.test(school)) {
      setSchoolError("School name should not contain numbers");
    } else {
      setSchoolError(null);
    }

    // Validate location (at least 2 characters)
    if (location.trim().length > 0 && location.trim().length < 2) {
      setLocationError("Location must be at least 2 characters");
    } else {
      setLocationError(null);
    }

    // Check if form is valid
    setFormValid(
      role && // role is already initialized and typed, so just check it exists
      school.trim().length >= 2 && 
      !schoolError &&
      location.trim().length >= 2 && 
      !locationError
    );
  }, [role, school, location, schoolError, locationError]);

  if (!isLoaded) {
    return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const handleSubmit = async () => {
    // Check if any fields are invalid
    if (!formValid) {
      if (!role) {
        setError("Please select a role");
      } else if (!school.trim() || schoolError) {
        setError(schoolError || "Please enter your school name");
      } else if (!location.trim() || locationError) {
        setError(locationError || "Please enter your location");
      } else {
        setError("Please fill in all required fields correctly");
      }
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Set the role and additional info in the user's metadata
      // NOTE: The Clerk types might not be fully up to date, but this works
      // despite the lint error about publicMetadata
      await signUp.update({
        unsafeMetadata: {
          role,
          school,
          location
        },
        // @ts-ignore - This property works but is not in the TypeScript definitions
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="bg-gradient-to-r from-brand-orange/10 to-brand-midblue/10 rounded-t-lg">
          <CardTitle className="text-2xl text-brand-darkblue">Complete Your Profile</CardTitle>
          <CardDescription>
            Choose your role and provide your school information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center">
              <span className="mr-2 bg-brand-orange/10 rounded-full p-1">
                <GraduationCap className="h-4 w-4 text-brand-orange" />
              </span>
              Select Your Role
            </h3>
            <RadioGroup
              value={role}
              onValueChange={(value) => setRole(value as "student" | "teacher")}
              className="space-y-4"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center space-x-2 border p-4 rounded-md cursor-pointer transition-all duration-200",
                  role === "student" ? "border-brand-orange bg-brand-orange/5" : "hover:bg-gray-50"
                )}
              >
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="flex items-center cursor-pointer w-full">
                  <GraduationCap className={cn("h-5 w-5 mr-2", role === "student" ? "text-brand-orange" : "")} />
                  <div>
                    <div className="font-medium">Student</div>
                    <div className="text-sm text-gray-500">Access learning materials and quizzes</div>
                  </div>
                </Label>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center space-x-2 border p-4 rounded-md cursor-pointer transition-all duration-200",
                  role === "teacher" ? "border-brand-orange bg-brand-orange/5" : "hover:bg-gray-50"
                )}
              >
                <RadioGroupItem value="teacher" id="teacher" />
                <Label htmlFor="teacher" className="flex items-center cursor-pointer w-full">
                  <BookOpen className={cn("h-5 w-5 mr-2", role === "teacher" ? "text-brand-orange" : "")} />
                  <div>
                    <div className="font-medium">Teacher</div>
                    <div className="text-sm text-gray-500">Create content and manage classes</div>
                  </div>
                </Label>
              </motion.div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="school" className="flex items-center">
                <span className="mr-2 bg-brand-midblue/10 rounded-full p-1">
                  <School className="h-4 w-4 text-brand-midblue" />
                </span>
                School Name
              </Label>
              <div className="relative">
                <Input
                  id="school"
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className={cn(
                    "pr-10",
                    schoolError ? "border-red-500 focus-visible:ring-red-500" : 
                    school.trim().length >= 2 ? "border-green-500 focus-visible:ring-green-500" : ""
                  )}
                  placeholder="e.g. Lincoln High School"
                />
                {school.trim().length > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {schoolError ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : school.trim().length >= 2 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {schoolError && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-red-500 mt-1"
                >
                  {schoolError}
                </motion.p>
              )}
              {!schoolError && school.trim().length >= 2 && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-green-600 mt-1"
                >
                  School name looks good!
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center">
                <span className="mr-2 bg-brand-midblue/10 rounded-full p-1">
                  <MapPin className="h-4 w-4 text-brand-midblue" />
                </span>
                Location
              </Label>
              <div className="relative">
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={cn(
                    "pr-10",
                    locationError ? "border-red-500 focus-visible:ring-red-500" : 
                    location.trim().length >= 2 ? "border-green-500 focus-visible:ring-green-500" : ""
                  )}
                  placeholder="e.g. Boston, MA"
                />
                {location.trim().length > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {locationError ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : location.trim().length >= 2 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {locationError && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-red-500 mt-1"
                >
                  {locationError}
                </motion.p>
              )}
              {!locationError && location.trim().length >= 2 && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs text-green-600 mt-1"
                >
                  Location looks good!
                </motion.p>
              )}
            </div>
          </div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-800 p-3 rounded-md text-sm flex items-start"
            >
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </CardContent>
        <CardFooter className="pt-2 pb-6">
          <Button 
            onClick={handleSubmit} 
            className={cn(
              "w-full transition-all duration-300",
              formValid 
                ? "bg-brand-orange hover:bg-brand-orange/90" 
                : "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
            )}
            disabled={isSubmitting || !formValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up your account...
              </>
            ) : (
              <>
                {formValid && <CheckCircle className="mr-2 h-4 w-4" />}
                Complete Registration
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
