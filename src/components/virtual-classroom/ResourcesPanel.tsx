import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Icons } from '../ui/icons';
import { ScrollArea } from '../ui/scroll-area';
import { Resource } from '@/services/classroomService';

interface ResourcesPanelProps {
  resources: Resource[];
  onAddResource: (data: {
    title: string;
    type: 'document' | 'video' | 'link';
    url: string;
    size?: string;
  }) => void;
}

export function ResourcesPanel({ resources, onAddResource }: ResourcesPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Class Resources</h2>
        <Button variant="outline" size="sm">
          <Icons.fileText className="mr-2 h-4 w-4" />
          Upload Resource
        </Button>
      </div>

      <div className="h-[500px]">
        <ScrollArea>
          <div className="space-y-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      {resource.type === 'document' && <Icons.fileText className="h-6 w-6" />}
                      {resource.type === 'video' && <Icons.video className="h-6 w-6" />}
                      {resource.type === 'link' && <Icons.bookOpen className="h-6 w-6" />}
                    </div>
                    <div>
                      <h3 className="font-medium">{resource.title}</h3>
                      <p className="text-sm text-slate-500">
                        Added on {new Date(resource.date).toLocaleDateString()}
                        {resource.size && ` • ${resource.size}`}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Icons.download className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 