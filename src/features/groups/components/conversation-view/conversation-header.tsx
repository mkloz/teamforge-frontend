import { ArrowLeft, Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
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
    <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
      {/* Back button - mobile only */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="md:hidden h-9 w-9 -ml-2"
        aria-label="Back to group list"
      >
        <ArrowLeft size={20} />
      </Button>

      {/* Group info - clickable to open detail panel */}
      <button
        onClick={onToggleDetail}
        className="flex-1 flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
      >
        <img
          src={group.plan.coverImage}
          alt=""
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground truncate">
            {group.plan.title}
          </h2>
          <p className="text-xs text-muted-foreground">
            {group.members.length} member{group.members.length !== 1 ? "s" : ""}
          </p>
        </div>
      </button>

      {/* Info button - opens detail panel */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleDetail}
        className="h-9 w-9 -mr-2"
        aria-label="View group details"
      >
        <Info size={20} />
      </Button>
    </header>
  );
}
