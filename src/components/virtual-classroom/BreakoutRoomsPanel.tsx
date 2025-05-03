import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Icons } from '../ui/icons';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';

interface Room {
  id: string;
  name: string;
  participants: string[];
  isActive: boolean;
}

const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Group 1',
    participants: ['Alice', 'Bob', 'Charlie'],
    isActive: true
  },
  {
    id: '2',
    name: 'Group 2',
    participants: ['David', 'Emma', 'Frank'],
    isActive: true
  },
  {
    id: '3',
    name: 'Group 3',
    participants: ['Grace', 'Henry', 'Isabella'],
    isActive: false
  }
];

export function BreakoutRoomsPanel() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [newRoomName, setNewRoomName] = useState('');

  const createRoom = () => {
    if (!newRoomName.trim()) return;
    
    const newRoom: Room = {
      id: Date.now().toString(),
      name: newRoomName,
      participants: [],
      isActive: false
    };
    
    setRooms([...rooms, newRoom]);
    setNewRoomName('');
  };

  const toggleRoom = (roomId: string) => {
    setRooms(rooms.map(room => 
      room.id === roomId ? { ...room, isActive: !room.isActive } : room
    ));
  };

  const deleteRoom = (roomId: string) => {
    setRooms(rooms.filter(room => room.id !== roomId));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Breakout Rooms</h2>
        <Button variant="outline" size="sm">
          <Icons.users className="mr-2 h-4 w-4" />
          Assign Randomly
        </Button>
      </div>

      <div className="flex space-x-2">
        <Input
          placeholder="New room name..."
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <Button onClick={createRoom} className="flex items-center gap-2">
          <Icons.plus className="h-4 w-4" />
          Create Room
        </Button>
      </div>

      <div className="h-[400px]">
        <ScrollArea>
          <div className="space-y-4">
            {rooms.map((room) => (
              <Card key={room.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{room.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        room.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {room.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {room.participants.length} participants
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRoom(room.id)}
                      className="h-8 w-8"
                    >
                      {room.isActive ? <Icons.pause /> : <Icons.play />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRoom(room.id)}
                      className="h-8 w-8"
                    >
                      <Icons.trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {room.participants.map((participant, index) => (
                      <div
                        key={index}
                        className="px-2 py-1 bg-slate-100 rounded-full text-sm"
                      >
                        {participant}
                      </div>
                    ))}
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