import type { Invite } from "@/shared/schemas";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

function formatGroupStatus(status: Invite["group"]["status"]) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "Recently";
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60_000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return `${Math.floor(diffDays / 7)}w ago`;
}

interface InvitationCardProps {
  invitation: Invite;
  index: number;
  onAccept: (id: string) => void | Promise<void>;
  onDecline: (id: string) => void | Promise<void>;
  isAccepting?: boolean;
  isDeclining?: boolean;
}

export function InvitationCard({
  invitation,
  index,
  onAccept,
  onDecline,
  isAccepting = false,
  isDeclining = false,
}: InvitationCardProps) {
  const group = invitation.group;
  const statusLabel = formatGroupStatus(group.status);
  const inviterName = invitation.inviter?.name ?? "TeamForge";
  const receivedAt = formatRelativeTime(invitation.createdAt);
  const groupInitials =
    group.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "TF";

  return (
    <motion.article
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{
        duration: 0.3,
        delay: index * 0.06,
        ease: [0.23, 1, 0.32, 1],
      }}
      aria-label={`Invitation to join ${group.name}`}
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl border p-3",
        "border-forge-teal/20 bg-secondary/50",
        "transition-colors duration-200 cursor-pointer",
        "hover:bg-secondary hover:border-forge-teal/40",
      )}
    >
      <div className="flex gap-3">
        <div className="relative shrink-0">
          <div className="size-14 rounded-lg overflow-hidden border border-border/50 bg-forge-teal/10 flex items-center justify-center text-sm font-black text-forge-teal">
            {groupInitials}
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 size-6 rounded-full overflow-hidden border-2 border-card bg-canvas z-10 flex items-center justify-center">
            {group.avatar ? (
              <img
                src={group.avatar}
                alt={`${group.name} logo`}
                className="size-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-[9px] font-black text-forge-teal">
                {groupInitials}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 min-w-0 pt-0.5">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[10px] font-bold text-forge-teal uppercase tracking-widest truncate">
              Invitation from {inviterName}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground shrink-0">
              {receivedAt}
            </span>
          </div>

          <h3 className="text-sm font-black text-foreground truncate mt-0.5 leading-snug">
            {group.name}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Users className="size-3 shrink-0" aria-hidden="true" />
              {group.activeMembersCount} members
            </span>
            <span
              className="size-1 rounded-full bg-border"
              aria-hidden="true"
            />
            <span className="text-xs text-muted-foreground font-medium">
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <Button
          variant="primary"
          size="sm"
          disabled={isAccepting || isDeclining}
          className="flex-1 rounded-xl h-8 text-xs shadow-none"
          onClick={(e) => {
            e.stopPropagation();
            void onAccept(invitation.id);
          }}
        >
          {isAccepting ? "Joining..." : "Join Group"}
        </Button>
        <button
          disabled={isAccepting || isDeclining}
          onClick={(e) => {
            e.stopPropagation();
            void onDecline(invitation.id);
          }}
          className={cn(
            "flex-1 h-8 rounded-xl text-xs font-bold",
            "text-muted-foreground bg-muted/50 border border-border/50",
            "hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30",
            "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:opacity-60 disabled:pointer-events-none",
          )}
        >
          {isDeclining ? "Declining..." : "Decline"}
        </button>
      </div>
    </motion.article>
  );
}
