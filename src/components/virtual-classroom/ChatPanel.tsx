import React, { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Icons } from '../ui/icons';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Message } from '@/services/classroomService';

interface ChatPanelProps {
  messages: Message[];
  userId?: string;
  isTeacher: boolean;
  onSendMessage: (content: string) => void;
}

export function ChatPanel({ messages, userId, isTeacher, onSendMessage }: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="h-1/2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Class Chat</h3>
        <Button variant="ghost" size="icon">
          <Icons.messageSquare className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-[calc(100%-3rem)]">
        <ScrollArea>
          <div className="space-y-4 p-2">
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

        <div className="mt-4 flex space-x-2 p-2">
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
      </div>
    </div>
  );
} 