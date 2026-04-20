import { Handshake } from "lucide-react";

interface CardHeaderProps {
  groupName: string;
  groupAvatarUrl?: string;
  access: string;
}

export function CardHeader({
  groupName,
  groupAvatarUrl,
  access,
}: CardHeaderProps) {
  return (
    <div className="flex justify-between items-start gap-4 mb-3">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full overflow-hidden bg-muted border border-border shrink-0">
          <img
            src={
              groupAvatarUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${groupName}`
            }
            alt={groupName}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-sm font-semibold text-muted-foreground tracking-tight group-hover:text-foreground transition-colors truncate">
          {groupName}
        </span>
      </div>

      {/* Top Right Request info pill if any */}
      {access === "By Request" && (
        <span className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md border border-border/80 text-muted-foreground text-[10px] font-bold uppercase tracking-wider bg-background/50">
          <Handshake className="w-3 h-3" />
          Req
        </span>
      )}
    </div>
  );
}
