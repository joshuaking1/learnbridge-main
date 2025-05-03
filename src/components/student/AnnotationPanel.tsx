import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Highlighter, Trash2, Calendar } from "lucide-react";

interface Annotation {
  id: string;
  content: string;
  type: "highlight" | "note";
  color?: string;
  page: number;
  position: { x: number; y: number };
  timestamp: Date;
}

interface AnnotationPanelProps {
  annotations: Annotation[];
  onAnnotationCreate: (annotation: Omit<Annotation, "id" | "timestamp">) => void;
  onAnnotationDelete: (id: string) => void;
}

export function AnnotationPanel({ 
  annotations, 
  onAnnotationCreate, 
  onAnnotationDelete 
}: AnnotationPanelProps) {
  const [selectedColor, setSelectedColor] = useState("#FFD700");

  const colors = [
    "#FFD700", // Yellow
    "#FF6B6B", // Red
    "#4ECDC4", // Turquoise
    "#45B7D1", // Blue
    "#96CEB4", // Green
  ];

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Highlighter className="h-5 w-5" />
            Annotations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Color Selection */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Highlight Color:</span>
              <div className="flex gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedColor === color ? "border-slate-400" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* Annotations List */}
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="p-4 rounded-lg border bg-slate-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            Page {annotation.page}
                          </Badge>
                          <Badge variant="outline">
                            {annotation.type}
                          </Badge>
                        </div>
                        <p className="text-slate-700">{annotation.content}</p>
                        <div className="flex items-center text-xs text-slate-500 mt-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          {annotation.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAnnotationDelete(annotation.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}

                {annotations.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Highlighter className="h-8 w-8 mx-auto mb-2" />
                    <p>No annotations yet</p>
                    <p className="text-sm">Select text to create annotations</p>
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