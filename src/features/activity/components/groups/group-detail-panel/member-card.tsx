import { Crown, Sparkles } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import type { GroupMember } from "../../../lib/activity-contract";
import { cn } from "@/shared/lib/utils";

interface MemberCardProps {
  member: GroupMember;
  onShowProfile?: (member: GroupMember) => void;
}

export function MemberCard({ member, onShowProfile }: MemberCardProps) {
  const isAdmin = member.role === "ADMIN";
  const isHighCompatibility = (member.compatibilityScore || 0) > 90;

  return (
    <button
      onClick={() => onShowProfile?.(member)}
      className="w-full flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted/30 transition-all duration-300 group/member text-left"
    >
      {/* Avatar Container */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "w-10 h-10 rounded-full overflow-hidden ring-1 ring-border/20 group-hover/member:ring-border/40 transition-all",
            isHighCompatibility && "ring-forge-teal/30 ring-2",
          )}
        >
          <img
            src={member.user?.avatar || ""}
            alt={member.user?.name || "User"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/member:scale-110"
            loading="lazy"
          />
        </div>
        {isAdmin && (
          <div
            className="absolute -top-1 -left-1 flex items-center justify-center w-5 h-5 rounded-md bg-amber-500 shadow-md text-white border-2 border-canvas"
            title="Group Admin"
          >
            <Crown size={10} fill="currentColor" />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-foreground truncate">
            {member.user?.name}
          </p>
          <Badge
            variant="mbti"
            className="text-[9px] h-4 px-1.5 font-bold tracking-tight"
          >
            {member.user?.personalityType}
          </Badge>
          {isHighCompatibility && (
            <Sparkles size={12} className="text-forge-teal animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
            Trust {member.user?.trustScore}%
          </span>
          <div className="w-px h-2 bg-border/50" />
          <span
            className={cn(
              "text-[9px] font-bold uppercase tracking-wider",
              isHighCompatibility
                ? "text-forge-teal"
                : "text-muted-foreground/60",
            )}
          >
            {member.compatibilityScore}% match
          </span>
        </div>
      </div>

      {/* Subtle interaction indicator */}
      <div className="w-1.5 h-1.5 rounded-full bg-border opacity-0 group-hover/member:opacity-100 transition-opacity" />
    </button>
  );
}
