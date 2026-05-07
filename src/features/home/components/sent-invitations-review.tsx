import type { Invite } from "@/shared/schemas";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { BellRing } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  getInviteStatusCopy,
  getInviteStatusSentence,
} from "./sent-invitations-review-model";

interface SentInvitationsReviewProps {
  focusedInviteId: string | null;
  invitations: Invite[];
  onClose: () => void;
}

export function SentInvitationsReview({
  focusedInviteId,
  invitations,
  onClose,
}: SentInvitationsReviewProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const focusedInvite = invitations.find(
    (invite) => invite.id === focusedInviteId,
  );
  const focusedInviteStatus = focusedInvite
    ? getInviteStatusCopy(focusedInvite.status)
    : null;
  const StatusIcon = focusedInviteStatus?.icon;

  return (
    <section
      ref={sectionRef}
      className="mb-6 rounded-xl border border-border bg-card/90 p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-forge-teal/10 px-3 py-1 text-xs font-black tracking-[0.14em] text-forge-teal uppercase">
            <BellRing className="size-3.5" />
            Sent invite update
          </div>
          <h2 className="text-lg font-black tracking-tight text-foreground">
            Invite status
          </h2>
          <p className="text-sm leading-relaxed font-medium text-muted-foreground">
            Review the exact invitation that changed and decide what to do next.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={onClose}
        >
          Close
        </Button>
      </div>

      {focusedInvite ? (
        <motion.article
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-forge-teal/40 bg-forge-teal/5 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black tracking-[0.16em] text-muted-foreground uppercase">
                {focusedInvite.group.name}
              </p>
              <h3 className="mt-1 truncate text-base font-black text-foreground">
                {focusedInvite.invitee.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed font-medium text-muted-foreground">
                {focusedInvite.message?.trim() ||
                  `This invite was sent to ${focusedInvite.invitee.name} for ${focusedInvite.group.name}.`}
              </p>
            </div>
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black tracking-[0.14em] uppercase",
                focusedInviteStatus?.tone,
              )}
            >
              {StatusIcon ? <StatusIcon className="size-3.5" /> : null}
              {focusedInviteStatus?.label}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border/70 bg-canvas/70 px-4 py-3 text-sm font-medium text-muted-foreground">
            {getInviteStatusSentence(focusedInvite)}
          </div>
        </motion.article>
      ) : (
        <div className="mt-4 rounded-xl border border-border/70 bg-canvas/70 px-4 py-5 text-sm font-medium text-muted-foreground">
          That invite is no longer available in your recent sent history.
        </div>
      )}
    </section>
  );
}
