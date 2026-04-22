import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import type { GroupInvitation } from "../../types/home.types";

interface InvitationCardProps {
  invitation: GroupInvitation;
  index: number;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

/**
 * Individual invitation card showing group details and join/decline actions.
 */
export function InvitationCard({
  invitation,
  index,
  onAccept,
  onDecline,
}: InvitationCardProps) {
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
      aria-label={`Invitation to join ${invitation.groupName}`}
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl border p-3",
        "border-forge-teal/20 bg-secondary/50",
        "transition-colors duration-200 cursor-pointer",
        "hover:bg-secondary hover:border-forge-teal/40",
      )}
    >
      <div className="flex gap-3">
        {/* Avatars / Cover */}
        <div className="relative shrink-0">
          <div className="size-14 rounded-lg overflow-hidden border border-border/50 bg-muted">
            <img
              src={`https://api.dicebear.com/7.x/shapes/svg?seed=${invitation.groupName}`}
              alt=""
              className="size-full object-cover"
              loading="lazy"
            />
          </div>
          {/* Group logo overlap in bottom right */}
          <div className="absolute -bottom-1.5 -right-1.5 size-6 rounded-full overflow-hidden border-2 border-card bg-muted z-10">
            <img
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${invitation.avatarSeed}`}
              alt={`${invitation.groupName} logo`}
              className="size-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 min-w-0 pt-0.5">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[10px] font-bold text-forge-teal uppercase tracking-widest truncate">
              Invitation
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground shrink-0">
              {invitation.receivedAt}
            </span>
          </div>

          <h3 className="text-sm font-black text-foreground truncate mt-0.5 leading-snug">
            {invitation.groupName}
          </h3>

          {/* Members & Category */}
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Users className="size-3 shrink-0" aria-hidden="true" />
              {invitation.memberCount} members
            </span>
            <span
              className="size-1 rounded-full bg-border"
              aria-hidden="true"
            />
            <span className="text-xs text-muted-foreground font-medium">
              {invitation.activityType}
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2 mt-1">
        <Button
          variant="primary"
          size="sm"
          className="flex-1 rounded-xl h-8 text-xs shadow-none"
          onClick={(e) => {
            e.stopPropagation();
            onAccept(invitation.id);
          }}
        >
          Join Group
        </Button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDecline(invitation.id);
          }}
          className={cn(
            "flex-1 h-8 rounded-xl text-xs font-bold",
            "text-muted-foreground bg-muted/50 border border-border/50",
            "hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30",
            "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          Decline
        </button>
      </div>
    </motion.article>
  );
}
