"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Loader2, User, UserCheck, UserX, Shield, Clock, Activity, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

// Define user interface
interface User {
  id: string;
  email: string;
  first_name: string;
  surname: string;
  role: string;
  school?: string;
  location?: string;
  position?: string;
  phone?: string;
  gender?: string;
  created_at: string;
  last_login?: string;
  is_online: boolean;
}

// Define activity log interface
interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token, user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState('');

  // Check if current user is admin
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
      router.push('/dashboard');
    }
  }, [currentUser, router, toast]);

  // Fetch user details
  const fetchUserDetails = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }

      const data = await response.json();
      setUser(data);
      setNewRole(data.role);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: "Error",
        description: "Failed to load user details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user activity logs
  const fetchActivityLogs = async () => {
    if (!token) return;

    try {
      setIsLoadingLogs(true);
      const response = await fetch(`/api/users/${params.id}/activity`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch activity logs: ${response.status}`);
      }

      const data = await response.json();
      setActivityLogs(data);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: "Warning",
        description: "Failed to load activity logs. User details are still available.",
        variant: "warning",
      });
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUserDetails();
    fetchActivityLogs();
  }, [token, params.id]);

  // Handle role change
  const handleRoleChange = async () => {
    if (!token || !user) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/users/${user.id}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error(`Failed to update role: ${response.status}`);
      }

      // Update local state
      setUser(prev => prev ? { ...prev, role: newRole } : null);

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
        variant: "default",
      });

      setShowRoleDialog(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  // Get activity icon based on action
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <UserX className="h-4 w-4 text-orange-500" />;
      case 'profile_update':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'role_change':
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DashboardShell>
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push('/dashboard/admin/users')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Users
      </Button>

      <DashboardHeader
        heading={user ? `${user.first_name} ${user.surname}` : 'User Details'}
        description="View and manage user information"
        icon={User}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        </div>
      ) : user ? (
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">User Details</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Basic user information and account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {user.first_name} {user.surname}
                    </h3>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                  <Badge variant={
                    user.role === 'admin' ? 'default' :
                    user.role === 'teacher' ? 'secondary' :
                    'outline'
                  } className="text-base px-3 py-1">
                    {user.role}
                  </Badge>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">School</Label>
                    <p>{user.school || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Location</Label>
                    <p>{user.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Position</Label>
                    <p>{user.position || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Phone</Label>
                    <p>{user.phone || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Gender</Label>
                    <p>{user.gender || 'Not specified'}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Account Created</Label>
                    <p>{formatDate(user.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Last Login</Label>
                    <p>{formatDate(user.last_login)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <div className="flex items-center">
                      {user.is_online ? (
                        <Badge variant="success" className="bg-green-100 text-green-800">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Online
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          <UserX className="h-3 w-3 mr-1" />
                          Offline
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push(`/dashboard/admin/users/${user.id}/edit`)}>
                  Edit Profile
                </Button>

                {user.role !== 'admin' && (
                  <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                    <DialogTrigger asChild>
                      <Button variant="secondary">
                        <Shield className="h-4 w-4 mr-2" />
                        Change Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                          Update the role for {user.first_name} {user.surname}. This will change their permissions in the system.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="py-4">
                        <Label htmlFor="role">Select Role</Label>
                        <Select value={newRole} onValueChange={setNewRole}>
                          <SelectTrigger id="role" className="mt-1">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        {newRole === 'admin' && (
                          <Alert variant="warning" className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                              You are about to grant admin privileges to this user. Admins have full access to the system.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleRoleChange}
                          disabled={isUpdating || newRole === user.role}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          {isUpdating ? 'Updating...' : 'Update Role'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {/* Activity Log Card */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent user activity and system interactions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLogs ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
                  </div>
                ) : activityLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No activity logs found for this user</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex items-start p-3 border rounded-md">
                        <div className="mr-3 mt-1">
                          {getActivityIcon(log.action)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium capitalize">
                              {log.action.replace('_', ' ')}
                            </p>
                            <span className="text-sm text-gray-500">
                              {formatDate(log.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                          <p className="text-xs text-gray-400 mt-1">IP: {log.ip_address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={fetchActivityLogs}
                  disabled={isLoadingLogs}
                >
                  {isLoadingLogs ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {isLoadingLogs ? 'Loading...' : 'Refresh Activity'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            User not found or you don't have permission to view this user.
          </AlertDescription>
        </Alert>
      )}
    </DashboardShell>
  );
}
