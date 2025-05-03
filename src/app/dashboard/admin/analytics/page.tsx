"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, BarChart2, Users, Calendar, BookOpen, Activity } from 'lucide-react';

interface AnalyticsData {
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: string;
    totalSessions: number;
  };
  contentEngagement: {
    totalQuizzesTaken: number;
    averageQuizScore: number;
    totalDocumentsViewed: number;
    mostPopularDocument: string;
  };
  timeSeriesData: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
    quizzesTaken: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { toast } = useToast();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        toast({
          title: 'Error',
          description: 'Failed to load analytics data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, timeRange, toast]);

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push('/dashboard/admin')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Admin Dashboard
      </Button>

      <DashboardHeader
        heading="Analytics Dashboard"
        description="View detailed user engagement and system metrics"
        icon={BarChart2}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as '7d' | '30d' | '90d')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Engagement</TabsTrigger>
          <TabsTrigger value="content">Content Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.userEngagement.dailyActiveUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active users today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Session</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.userEngagement.averageSessionDuration || '0m'}</div>
                <p className="text-xs text-muted-foreground">
                  Average session duration
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.contentEngagement.totalQuizzesTaken || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total quizzes completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Document Views</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.contentEngagement.totalDocumentsViewed || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total document views
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement Metrics</CardTitle>
              <CardDescription>Detailed user activity and engagement data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Active Users</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Daily</span>
                        <span className="font-medium">{analytics?.userEngagement.dailyActiveUsers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Weekly</span>
                        <span className="font-medium">{analytics?.userEngagement.weeklyActiveUsers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Monthly</span>
                        <span className="font-medium">{analytics?.userEngagement.monthlyActiveUsers || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Session Data</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Sessions</span>
                        <span className="font-medium">{analytics?.userEngagement.totalSessions || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Duration</span>
                        <span className="font-medium">{analytics?.userEngagement.averageSessionDuration || '0m'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Engagement Metrics</CardTitle>
              <CardDescription>Detailed content usage and engagement data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Quiz Performance</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Quizzes Taken</span>
                        <span className="font-medium">{analytics?.contentEngagement.totalQuizzesTaken || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Average Score</span>
                        <span className="font-medium">{analytics?.contentEngagement.averageQuizScore || 0}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Document Engagement</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Views</span>
                        <span className="font-medium">{analytics?.contentEngagement.totalDocumentsViewed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Most Popular</span>
                        <span className="font-medium">{analytics?.contentEngagement.mostPopularDocument || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
} 