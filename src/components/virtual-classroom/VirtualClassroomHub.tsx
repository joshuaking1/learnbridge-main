import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { LiveSessionPanel } from './LiveSessionPanel';
import { ResourcesPanel } from './ResourcesPanel';
import { DiscussionsPanel } from './DiscussionsPanel';
import { AssignmentsPanel } from './AssignmentsPanel';
import { ParticipantsPanel } from './ParticipantsPanel';
import { ChatPanel } from './ChatPanel';
import { classroomService, ClassroomData } from '@/services/classroomService';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Main Virtual Classroom Hub Component
export function VirtualClassroomHub() {
  const [classroom, setClassroom] = useState<ClassroomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const { data: session } = useSession();
  const classroomId = params?.id as string;

  useEffect(() => {
    const socket = classroomService.connectSocket();

    const initializeClassroom = async () => {
      try {
        const data = await classroomService.getClassroom(classroomId);
        setClassroom(data);

        // Join classroom if we have user session
        if (session?.user) {
          await classroomService.joinClassroom(classroomId, {
            userId: session.user.id,
            userName: session.user.name || 'Anonymous',
            role: data.teacherId === session.user.id ? 'teacher' : 'student'
          });

          socket.emit('join-classroom', classroomId);
        }
      } catch (err) {
        setError('Failed to load classroom');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeClassroom();

    // Socket event listeners
    socket.on('participant-status-changed', (data) => {
      setClassroom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map(p =>
            p.userId === data.userId ? { ...p, ...data } : p
          )
        };
      });
    });

    socket.on('new-message', (message) => {
      setClassroom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, message]
        };
      });
    });

    socket.on('breakout-room-changed', (data) => {
      setClassroom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          breakoutRooms: prev.breakoutRooms.map(room =>
            room.id === data.roomId ? { ...room, ...data } : room
          )
        };
      });
    });

    return () => {
      if (session?.user) {
        socket.emit('leave-classroom', classroomId);
        classroomService.leaveClassroom(classroomId, session.user.id);
      }
      classroomService.disconnectSocket();
    };
  }, [classroomId, session]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !classroom) {
    return <div>Error: {error || 'Classroom not found'}</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-4">
        <h1 className="text-3xl font-bold">{classroom.name}</h1>
        
        <Tabs defaultValue="live-session" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="live-session">Live Session</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="live-session" className="mt-4">
            <Card className="p-4">
              <LiveSessionPanel
                classroom={classroom}
                userId={session?.user?.id}
                onStatusUpdate={async (data) => {
                  try {
                    const updated = await classroomService.updateParticipantStatus(classroomId, data);
                    setClassroom(updated);
                  } catch (err) {
                    console.error('Failed to update status:', err);
                  }
                }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-4">
            <Card className="p-4">
              <ResourcesPanel
                resources={classroom.resources}
                onAddResource={async (data) => {
                  try {
                    const updated = await classroomService.addResource(classroomId, data);
                    setClassroom(updated);
                  } catch (err) {
                    console.error('Failed to add resource:', err);
                  }
                }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="discussions" className="mt-4">
            <Card className="p-4">
              <DiscussionsPanel
                messages={classroom.messages}
                userId={session?.user?.id}
                isTeacher={classroom.teacherId === session?.user?.id}
                onSendMessage={async (content) => {
                  if (!session?.user) return;
                  try {
                    const updated = await classroomService.addMessage(classroomId, {
                      userId: session.user.id,
                      userName: session.user.name || 'Anonymous',
                      content,
                      isTeacher: classroom.teacherId === session.user.id
                    });
                    setClassroom(updated);
                  } catch (err) {
                    console.error('Failed to send message:', err);
                  }
                }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="mt-4">
            <Card className="p-4">
              <AssignmentsPanel />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l p-4 flex flex-col">
        <ParticipantsPanel
          participants={classroom.participants}
          userId={session?.user?.id}
          isTeacher={classroom.teacherId === session?.user?.id}
        />
        <ChatPanel
          messages={classroom.messages}
          userId={session?.user?.id}
          isTeacher={classroom.teacherId === session?.user?.id}
          onSendMessage={async (content) => {
            if (!session?.user) return;
            try {
              const updated = await classroomService.addMessage(classroomId, {
                userId: session.user.id,
                userName: session.user.name || 'Anonymous',
                content,
                isTeacher: classroom.teacherId === session.user.id
              });
              setClassroom(updated);
            } catch (err) {
              console.error('Failed to send message:', err);
            }
          }}
        />
      </div>
    </div>
  );
} 