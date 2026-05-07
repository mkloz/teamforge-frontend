import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";

interface ProfilePanelHeaderProps {
  onClose: () => void;
}

export function ProfilePanelHeader({ onClose }: ProfilePanelHeaderProps) {
  return (
    <header className="z-20 flex items-center justify-between border-b border-border bg-canvas/80 px-4 py-3 backdrop-blur-md">
      <h3 className="text-sm font-semibold tracking-tight text-foreground">
        Member Info
      </h3>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-8 w-8 hover:bg-muted"
        aria-label="Close panel"
      >
        <X size={16} />
      </Button>
    </header>
  );
}
