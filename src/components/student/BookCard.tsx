"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface BookCardProps {
  title: string;
  subject: string;
  lastRead?: string;
  progress?: number;
  coverColor?: string;
}

export function BookCard({ title, subject, lastRead, progress = 0, coverColor = "bg-brand-orange" }: BookCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Generate a random cover design
  const coverPattern = Math.floor(Math.random() * 5) + 1;
  
  return (
    <Card 
      className="overflow-hidden transition-all duration-200 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-full">
        {/* Book Cover */}
        <div 
          className={`w-24 sm:w-32 ${coverColor} flex items-center justify-center relative`}
          style={{
            backgroundImage: `url(/images/book-pattern-${coverPattern}.svg)`,
            backgroundSize: 'cover',
            backgroundBlendMode: 'overlay'
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-white font-bold text-lg sm:text-xl text-center px-2">
            {title.substring(0, 2).toUpperCase()}
          </div>
        </div>
        
        {/* Book Details */}
        <CardContent className="flex-1 p-4">
          <div className="flex flex-col h-full justify-between">
            <div>
              <h3 className="font-medium text-slate-800 mb-1">{title}</h3>
              <Badge variant="outline" className="mb-2">{subject}</Badge>
              
              {lastRead && (
                <div className="flex items-center text-xs text-slate-500 mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  Last read: {lastRead}
                </div>
              )}
              
              {progress > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-slate-500 mb-1">Progress: {progress}%</div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className="bg-brand-orange h-1.5 rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              size="sm" 
              className={`mt-3 transition-all duration-200 ${isHovered ? 'bg-brand-orange' : ''}`}
              onClick={() => router.push('/dashboard/student-hub/book-reader')}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Read Book
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
