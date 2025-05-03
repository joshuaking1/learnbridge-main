import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { StickyNote, Trash2, Calendar, Tag } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  page: number;
  timestamp: Date;
  tags: string[];
}

interface NoteEditorProps {
  notes: Note[];
  onNoteCreate: (note: Omit<Note, "id" | "timestamp">) => void;
  onNoteDelete: (id: string) => void;
}

export function NoteEditor({ notes, onNoteCreate, onNoteDelete }: NoteEditorProps) {
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    page: 1,
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && !newNote.tags.includes(tagInput.trim())) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewNote({
      ...newNote,
      tags: newNote.tags.filter((t) => t !== tag),
    });
  };

  const handleCreateNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      onNoteCreate(newNote);
      setNewNote({
        title: "",
        content: "",
        page: 1,
        tags: [],
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* New Note Form */}
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
              <Input
                placeholder="Note Title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
              <Textarea
                placeholder="Write your note here..."
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                className="min-h-[100px]"
              />
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add tags (press Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button onClick={handleAddTag}>Add Tag</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newNote.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Button onClick={handleCreateNote} className="w-full">
                Create Note
              </Button>
            </div>

            {/* Notes List */}
            <ScrollArea className="h-[calc(100vh-500px)]">
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-lg border bg-slate-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{note.title}</h3>
                        <p className="text-slate-700 mb-2">{note.content}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center text-xs text-slate-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {note.timestamp.toLocaleDateString()}
                          <span className="mx-2">•</span>
                          Page {note.page}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNoteDelete(note.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}

                {notes.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <StickyNote className="h-8 w-8 mx-auto mb-2" />
                    <p>No notes yet</p>
                    <p className="text-sm">Create your first note above</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 