import { Brain, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiTeacherAvatarProps {
  isActive: boolean;
  className?: string;
}

export function AiTeacherAvatar({ isActive, className }: AiTeacherAvatarProps) {
  return (
    <div className={cn(
      "relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
      isActive ? "bg-green-100" : "bg-slate-100",
      className
    )}>
      {isActive ? (
        <Brain className="w-6 h-6 text-green-600" />
      ) : (
        <User className="w-6 h-6 text-slate-600" />
      )}
      {isActive && (
        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
} 