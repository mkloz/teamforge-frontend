import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";

interface GroupPanelHeaderProps {
  onClose: () => void;
}

export function GroupPanelHeader({ onClose }: GroupPanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-canvas/80 backdrop-blur-md z-20">
      <h3 className="text-sm font-semibold tracking-tight text-foreground">
        Group Info
      </h3>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onClose}
        className="text-slate-muted hover:text-ink transition-colors"
        aria-label="Close panel"
      >
        <X size={16} />
      </Button>
    </div>
  );
}
