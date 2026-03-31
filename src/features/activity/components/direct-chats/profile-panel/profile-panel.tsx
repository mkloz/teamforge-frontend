import { cn } from "@/shared/lib/utils";
import { useCallback, useEffect } from "react";
import type { DirectChat } from "@/features/activity/types/direct-chats.types";
import { ProfilePanelHeader } from "./profile-panel-header";
import { ProfilePanelContent } from "./profile-panel-content";

interface ProfilePanelProps {
  chat: DirectChat;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ProfilePanel - Desktop side panel for direct chat participant profiles.
 * Features a slide-in animation and unified content.
 */
export function ProfilePanel({ chat, isOpen, onClose }: ProfilePanelProps) {
  // Close on escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-full bg-canvas border-l border-border transition duration-300 ease-out",
        isOpen ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden",
      )}
    >
      <ProfilePanelHeader onClose={onClose} />
      <ProfilePanelContent chat={chat} />
    </aside>
  );
}

/**
 * ProfilePanelMobile - Mobile bottom drawer for direct chat profiles.
 * Uses a slide-up animation and safe-area inset blurs.
 */
export function ProfilePanelMobile({
  chat,
  isOpen,
  onClose,
}: ProfilePanelProps) {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-400"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-canvas rounded-t-3xl max-h-[90vh]",
          "flex flex-col animate-in slide-in-from-bottom duration-400 overflow-hidden",
          "shadow-[0_-8px_40px_-15px_rgba(0,0,0,0.3)]",
        )}
      >
        {/* Handle for visual cues */}
        <div className="flex justify-center p-3 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 transition-colors" />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pb-10">
          <ProfilePanelContent chat={chat} isMobile={true} />
        </div>
      </div>
    </div>
  );
}
