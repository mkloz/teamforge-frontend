import { useEffect, useCallback } from "react";
import { X, Bell, BellOff, Ban, Users, MessageSquare, Phone, Video } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type { DirectChat, OnlineStatus } from "../../types/direct-chats.types";

interface ProfilePanelProps {
  chat: DirectChat;
  isOpen: boolean;
  onClose: () => void;
}

function getOnlineStatusColor(status: OnlineStatus): string {
  switch (status) {
    case "ONLINE":
      return "bg-green-500";
    case "AWAY":
      return "bg-amber-500";
    case "OFFLINE":
      return "bg-muted-foreground/40";
  }
}

function getStatusText(status: OnlineStatus): string {
  switch (status) {
    case "ONLINE":
      return "Online";
    case "AWAY":
      return "Away";
    case "OFFLINE":
      return "Offline";
  }
}

export function ProfilePanel({ chat, isOpen, onClose }: ProfilePanelProps) {
  const { participant, mutualGroups, isMuted, isBlocked } = chat;

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

  // Desktop panel
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-full bg-background border-l border-border",
        "transition-all duration-300 ease-out",
        isOpen ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden",
      )}
    >
      {/* Header */}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile header */}
        <div className="flex flex-col items-center py-6 px-4 border-b border-border">
          <div className="relative">
            <img
              src={participant.avatar}
              alt={participant.name}
              className="w-24 h-24 rounded-full object-cover bg-muted"
            />
            <span
              className={cn(
                "absolute bottom-1 right-1 w-5 h-5 rounded-full border-3 border-background",
                getOnlineStatusColor(participant.onlineStatus),
              )}
            />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            {participant.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {getStatusText(participant.onlineStatus)}
          </p>
          {participant.personalityType && (
            <span className="mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {participant.personalityType}
            </span>
          )}

          {/* Quick actions */}
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
              <MessageSquare size={18} />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
              <Phone size={18} />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
              <Video size={18} />
            </Button>
          </div>
        </div>

        {/* Bio */}
        {participant.bio && (
          <div className="p-4 border-b border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              About
            </h4>
            <p className="text-sm text-foreground">{participant.bio}</p>
          </div>
        )}

        {/* Mutual groups */}
        {mutualGroups && mutualGroups.length > 0 && (
          <div className="p-4 border-b border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              <Users size={12} className="inline mr-1.5" />
              Mutual Groups ({mutualGroups.length})
            </h4>
            <div className="space-y-2">
              {mutualGroups.map((group) => (
                <button
                  key={group.id}
                  className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={group.avatar}
                    alt={group.name}
                    className="w-10 h-10 rounded-xl object-cover bg-muted"
                  />
                  <span className="text-sm font-medium text-foreground truncate">
                    {group.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Settings
          </h4>
          <div className="space-y-1">
            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
              {isMuted ? (
                <>
                  <BellOff size={18} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">Unmute notifications</span>
                </>
              ) : (
                <>
                  <Bell size={18} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">Mute notifications</span>
                </>
              )}
            </button>
            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-destructive/10 transition-colors text-destructive">
              <Ban size={18} />
              <span className="text-sm">{isBlocked ? "Unblock user" : "Block user"}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Mobile version as a sheet/drawer
export function ProfilePanelMobile({ chat, isOpen, onClose }: ProfilePanelProps) {
  const { participant, mutualGroups, isMuted, isBlocked } = chat;

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute inset-x-0 bottom-0 bg-background rounded-t-3xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Profile header */}
        <div className="flex flex-col items-center pb-6 px-4 border-b border-border">
          <div className="relative">
            <img
              src={participant.avatar}
              alt={participant.name}
              className="w-20 h-20 rounded-full object-cover bg-muted"
            />
            <span
              className={cn(
                "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background",
                getOnlineStatusColor(participant.onlineStatus),
              )}
            />
          </div>
          <h3 className="mt-3 text-lg font-semibold text-foreground">
            {participant.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {getStatusText(participant.onlineStatus)}
          </p>
          {participant.personalityType && (
            <span className="mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {participant.personalityType}
            </span>
          )}

          {/* Quick actions */}
          <div className="flex items-center gap-3 mt-4">
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
              <Phone size={20} />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
              <Video size={20} />
            </Button>
          </div>
        </div>

        {/* Bio */}
        {participant.bio && (
          <div className="p-4 border-b border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              About
            </h4>
            <p className="text-sm text-foreground">{participant.bio}</p>
          </div>
        )}

        {/* Mutual groups */}
        {mutualGroups && mutualGroups.length > 0 && (
          <div className="p-4 border-b border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Mutual Groups ({mutualGroups.length})
            </h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {mutualGroups.map((group) => (
                <button
                  key={group.id}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-muted/50 transition-colors min-w-[72px]"
                >
                  <img
                    src={group.avatar}
                    alt={group.name}
                    className="w-12 h-12 rounded-xl object-cover bg-muted"
                  />
                  <span className="text-xs text-foreground truncate max-w-[64px]">
                    {group.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="p-4 pb-safe">
          <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            {isMuted ? (
              <>
                <BellOff size={18} className="text-muted-foreground" />
                <span className="text-sm text-foreground">Unmute notifications</span>
              </>
            ) : (
              <>
                <Bell size={18} className="text-muted-foreground" />
                <span className="text-sm text-foreground">Mute notifications</span>
              </>
            )}
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-destructive/10 transition-colors text-destructive">
            <Ban size={18} />
            <span className="text-sm">{isBlocked ? "Unblock user" : "Block user"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
