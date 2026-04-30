import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { BellRing, Check, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useExploreFriendRequests } from "../hooks/use-explore-friend-requests";
import { useExploreRouteState } from "../hooks/use-explore-route-state";

function getCounterpartName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function FriendRequestReview() {
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
  const { focusedPanel, focusedRequestId, clearFocusedFriendRequest } =
    useExploreRouteState();
  const [hiddenRequestIds, setHiddenRequestIds] = useState<string[]>([]);

  const visibleRequests = requests.filter(
    (request) => !hiddenRequestIds.includes(request.requesterId),
  );
  const shouldRender = focusedPanel === "friends" || visibleRequests.length > 0;

  useEffect(() => {
    if (focusedPanel !== "friends" || !focusedRequestId) {
      return;
    }

    if (
      visibleRequests.some(
        (request) => request.requesterId === focusedRequestId,
      )
    ) {
      return;
    }

    clearFocusedFriendRequest();
  }, [
    clearFocusedFriendRequest,
    focusedPanel,
    focusedRequestId,
    visibleRequests,
  ]);

  if (!shouldRender) {
    return null;
  }

  const handleAccept = async (requesterId: string) => {
    setHiddenRequestIds((current) =>
      current.includes(requesterId) ? current : [...current, requesterId],
    );

    try {
      await acceptRequest(requesterId);
      if (focusedRequestId === requesterId) {
        clearFocusedFriendRequest();
      }
    } catch {
      setHiddenRequestIds((current) =>
        current.filter((id) => id !== requesterId),
      );
    }
  };

  const handleDecline = async (requesterId: string) => {
    setHiddenRequestIds((current) =>
      current.includes(requesterId) ? current : [...current, requesterId],
    );

    try {
      await declineRequest(requesterId);
      if (focusedRequestId === requesterId) {
        clearFocusedFriendRequest();
      }
    } catch {
      setHiddenRequestIds((current) =>
        current.filter((id) => id !== requesterId),
      );
    }
  };

  return (
    <section className="mb-6 rounded-3xl border border-border bg-card/90 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-forge-teal/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-forge-teal">
            <BellRing className="size-3.5" />
            Review requests
          </div>
          <h2 className="text-lg font-black tracking-tight text-foreground">
            Friend requests
          </h2>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground">
            Respond here, then keep exploring once your network is up to date.
          </p>
        </div>
        {focusedPanel === "friends" ? (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={clearFocusedFriendRequest}
          >
            Close
          </Button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {isLoading ? (
          <div className="rounded-2xl border border-border/70 bg-canvas/60 px-4 py-5 text-sm font-medium text-muted-foreground">
            Loading friend requests.
          </div>
        ) : visibleRequests.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-canvas/60 px-4 py-5 text-sm font-medium text-muted-foreground">
            No pending friend requests right now.
          </div>
        ) : (
          visibleRequests.map((request, index) => {
            const counterpart = request.counterpart;
            const isFocused = request.requesterId === focusedRequestId;

            return (
              <motion.article
                key={request.requesterId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: index * 0.04 }}
                className={cn(
                  "rounded-2xl border bg-canvas/70 p-4 transition-colors",
                  isFocused
                    ? "border-forge-teal/50 ring-2 ring-forge-teal/30 bg-forge-teal/5"
                    : "border-border/70",
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    src={counterpart.avatar}
                    name={counterpart.name}
                    fallback={
                      <UserPlus className="size-5 text-muted-foreground" />
                    }
                    className="size-12 border border-border/60 bg-muted/40"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-black text-foreground">
                        {counterpart.name}
                      </h3>
                      {counterpart.personalityType ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                          {counterpart.personalityType}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
                      {getCounterpartName(counterpart.name)} wants to connect
                      with you on TeamForge.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        className="rounded-xl"
                        disabled={isAccepting || isDeclining}
                        onClick={() => void handleAccept(request.requesterId)}
                      >
                        <Check className="size-4" />
                        {acceptingRequestId === request.requesterId
                          ? "Accepting..."
                          : "Accept"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        disabled={isAccepting || isDeclining}
                        onClick={() => void handleDecline(request.requesterId)}
                      >
                        <X className="size-4" />
                        {decliningRequestId === request.requesterId
                          ? "Declining..."
                          : "Decline"}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })
        )}
      </div>
    </section>
  );
}
