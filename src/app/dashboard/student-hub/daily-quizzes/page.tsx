"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DailyQuizzes } from "@/components/student/DailyQuizzes";
import { UsageLimits } from "@/components/student/UsageLimits";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, BookOpen } from "lucide-react";

export default function DailyQuizzesPage() {
    return (
        <DashboardShell>
            <DashboardHeader
                heading="Daily Quizzes"
                description="Test your knowledge with daily quizzes for your books"
                icon={Calendar}
            />

            <Tabs defaultValue="today" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="today" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Today's Quizzes
                    </TabsTrigger>
                    <TabsTrigger value="books" className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        By Book
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="mt-0">
                    <UsageLimits />
                    <DailyQuizzes />
                </TabsContent>

                <TabsContent value="books" className="mt-0">
                    <div className="bg-white p-6 rounded-md border border-gray-200">
                        <h3 className="text-lg font-medium mb-4">Filter Quizzes by Book</h3>
                        <p className="text-gray-600">
                            This feature is coming soon! You'll be able to view all quizzes for a specific book.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </DashboardShell>
    );
}
