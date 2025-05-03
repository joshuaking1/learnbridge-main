import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/ui/icons';
import { studyGroupService, StudyGroup as StudyGroupType } from '@/services/studyGroupService';
import { toast } from 'sonner';

export function StudyGroup() {
  const [groups, setGroups] = useState<StudyGroupType[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSubject, setNewGroupSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await studyGroupService.getAllGroups();
      setGroups(data);
    } catch (error) {
      toast.error('Failed to load study groups');
      console.error('Error loading study groups:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName || !newGroupSubject) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const newGroup = await studyGroupService.createGroup({
        name: newGroupName,
        subject: newGroupSubject
      });
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setNewGroupSubject('');
      toast.success('Study group created successfully');
    } catch (error) {
      toast.error('Failed to create study group');
      console.error('Error creating study group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      const updatedGroup = await studyGroupService.joinGroup(groupId);
      setGroups(groups.map(g => g.id === groupId ? updatedGroup : g));
      toast.success('Joined study group successfully');
    } catch (error) {
      toast.error('Failed to join study group');
      console.error('Error joining study group:', error);
    }
  };

  const handleLeaveGroup = async (groupId: number) => {
    try {
      await studyGroupService.leaveGroup(groupId);
      setGroups(groups.map(g => g.id === groupId ? {
        ...g,
        members: g.members.filter(m => m.role !== 'member')
      } : g));
      toast.success('Left study group successfully');
    } catch (error) {
      toast.error('Failed to leave study group');
      console.error('Error leaving study group:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Create Study Group</h3>
        <div className="space-y-2">
          <Input
            placeholder="Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <Input
            placeholder="Subject"
            value={newGroupSubject}
            onChange={(e) => setNewGroupSubject(e.target.value)}
          />
          <Button
            onClick={handleCreateGroup}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.plus className="mr-2 h-4 w-4" />
            )}
            Create Group
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {groups.map((group) => (
          <Card key={group.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold">{group.name}</h4>
                <p className="text-sm text-muted-foreground">{group.subject}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleJoinGroup(group.id)}
                >
                  <Icons.userPlus className="mr-2 h-4 w-4" />
                  Join
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLeaveGroup(group.id)}
                >
                  <Icons.userMinus className="mr-2 h-4 w-4" />
                  Leave
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-1 bg-secondary px-2 py-1 rounded-full"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-4 h-4 rounded-full"
                    />
                    <span className="text-sm">{member.name}</span>
                  </div>
                ))}
              </div>
              {group.meetingTime && (
                <p className="text-sm text-muted-foreground">
                  Meeting Time: {group.meetingTime}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 