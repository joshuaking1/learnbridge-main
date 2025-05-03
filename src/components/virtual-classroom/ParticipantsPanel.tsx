import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Icons } from '../ui/icons';
import { Button } from '../ui/button';
import { Participant } from '@/services/classroomService';

interface ParticipantsPanelProps {
  participants: Participant[];
  userId?: string;
  isTeacher: boolean;
}

export function ParticipantsPanel({ participants, userId, isTeacher }: ParticipantsPanelProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Participants</h3>
        <Button variant="ghost" size="icon">
          <Icons.users className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea>
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.userId}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100"
            >
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <Icons.user className="h-4 w-4" />
                  </div>
                  <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white ${
                    participant.status === 'online' ? 'bg-green-500' : 'bg-slate-300'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{participant.name}</span>
                    {participant.role === 'teacher' && (
                      <Icons.checkCircle className="h-3 w-3 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-slate-500">
                    {participant.isSpeaking && (
                      <span className="flex items-center">
                        <Icons.microphone className="h-3 w-3 mr-1" />
                        Speaking
                      </span>
                    )}
                    {participant.isHandRaised && (
                      <span className="flex items-center">
                        <Icons.hand className="h-3 w-3 mr-1" />
                        Hand Raised
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 