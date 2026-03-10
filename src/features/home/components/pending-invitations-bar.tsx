import { cn } from "@/shared/lib/utils";
import { Check, X, ChevronDown, Users } from "lucide-react";
import { useState } from "react";
import type { Invitation } from "../types/home.types";

interface PendingInvitationsBarProps {
  invitations: Invitation[];
  isUpdating: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

export function PendingInvitationsBar({
  invitations,
  isUpdating,
  onAccept,
  onDecline,
}: PendingInvitationsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pendingCount = invitations.filter((inv) => inv.status === "PENDING").length;

  if (pendingCount === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between gap-3 p-4 rounded-xl",
          "bg-accent/10 border border-accent/30 hover:border-accent/50",
          "transition-all duration-200",
        )}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20">
            <Users size={16} className="text-accent" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">
              {pendingCount} group {pendingCount === 1 ? "invitation" : "invitations"}
            </p>
            <p className="text-xs text-muted-foreground">Awaiting your response</p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={cn(
            "text-muted-foreground transition-transform duration-200 shrink-0",
            isExpanded && "rotate-180",
          )}
        />
      </button>

      {/* Expanded list */}
      {isExpanded && (
        <div className="space-y-2 pl-4 pr-4">
          {invitations
            .filter((inv) => inv.status === "PENDING")
            .map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                isUpdating={isUpdating}
                onAccept={onAccept}
                onDecline={onDecline}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function InvitationCard({
  invitation,
  isUpdating,
  onAccept,
  onDecline,
}: {
  invitation: Invitation;
  isUpdating: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  const expiresIn = new Date(invitation.expiresAt).getTime() - Date.now();
  const expiresInHours = Math.ceil(expiresIn / (1000 * 60 * 60));
  const isExpiringSoon = expiresInHours <= 24;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-3 rounded-lg",
        "bg-card border border-border",
        isExpiringSoon && "border-accent/50 bg-accent/5",
      )}
    >
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-foreground">
          {invitation.activityTitle}
        </h4>
        <p className="text-xs text-muted-foreground">
          Invited by <span className="font-medium">{invitation.inviterName}</span>
        </p>
        {isExpiringSoon && (
          <p className="text-xs text-accent font-medium">
            Expires in {expiresInHours} {expiresInHours === 1 ? "hour" : "hours"}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(invitation.id)}
          disabled={isUpdating}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium",
            "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
            "transition-colors duration-150",
          )}
        >
          <Check size={14} />
          Accept
        </button>
        <button
          onClick={() => onDecline(invitation.id)}
          disabled={isUpdating}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium",
            "bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50",
            "transition-colors duration-150",
          )}
        >
          <X size={14} />
          Decline
        </button>
      </div>
    </div>
  );
}
