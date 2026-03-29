import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { MessageSquare, Phone, Video } from "lucide-react";
import type {
  Participant,
  OnlineStatus,
} from "@/features/activity/types/direct-chats.types";

interface ProfilePanelInfoProps {
  participant: Participant;
  isMobile?: boolean;
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

export function ProfilePanelInfo({
  participant,
  isMobile = false,
}: ProfilePanelInfoProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-4 border-b border-border",
        isMobile ? "pb-6" : "py-6",
      )}
    >
      <div className="relative">
        <img
          src={participant.avatar}
          alt={participant.name}
          className={cn(
            "rounded-full object-cover bg-muted",
            isMobile ? "w-20 h-20" : "w-24 h-24",
          )}
        />
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-background",
            isMobile ? "w-4 h-4 border-2" : "w-5 h-5 border-3 bottom-1 right-1",
            getOnlineStatusColor(participant.onlineStatus),
          )}
        />
      </div>
      <h3
        className={cn(
          "font-semibold text-foreground",
          isMobile ? "mt-3 text-lg" : "mt-4 text-lg",
        )}
      >
        {participant.name}
      </h3>
      <p className="text-sm text-muted-foreground">
        {getStatusText(participant.onlineStatus)}
      </p>
      {participant.personalityType && (
        <span className="mt-2 px-2 py-0.5 rounded-full bg-forge-teal/10 text-forge-teal text-xs font-medium">
          {participant.personalityType}
        </span>
      )}

      {/* Quick actions */}
      <div
        className={cn(
          "flex items-center gap-2 mt-4",
          isMobile ? "gap-3" : "gap-2",
        )}
      >
        {!isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full"
          >
            <MessageSquare size={18} />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          className={cn("rounded-full", isMobile ? "h-12 w-12" : "h-10 w-10")}
        >
          <Phone size={isMobile ? 20 : 18} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={cn("rounded-full", isMobile ? "h-12 w-12" : "h-10 w-10")}
        >
          <Video size={isMobile ? 20 : 18} />
        </Button>
      </div>
    </div>
  );
}
