import type { HomeInvitationView } from "@/features/home/lib/home-route";
import { AnimatePresence, motion } from "framer-motion";
import { Mail } from "lucide-react";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useOptimistic,
  type RefObject,
} from "react";

import { InvitationCard } from "./invitation-card";
import { useHomeData } from "@/features/home/hooks/use-home-data";
import { useHomeInvitationActions } from "@/features/home/hooks/use-home-invitation-actions";

interface InvitationsProps {
  focusedInviteId?: string | null;
  focusedView?: HomeInvitationView;
  focusRef?: RefObject<HTMLElement | null>;
  onClearFocus?: () => void;
}

export function Invitations({
  focusedInviteId = null,
  focusedView = "received",
  focusRef,
  onClearFocus,
}: InvitationsProps) {
  const { invitations } = useHomeData();
  const [pending, removePendingInvitation] = useOptimistic(
    invitations,
    (currentInvitations, inviteId: string) =>
      currentInvitations.filter((invite) => invite.id !== inviteId),
  );
  const {
    acceptInvitation,
    declineInvitation,
    isAccepting,
    isDeclining,
    acceptingInviteId,
    decliningInviteId,
    actionError,
    clearActionError,
  } = useHomeInvitationActions();
  const clearFocusedInvitation = useEffectEvent(() => {
    onClearFocus?.();
  });

  useEffect(() => {
    if (focusedView !== "received") {
      return;
    }

    if (!focusedInviteId) {
      return;
    }

    if (pending.some((invite) => invite.id === focusedInviteId)) {
      return;
    }

    clearFocusedInvitation();
  }, [focusedInviteId, focusedView, pending]);

  function handleAccept(id: string) {
    clearActionError();

    startTransition(async () => {
      removePendingInvitation(id);

      try {
        await acceptInvitation(id);
        if (focusedInviteId === id) {
          onClearFocus?.();
        }
      } catch {
        // useOptimistic restores the base invitation list when the Action ends.
      }
    });
  }

  function handleDecline(id: string) {
    clearActionError();

    startTransition(async () => {
      removePendingInvitation(id);

      try {
        await declineInvitation(id);
        if (focusedInviteId === id) {
          onClearFocus?.();
        }
      } catch {
        // useOptimistic restores the base invitation list when the Action ends.
      }
    });
  }

  if (focusedView !== "received" || pending.length === 0) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key="invitations-section"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        ref={focusRef}
        aria-labelledby="invitations-heading"
        id="home-invitations"
        className="w-full flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2
              id="invitations-heading"
              className="text-base font-black tracking-tight text-foreground"
            >
              Invitations
            </h2>
            <motion.span
              key={pending.length}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-forge-teal text-xs font-black text-white"
              aria-live="polite"
              aria-atomic="true"
            >
              {pending.length}
            </motion.span>
          </div>

          <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>

        <div
          role="list"
          aria-label="Pending group invitations"
          className="flex flex-col gap-2"
        >
          {actionError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm font-medium text-foreground">
              {actionError}
            </div>
          ) : null}

          <AnimatePresence>
            {pending.map((inv, i) => (
              <div role="listitem" key={inv.id}>
                <InvitationCard
                  invitation={inv}
                  isFocused={focusedInviteId === inv.id}
                  index={i}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  isAccepting={isAccepting && acceptingInviteId === inv.id}
                  isDeclining={isDeclining && decliningInviteId === inv.id}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
