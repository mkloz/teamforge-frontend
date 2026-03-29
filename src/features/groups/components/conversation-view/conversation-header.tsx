import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { Group } from "../../types/groups.types";

interface ConversationHeaderProps {
  group: Group;
  onBack: () => void;
  onToggleDetail: () => void;
}

export function ConversationHeader({
  group,
  onBack,
  onToggleDetail,
}: ConversationHeaderProps) {
  return (
    <header className="shrink-0 flex items-center gap-2 px-2 pb-2 md:pt-2 border-b border-border bg-canvas/95 backdrop-blur-sm">
      {/* Back button - mobile only */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="md:hidden h-10 w-10 rounded-full"
        aria-label="Back to group list"
      >
        <ArrowLeft size={20} />
      </Button>

      {/* Group info - clickable to open detail panel */}
      <button
        onClick={onToggleDetail}
        className={cn(
          "flex-1 flex items-center gap-3 px-2 py-1.5 rounded-xl text-left",
          "hover:bg-muted/50 active:bg-muted/70 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        aria-label={`View details for ${group.identity.name}`}
      >
        {/* Group avatar - squared with plan cover overlay */}
        <div className="relative flex-shrink-0">
          <img
            src={group.identity.avatar}
            alt={group.identity.name}
            className="w-10 h-10 rounded-xl object-cover bg-muted"
          />
          <img
            src={group.plan.coverImage}
            alt=""
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded object-cover ring-2 ring-background"
          />
        </div>

        <div className="min-w-0 flex-1">
          {/* Group name */}
          <h2 className="text-sm font-semibold text-foreground truncate">
            {group.identity.name}
          </h2>
          {/* Member count */}
          <p className="text-xs text-muted-foreground">
            {group.members.length} members
          </p>
        </div>

        <ChevronRight
          size={18}
          className="text-muted-foreground flex-shrink-0"
        />
      </button>
    </header>
  );
}
