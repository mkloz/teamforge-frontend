import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";

interface ProfilePanelHeaderProps {
  onClose: () => void;
}

export function ProfilePanelHeader({ onClose }: ProfilePanelHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border">
      <h2 className="text-base font-semibold text-foreground">Profile</h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-8 w-8"
        aria-label="Close panel"
      >
        <X size={18} />
      </Button>
    </header>
  );
}
