import { Link } from "@tanstack/react-router";
import { ExternalLink, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { buildGroupPlanDetailNavigation } from "@/shared/navigation";

interface GroupPanelHeaderProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
}

export function GroupPanelHeader({
  groupId,
  groupName,
  onClose,
}: GroupPanelHeaderProps) {
  return (
    <div className="z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-border/70 border-b bg-canvas px-5">
      <h3 className="font-bold text-base text-ink leading-tight tracking-tight">
        Group details
      </h3>
      <div className="flex items-center gap-1">
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-slate-muted transition-colors hover:text-ink"
        >
          <Link
            {...buildGroupPlanDetailNavigation(groupId, { source: "activity" })}
            aria-label={`Open ${groupName} full group page`}
          >
            <ExternalLink className="size-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="rounded-full text-slate-muted transition-colors hover:text-ink"
          aria-label="Close panel"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
