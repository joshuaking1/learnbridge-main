import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Icons } from '../ui/icons';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Message } from '@/services/classroomService';

interface DiscussionsPanelProps {
  messages: Message[];
  userId?: string;
  isTeacher: boolean;
  onSendMessage: (content: string) => void;
}

export function DiscussionsPanel({ messages, userId, isTeacher, onSendMessage }: DiscussionsPanelProps) {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Class Discussion</h2>
        <Button variant="outline" size="sm">
          <Icons.messageSquare className="mr-2 h-4 w-4" />
          New Thread
        </Button>
      </div>

      <Card className="p-4">
        <div className="h-[400px]">
          <ScrollArea>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.userId === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.userId === userId
                        ? 'bg-blue-100'
                        : 'bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{message.userName}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="mt-4 flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage}>
            <Icons.send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
} 