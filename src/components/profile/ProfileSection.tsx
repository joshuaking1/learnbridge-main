// frontend/src/components/profile/ProfileSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Loader2, Camera, RotateCw, User, Shield } from "lucide-react";
import { profileService } from "@/services/profileService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecurityTab } from "./SecurityTab";

export function ProfileSection() {
  const { user, token, setUser } = useAuthStore();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Fetch complete profile data from the database
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const data = await profileService.fetchUserProfile(token);
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch profile data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [token, toast]);

  // Function to refresh profile data
  const refreshProfileData = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const data = await profileService.fetchUserProfile(token);
      setProfileData(data);
      toast({
        title: "Success",
        description: "Profile data refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing profile data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh profile data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: "File too large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Use the profile service to upload the image
      const data = await profileService.uploadProfileImage(token, file);

      // Update user state with new profile image
      if (user) {
        setUser({ ...user, profile_image_url: data.user.profile_image_url });
      }

      // Refresh profile data to get the latest information
      await refreshProfileData();

      toast({
        title: "Success",
        description: "Profile image updated successfully.",
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to update profile image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-brand-orange/10 to-brand-orange/5 p-6 border-b flex justify-between items-center">
        <div>
          <CardTitle className="text-2xl text-gray-800 mb-2">
            Profile Settings
          </CardTitle>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshProfileData}
          disabled={isLoading}
          className="text-gray-700 hover:text-brand-orange hover:border-brand-orange"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <RotateCw className="h-4 w-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <div className="border-b px-6 pt-4">
          <TabsList className="mb-2">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          <div className="p-6 md:p-8">
            {isLoading && !profileData ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Image Section */}
                <div className="flex flex-col items-center space-y-4 md:border-r md:pr-6">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={
                        profileData?.profile_image_url ||
                        user?.profile_image_url ||
                        undefined
                      }
                      alt={
                        profileData?.first_name || user?.first_name || "User"
                      }
                    />
                    <AvatarFallback className="bg-brand-orange text-white text-2xl">
                      {(
                        profileData?.first_name?.[0] || user?.first_name?.[0]
                      )?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center mt-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {profileData?.first_name ||
                        user?.first_name ||
                        user?.firstName ||
                        ""}{" "}
                      {profileData?.surname || user?.surname || ""}
                    </h3>
                    <p className="text-gray-500 capitalize">
                      {profileData?.role || user?.role}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="profile-image-upload"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="default"
                      className="bg-brand-orange text-white hover:bg-brand-orange/90 w-full"
                      disabled={isUploading}
                      onClick={() =>
                        document.getElementById("profile-image-upload")?.click()
                      }
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Change Photo
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* User Info Section */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Account Information
                  </h3>
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <div className="text-sm font-medium text-gray-700">
                        Full Name
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <Input
                            value={
                              profileData?.first_name ||
                              user?.first_name ||
                              user?.firstName ||
                              ""
                            }
                            disabled
                            className="bg-gray-50 border-gray-200"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            First Name
                          </p>
                        </div>
                        <div className="flex-1">
                          <Input
                            value={profileData?.surname || user?.surname || ""}
                            disabled
                            className="bg-gray-50 border-gray-200"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Last Name
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="text-sm font-medium text-gray-700">
                        Email Address
                      </div>
                      <Input
                        value={profileData?.email || user?.email}
                        disabled
                        className="bg-gray-50 border-gray-200"
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="text-sm font-medium text-gray-700">
                        Role
                      </div>
                      <Input
                        value={profileData?.role || user?.role}
                        disabled
                        className="bg-gray-50 border-gray-200 capitalize"
                      />
                    </div>
                    {(profileData?.school || user?.school) && (
                      <div className="grid gap-2">
                        <div className="text-sm font-medium text-gray-700">
                          School
                        </div>
                        <Input
                          value={profileData?.school || user?.school || ""}
                          disabled
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                    )}

                    {/* Additional fields from database */}
                    {profileData?.position && (
                      <div className="grid gap-2">
                        <div className="text-sm font-medium text-gray-700">
                          Position
                        </div>
                        <Input
                          value={profileData.position}
                          disabled
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                    )}

                    {profileData?.location && (
                      <div className="grid gap-2">
                        <div className="text-sm font-medium text-gray-700">
                          Location
                        </div>
                        <Input
                          value={profileData.location}
                          disabled
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                    )}

                    {profileData?.phone && (
                      <div className="grid gap-2">
                        <div className="text-sm font-medium text-gray-700">
                          Phone
                        </div>
                        <Input
                          value={profileData.phone}
                          disabled
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                    )}

                    {profileData?.gender && (
                      <div className="grid gap-2">
                        <div className="text-sm font-medium text-gray-700">
                          Gender
                        </div>
                        <Input
                          value={profileData.gender}
                          disabled
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                    )}

                    {profileData?.created_at && (
                      <div className="grid gap-2">
                        <div className="text-sm font-medium text-gray-700">
                          Account Created
                        </div>
                        <Input
                          value={new Date(
                            profileData.created_at
                          ).toLocaleDateString()}
                          disabled
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
