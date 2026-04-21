import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Mail, Users, X } from "lucide-react";
import { useState } from "react";
import { MOCK_INVITATIONS } from "../data/mock-home";
import type { GroupInvitation } from "../types/home.types";

/* ── InvitationCard ────────────────────────────────────────────────── */
function InvitationCard({
  invitation,
  index,
  onAccept,
  onDecline,
}: {
  invitation: GroupInvitation;
  index: number;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  return (
    <motion.article
      key={invitation.id}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{
        duration: 0.3,
        delay: index * 0.06,
        ease: [0.23, 1, 0.32, 1],
      }}
      aria-label={`Invitation to join ${invitation.groupName} from ${invitation.invitedBy}`}
      className="flex items-start gap-3 rounded-2xl border border-forge-teal/20 bg-secondary/50 p-3"
    >
      {/* Group avatar */}
      <div className="relative shrink-0 mt-0.5">
        <div className="size-10 rounded-xl overflow-hidden border-2 border-forge-teal/30">
          <img
            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${invitation.avatarSeed}`}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
        {/* Inviter avatar overlap */}
        <div className="absolute -bottom-1 -right-1 size-5 rounded-full overflow-hidden border-2 border-card">
          <img
            src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${invitation.inviterAvatarSeed}`}
            alt={`Invited by ${invitation.invitedBy}`}
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-foreground leading-tight truncate">
            {invitation.groupName}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium leading-tight">
            Invited by{" "}
            <span className="text-foreground font-semibold">
              {invitation.invitedBy}
            </span>
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <Users className="size-2.5 shrink-0" aria-hidden="true" />
            {invitation.memberCount} members
          </span>
          <span
            className="size-0.5 rounded-full bg-border"
            aria-hidden="true"
          />
          <span className="text-[10px] font-semibold text-muted-foreground">
            {invitation.activityType}
          </span>
          <span
            className="size-0.5 rounded-full bg-border"
            aria-hidden="true"
          />
          <span className="text-[10px] text-muted-foreground">
            {invitation.receivedAt}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-0.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAccept(invitation.id)}
            aria-label={`Accept invitation to ${invitation.groupName}`}
            className="h-7 px-3 text-xs rounded-xl flex-1"
          >
            <Check className="size-3" aria-hidden="true" />
            Accept
          </Button>
          <button
            onClick={() => onDecline(invitation.id)}
            aria-label={`Decline invitation to ${invitation.groupName}`}
            className={cn(
              "flex items-center justify-center size-7 rounded-xl border border-border bg-card",
              "text-muted-foreground hover:text-destructive hover:border-destructive/40",
              "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/* ── Invitations section ───────────────────────────────────────────── */
export function Invitations({
  invitations: initialInvitations = MOCK_INVITATIONS,
}: {
  invitations?: GroupInvitation[];
}) {
  const [pending, setPending] = useState<GroupInvitation[]>(initialInvitations);

  const handleAccept = (id: string) => {
    setPending((prev) => prev.filter((inv) => inv.id !== id));
  };

  const handleDecline = (id: string) => {
    setPending((prev) => prev.filter((inv) => inv.id !== id));
  };

  // Section only renders when there are pending invitations
  if (pending.length === 0) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key="invitations-section"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        aria-labelledby="invitations-heading"
        className="w-full"
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2
              id="invitations-heading"
              className="text-base font-black tracking-tight text-foreground"
            >
              Invitations
            </h2>
            {/* Count badge */}
            <motion.span
              key={pending.length}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-forge-teal text-[10px] font-black text-white"
              aria-live="polite"
              aria-atomic="true"
            >
              {pending.length}
            </motion.span>
          </div>

          {/* Icon */}
          <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>

        {/* Cards */}
        <div
          role="list"
          aria-label="Pending group invitations"
          className="flex flex-col gap-2"
        >
          <AnimatePresence>
            {pending.map((inv, i) => (
              <div role="listitem" key={inv.id}>
                <InvitationCard
                  invitation={inv}
                  index={i}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
