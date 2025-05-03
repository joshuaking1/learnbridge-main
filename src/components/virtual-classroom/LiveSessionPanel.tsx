import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Icons } from '../ui/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ClassroomData } from '@/services/classroomService';

interface LiveSessionPanelProps {
  classroom: ClassroomData;
  userId?: string;
  onStatusUpdate: (data: {
    userId: string;
    status?: 'online' | 'offline';
    isSpeaking?: boolean;
    isHandRaised?: boolean;
  }) => void;
}

export function LiveSessionPanel({ classroom, userId, onStatusUpdate }: LiveSessionPanelProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentSize, setCurrentSize] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = currentColor;
    context.lineWidth = currentSize;
    contextRef.current = context;
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    const { offsetX, offsetY } = nativeEvent;
    if (!contextRef.current) return;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawing || !contextRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStatusChange = (updates: { isSpeaking?: boolean; isHandRaised?: boolean }) => {
    if (!userId) return;
    onStatusUpdate({ userId, ...updates });
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="video" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
        </TabsList>

        <TabsContent value="video">
          {/* Main video grid */}
          <div className="grid grid-cols-2 gap-4 h-[400px]">
            <Card className="relative bg-slate-900">
              <div className="absolute bottom-2 left-2 text-white font-semibold">
                Teacher Name
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-2">
              {classroom.participants
                .filter(p => p.status === 'online' && p.role === 'student')
                .slice(0, 4)
                .map(participant => (
                  <Card key={participant.userId} className="relative bg-slate-900">
                    <div className="absolute bottom-2 left-2 text-white text-sm">
                      {participant.name}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="whiteboard">
          <Card className="h-[400px] relative">
            <div className="absolute top-2 left-2 z-10 flex space-x-2">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => {
                  setCurrentColor(e.target.value);
                  if (contextRef.current) {
                    contextRef.current.strokeStyle = e.target.value;
                  }
                }}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <select
                value={currentSize}
                onChange={(e) => {
                  setCurrentSize(Number(e.target.value));
                  if (contextRef.current) {
                    contextRef.current.lineWidth = Number(e.target.value);
                  }
                }}
                className="rounded px-2 py-1"
              >
                <option value="2">Thin</option>
                <option value="5">Medium</option>
                <option value="10">Thick</option>
              </select>
              <Button variant="outline" size="sm" onClick={clearCanvas}>
                Clear
              </Button>
            </div>
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-full cursor-crosshair"
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="icon"
          onClick={() => {
            setIsMuted(!isMuted);
            handleStatusChange({ isSpeaking: !isMuted });
          }}
        >
          {isMuted ? <Icons.microphoneOff /> : <Icons.microphone />}
        </Button>
        
        <Button
          variant={isVideoOn ? "secondary" : "destructive"}
          size="icon"
          onClick={() => setIsVideoOn(!isVideoOn)}
        >
          {isVideoOn ? <Icons.video /> : <Icons.videoOff />}
        </Button>

        <Button
          variant={isScreenSharing ? "destructive" : "secondary"}
          size="icon"
          onClick={() => setIsScreenSharing(!isScreenSharing)}
        >
          <Icons.screenShare />
        </Button>

        <Button
          variant={isHandRaised ? "destructive" : "secondary"}
          size="icon"
          onClick={() => {
            setIsHandRaised(!isHandRaised);
            handleStatusChange({ isHandRaised: !isHandRaised });
          }}
        >
          <Icons.hand />
        </Button>

        <Button
          variant={isRecording ? "destructive" : "secondary"}
          size="icon"
          onClick={() => setIsRecording(!isRecording)}
        >
          <Icons.record className="h-4 w-4" />
        </Button>

        <Button variant="destructive" size="icon">
          <Icons.phoneOff />
        </Button>
      </div>

      {isRecording && (
        <div className="flex items-center justify-center space-x-2 text-red-500">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Recording {formatTime(recordingTime)}</span>
        </div>
      )}
    </div>
  );
} 