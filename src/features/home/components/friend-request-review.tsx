import { useEffect, useEffectEvent, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, UserPlus, X } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useExploreFriendRequests } from "@/features/explore/hooks/use-explore-friend-requests";
import type { HomePanel } from "@/features/home/lib/home-route";

function getCounterpartName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

interface FriendRequestReviewProps {
  focusedPanel?: HomePanel | null;
  focusedRequestId?: string | null;
  onClearFocus?: () => void;
}

export function FriendRequestReview({
  focusedPanel = null,
  focusedRequestId = null,
  onClearFocus,
}: FriendRequestReviewProps) {
  const {
    requests,
    isLoading,
    acceptRequest,
    declineRequest,
    acceptingRequestId,
    decliningRequestId,
    isAccepting,
    isDeclining,
  } = useExploreFriendRequests();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hiddenRequestIds, setHiddenRequestIds] = useState<string[]>([]);

  const visibleRequests = requests.filter(
    (request) => !hiddenRequestIds.includes(request.requesterId),
  );
  const isFocusedPanel = focusedPanel === "friends";
  const shouldRender = isFocusedPanel || visibleRequests.length > 0;
  const hasFocusedRequest = visibleRequests.some(
    (request) => request.requesterId === focusedRequestId,
  );
  const clearFocusedRequestFromEffect = useEffectEvent(() => {
    onClearFocus?.();
  });

  useEffect(() => {
    if (!isFocusedPanel) {
      return;
    }

    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [isFocusedPanel]);

  useEffect(() => {
    if (!isFocusedPanel || !focusedRequestId) {
      return;
    }

    if (hasFocusedRequest) {
      return;
    }

    clearFocusedRequestFromEffect();
  }, [focusedRequestId, hasFocusedRequest, isFocusedPanel]);

  if (!shouldRender) {
    return null;
  }

  const hideRequest = (requesterId: string) => {
    setHiddenRequestIds((current) =>
      current.includes(requesterId) ? current : [...current, requesterId],
    );
  };

  const restoreRequest = (requesterId: string) => {
    setHiddenRequestIds((current) =>
      current.filter((id) => id !== requesterId),
    );
  };

  const acceptVisibleRequest = async (requesterId: string) => {
    hideRequest(requesterId);

    try {
      await acceptRequest(requesterId);
      if (focusedRequestId === requesterId) {
        onClearFocus?.();
      }
    } catch {
      restoreRequest(requesterId);
    }
  };

  const declineVisibleRequest = async (requesterId: string) => {
    hideRequest(requesterId);

    try {
      await declineRequest(requesterId);
      if (focusedRequestId === requesterId) {
        onClearFocus?.();
      }
    } catch {
      restoreRequest(requesterId);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key="friend-requests-section"
        ref={sectionRef}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        aria-labelledby="friend-requests-heading"
        id="home-friend-requests"
        className="w-full scroll-mt-6"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2
              id="friend-requests-heading"
              className="text-base font-black tracking-tight text-foreground"
            >
              Friend requests
            </h2>
            {visibleRequests.length > 0 ? (
              <motion.span
                key={visibleRequests.length}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-forge-teal px-1.5 text-xs font-black text-white"
                aria-live="polite"
                aria-atomic="true"
              >
                {visibleRequests.length}
              </motion.span>
            ) : null}
          </div>

          <UserPlus className="size-4 text-muted-foreground" aria-hidden />
        </div>

        <div
          role="list"
          aria-label="Pending friend requests"
          className="flex flex-col gap-2"
        >
          {isLoading ? (
            <div className="rounded-2xl bg-secondary/40 px-3 py-4 text-sm font-medium text-muted-foreground">
              Checking friend requests.
            </div>
          ) : visibleRequests.length === 0 ? (
            <div className="rounded-2xl bg-secondary/40 px-3 py-4 text-sm font-medium text-muted-foreground">
              No pending friend requests right now.
            </div>
          ) : (
            <AnimatePresence>
              {visibleRequests.map((request, index) => {
                const counterpart = request.counterpart;
                const isFocused = request.requesterId === focusedRequestId;

                return (
                  <motion.article
                    role="listitem"
                    key={request.requesterId}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 16, scale: 0.96 }}
                    transition={{
                      duration: 0.26,
                      delay: index * 0.04,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl border p-2.5 transition-colors duration-200",
                      "border-transparent bg-secondary/45 hover:border-border/70 hover:bg-secondary/70",
                      isFocused &&
                        "border-forge-teal/45 bg-forge-teal/8 ring-2 ring-forge-teal/30",
                    )}
                  >
                    <Avatar
                      src={counterpart.avatar}
                      name={counterpart.name}
                      fallback={
                        <UserPlus className="size-4 text-muted-foreground" />
                      }
                      className="size-10 shrink-0 border border-border/50 bg-muted/40"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <h3 className="truncate text-sm font-black leading-snug text-foreground">
                          {counterpart.name}
                        </h3>
                        {counterpart.personalityType ? (
                          <span className="shrink-0 rounded-full bg-muted/70 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                            {counterpart.personalityType}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                        {getCounterpartName(counterpart.name)} wants to connect.
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="xs"
                        className="h-7 rounded-full px-2.5 text-[11px] shadow-none"
                        loading={acceptingRequestId === request.requesterId}
                        disabled={isAccepting || isDeclining}
                        onClick={() =>
                          void acceptVisibleRequest(request.requesterId)
                        }
                      >
                        <Check className="size-3" />
                        Accept
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="size-7 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        loading={decliningRequestId === request.requesterId}
                        disabled={isAccepting || isDeclining}
                        onClick={() =>
                          void declineVisibleRequest(request.requesterId)
                        }
                        aria-label={`Decline ${counterpart.name}'s friend request`}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
