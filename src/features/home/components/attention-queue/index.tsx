import {
  lazy,
  type RefObject,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { HomeSectionHeading } from "@/features/home/components/home-section-heading";
import { HomeAttentionQueueRowsSkeleton } from "@/features/home/components/home-skeletons";
import {
  cancelIdleTask,
  scheduleIdleTask,
} from "@/shared/lib/browser-scheduling";
import type {
  HomeInvitationView,
  HomePanel,
} from "@/shared/navigation/home-navigation";

const LazyLoadedAttentionQueue = lazy(() =>
  import("./attention-queue-loaded").then((module) => ({
    default: module.LoadedAttentionQueue,
  })),
);

interface AttentionQueueProps {
  focusedPanel?: HomePanel | null;
  focusedInviteId?: string | null;
  focusedRequestId?: string | null;
  invitationView?: HomeInvitationView;
  focusRef?: RefObject<HTMLElement | null>;
  onClearInvitationFocus?: () => void;
  onClearFriendRequestFocus?: () => void;
}

export function AttentionQueue({
  focusedPanel = null,
  focusedInviteId = null,
  focusedRequestId = null,
  invitationView = "received",
  focusRef,
  onClearInvitationFocus,
  onClearFriendRequestFocus,
}: AttentionQueueProps) {
  const hasFocusedQueueTarget =
    focusedPanel === "invitations" ||
    Boolean(focusedInviteId || focusedRequestId);
  const [
    hasDeferredInteractiveQueueLoaded,
    setHasDeferredInteractiveQueueLoaded,
  ] = useState(false);
  const shouldLoadInteractiveQueue =
    hasFocusedQueueTarget || hasDeferredInteractiveQueueLoaded;

  useEffect(() => {
    if (shouldLoadInteractiveQueue) {
      return undefined;
    }

    const idleTask = scheduleIdleTask(() => {
      setHasDeferredInteractiveQueueLoaded(true);
    });

    return () => cancelIdleTask(idleTask);
  }, [shouldLoadInteractiveQueue]);

  function keepInteractiveQueueLoaded() {
    setHasDeferredInteractiveQueueLoaded(true);
  }

  function handleClearInvitationFocus() {
    keepInteractiveQueueLoaded();
    onClearInvitationFocus?.();
  }

  function handleClearFriendRequestFocus() {
    keepInteractiveQueueLoaded();
    onClearFriendRequestFocus?.();
  }

  if (!shouldLoadInteractiveQueue) {
    return <AttentionQueueShell focusRef={focusRef} />;
  }

  return (
    <Suspense fallback={<AttentionQueueShell focusRef={focusRef} />}>
      <LazyLoadedAttentionQueue
        focusedPanel={focusedPanel}
        focusedInviteId={focusedInviteId}
        focusedRequestId={focusedRequestId}
        invitationView={invitationView}
        focusRef={focusRef}
        onClearInvitationFocus={handleClearInvitationFocus}
        onClearFriendRequestFocus={handleClearFriendRequestFocus}
      />
    </Suspense>
  );
}

function AttentionQueueShell({
  focusRef,
}: {
  focusRef?: RefObject<HTMLElement | null>;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollRef = focusRef ?? sectionRef;

  return (
    <section
      ref={scrollRef}
      aria-labelledby="attention-queue-heading"
      id="home-attention"
      className="scroll-mt-6"
    >
      <HomeSectionHeading
        id="attention-queue-heading"
        eyebrow="Right now"
        title="Action queue"
        description="Invites, requests, and plan details waiting on a clear decision."
      />

      <ul
        aria-label="Things that need attention"
        className="mt-4 grid min-w-0 list-none border-border/55 border-y p-0"
      >
        <HomeAttentionQueueRowsSkeleton />
      </ul>
    </section>
  );
}
