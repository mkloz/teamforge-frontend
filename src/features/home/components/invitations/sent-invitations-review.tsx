import type { Invite } from "@/shared/schemas";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import {
  BellRing,
  CheckCircle2,
  Clock3,
  MailWarning,
  XCircle,
} from "lucide-react";
import { useEffect, useRef } from "react";

function getInviteStatusCopy(status: Invite["status"]) {
  switch (status) {
    case "ACCEPTED":
      return {
        icon: CheckCircle2,
        label: "Accepted",
        tone: "text-forge-teal bg-forge-teal/10 border-forge-teal/20",
      };
    case "DECLINED":
      return {
        icon: XCircle,
        label: "Declined",
        tone: "text-destructive bg-destructive/10 border-destructive/20",
      };
    case "EXPIRED":
      return {
        icon: Clock3,
        label: "Expired",
        tone: "text-muted-foreground bg-muted/50 border-border",
      };
    case "CANCELLED":
      return {
        icon: MailWarning,
        label: "Cancelled",
        tone: "text-muted-foreground bg-muted/50 border-border",
      };
    default:
      return {
        icon: Clock3,
        label: "Pending",
        tone: "text-spark-amber bg-spark-amber/10 border-spark-amber/20",
      };
  }
}

function formatInviteMoment(value: string | null) {
  if (!value) {
    return "Awaiting a response";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Updated recently";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

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

  return (
    <section
      ref={sectionRef}
      className="mb-6 rounded-3xl border border-border bg-card/90 p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-forge-teal/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-forge-teal">
            <BellRing className="size-3.5" />
            Sent invite update
          </div>
          <h2 className="text-lg font-black tracking-tight text-foreground">
            Invite status
          </h2>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground">
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
          className="mt-4 rounded-2xl border border-forge-teal/40 bg-forge-teal/5 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                {focusedInvite.group.name}
              </p>
              <h3 className="mt-1 truncate text-base font-black text-foreground">
                {focusedInvite.invitee.name}
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                {focusedInvite.message?.trim() ||
                  `This invite was sent to ${focusedInvite.invitee.name} for ${focusedInvite.group.name}.`}
              </p>
            </div>
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em]",
                getInviteStatusCopy(focusedInvite.status).tone,
              )}
            >
              {(() => {
                const StatusIcon = getInviteStatusCopy(
                  focusedInvite.status,
                ).icon;
                return <StatusIcon className="size-3.5" />;
              })()}
              {getInviteStatusCopy(focusedInvite.status).label}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border/70 bg-canvas/70 px-4 py-3 text-sm font-medium text-muted-foreground">
            {focusedInvite.status === "DECLINED"
              ? `${focusedInvite.invitee.name} declined this invitation on ${formatInviteMoment(
                  focusedInvite.respondedAt,
                )}.`
              : focusedInvite.status === "ACCEPTED"
                ? `${focusedInvite.invitee.name} joined the group on ${formatInviteMoment(
                    focusedInvite.respondedAt,
                  )}.`
                : `${getInviteStatusCopy(focusedInvite.status).label} as of ${formatInviteMoment(
                    focusedInvite.respondedAt ??
                      focusedInvite.expiresAt ??
                      focusedInvite.createdAt,
                  )}.`}
          </div>
        </motion.article>
      ) : (
        <div className="mt-4 rounded-2xl border border-border/70 bg-canvas/70 px-4 py-5 text-sm font-medium text-muted-foreground">
          That invite is no longer available in your recent sent history.
        </div>
      )}
    </section>
  );
}
