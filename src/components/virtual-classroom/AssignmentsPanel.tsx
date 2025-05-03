import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Icons } from '../ui/icons';
import { ScrollArea } from '../ui/scroll-area';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  points?: number;
}

const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'React Hooks Practice',
    dueDate: '2024-05-01',
    status: 'pending',
    points: 100
  },
  {
    id: '2',
    title: 'State Management Quiz',
    dueDate: '2024-04-30',
    status: 'submitted',
    points: 50
  },
  {
    id: '3',
    title: 'Component Design Project',
    dueDate: '2024-05-05',
    status: 'graded',
    points: 150
  }
];

export function AssignmentsPanel() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Assignments</h2>
        <Button variant="outline" size="sm">
          <Icons.fileText className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      <div className="h-[500px]">
        <ScrollArea>
          <div className="space-y-4">
            {mockAssignments.map((assignment) => (
              <Card key={assignment.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{assignment.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Icons.calendar className="mr-1 h-4 w-4" />
                        Due: {assignment.dueDate}
                      </div>
                      <div className="flex items-center">
                        <Icons.fileText className="mr-1 h-4 w-4" />
                        {assignment.points} points
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </span>
                    <Button variant="ghost" size="icon">
                      <Icons.chevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 