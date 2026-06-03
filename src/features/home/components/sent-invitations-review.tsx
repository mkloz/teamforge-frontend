import { BellRing, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
import type { Invite } from "@/shared/schemas";
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
          <StatusPill
            icon={BellRing}
            size="sm"
            tone="teal"
            surface="soft"
            className="w-fit px-3 py-1"
          >
            Sent invite update
          </StatusPill>
          <h2 className="font-black text-foreground text-lg tracking-tight">
            Invite status
          </h2>
          <p className="font-medium text-muted-foreground text-sm leading-relaxed">
            Review the exact invitation that changed and decide what to do next.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={onClose}
        >
          <X className="size-3.5" aria-hidden="true" />
          Close
        </Button>
      </div>

      {focusedInvite ? (
        <article className="mt-4 rounded-xl border border-forge-teal/40 bg-forge-teal/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-muted-foreground text-xs">
                {focusedInvite.group.name}
              </p>
              <h3 className="mt-1 truncate font-black text-base text-foreground">
                {focusedInvite.invitee.name}
              </h3>
              <p className="mt-2 font-medium text-muted-foreground text-sm leading-relaxed">
                {focusedInvite.message?.trim() ||
                  `This invite was sent to ${focusedInvite.invitee.name} for ${focusedInvite.group.name}.`}
              </p>
            </div>
            <StatusPill
              icon={StatusIcon}
              size="sm"
              textCase="upper"
              tone={focusedInviteStatus?.tone}
              className="px-3 py-1 font-black"
            >
              {focusedInviteStatus?.label}
            </StatusPill>
          </div>

          <div className="mt-4 rounded-xl border border-border/70 bg-canvas/70 px-4 py-3 font-medium text-muted-foreground text-sm">
            {getInviteStatusSentence(focusedInvite)}
          </div>
        </article>
      ) : (
        <div className="mt-4 rounded-xl border border-border/70 bg-canvas/70 px-4 py-5 font-medium text-muted-foreground text-sm">
          That invite is no longer available in your recent sent history.
        </div>
      )}
    </section>
  );
}
