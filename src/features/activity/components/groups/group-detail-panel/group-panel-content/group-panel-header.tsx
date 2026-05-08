import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface GroupPanelHeaderProps {
  onClose: () => void;
}

export function GroupPanelHeader({ onClose }: GroupPanelHeaderProps) {
  return (
    <div className="z-20 flex items-center justify-between border-b border-border bg-canvas/80 px-4 py-3 backdrop-blur-md">
      <h3 className="text-sm font-semibold tracking-tight text-foreground">
        Group Info
      </h3>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onClose}
        className="text-slate-muted transition-colors hover:text-ink"
        aria-label="Close panel"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
