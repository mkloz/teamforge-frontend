import { useEffect, useRef, useState } from "react";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { warnInDevelopment } from "@/shared/lib/development-warning";
import type { ChatApi } from "@/shared/schemas";
import { getChatUnreadCount } from "./activity-message-timeline-state";

const ACTIVITY_TIMELINE_RESUME_REFETCH_COOLDOWN_MS = 12_000;

interface UseTimelineResumeRefetchInput {
  canLoadTimeline: boolean;
  isFetching: boolean;
  refetch: () => Promise<unknown>;
  resetKey: string;
}

interface UseFirstUnreadMessageIdInput {
  chatId: string | null;
  computedFirstUnreadMessageId: string | null;
}

interface UseMarkLatestMessageReadInput {
  chatId: string | null;
  chatSummary: ChatApi | null;
  latestReadableMessageId: string | null;
}

export function useTimelineResumeRefetch({
  canLoadTimeline,
  isFetching,
  refetch,
  resetKey,
}: UseTimelineResumeRefetchInput) {
  const isFetchingMessagesRef = useRef(false);
  const lastResumeRefetchAtRef = useRef(0);
  const resumeRefetchInFlightRef = useRef<Promise<void> | null>(null);
  const resumeRefetchRef = useRef(refetch);

  useEffect(() => {
    isFetchingMessagesRef.current = isFetching;
  }, [isFetching]);

  useEffect(() => {
    resumeRefetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    lastResumeRefetchAtRef.current = 0;
    resumeRefetchInFlightRef.current = null;

    if (!canLoadTimeline || resetKey.length === 0) {
      return undefined;
    }

    function refetchTimelineAfterResume(reason: string) {
      if (
        shouldSkipResumeRefetch(
          isFetchingMessagesRef.current,
          resumeRefetchInFlightRef.current,
        )
      ) {
        return;
      }

      const now = Date.now();

      if (isWithinResumeRefetchCooldown(now, lastResumeRefetchAtRef.current)) {
        return;
      }

      lastResumeRefetchAtRef.current = now;

      const refetchPromise = runResumeRefetch(resumeRefetchRef.current, reason);

      resumeRefetchInFlightRef.current = refetchPromise;

      void refetchPromise.finally(() => {
        if (resumeRefetchInFlightRef.current === refetchPromise) {
          resumeRefetchInFlightRef.current = null;
        }
      });
    }

    function handleFocus() {
      refetchTimelineAfterResume("window focus");
    }

    function handleOnline() {
      refetchTimelineAfterResume("network reconnect");
    }

    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        refetchTimelineAfterResume("page restore");
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        refetchTimelineAfterResume("app foreground");
      }
    }

    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [canLoadTimeline, resetKey]);
}

export function useFirstUnreadMessageId({
  chatId,
  computedFirstUnreadMessageId,
}: UseFirstUnreadMessageIdInput) {
  const firstUnreadChatIdRef = useRef<string | null>(null);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (firstUnreadChatIdRef.current !== chatId) {
      firstUnreadChatIdRef.current = chatId;
      setFirstUnreadMessageId(computedFirstUnreadMessageId);
      return;
    }

    if (!firstUnreadMessageId && computedFirstUnreadMessageId) {
      setFirstUnreadMessageId(computedFirstUnreadMessageId);
    }
  }, [chatId, computedFirstUnreadMessageId, firstUnreadMessageId]);

  return firstUnreadChatIdRef.current === chatId
    ? (firstUnreadMessageId ?? computedFirstUnreadMessageId)
    : computedFirstUnreadMessageId;
}

export function useMarkLatestMessageRead({
  chatId,
  chatSummary,
  latestReadableMessageId,
}: UseMarkLatestMessageReadInput) {
  const lastMarkedReadRef = useRef<string | null>(null);

  useEffect(() => {
    if (!chatId || !latestReadableMessageId) {
      return;
    }

    if (!chatSummary || getChatUnreadCount(chatSummary) === 0) {
      return;
    }

    const markReadKey = `${chatId}:${latestReadableMessageId}`;

    if (lastMarkedReadRef.current === markReadKey) {
      return;
    }

    lastMarkedReadRef.current = markReadKey;
    void ActivityCommands.markChatRead(chatId, latestReadableMessageId).catch(
      () => {
        if (lastMarkedReadRef.current === markReadKey) {
          lastMarkedReadRef.current = null;
        }
      },
    );
  }, [chatId, chatSummary, latestReadableMessageId]);
}

function shouldSkipResumeRefetch(
  isFetchingMessages: boolean,
  resumeRefetchInFlight: Promise<void> | null,
) {
  return (
    document.visibilityState === "hidden" ||
    !navigator.onLine ||
    isFetchingMessages ||
    Boolean(resumeRefetchInFlight)
  );
}

function isWithinResumeRefetchCooldown(now: number, lastRefetchAt: number) {
  return now - lastRefetchAt < ACTIVITY_TIMELINE_RESUME_REFETCH_COOLDOWN_MS;
}

function runResumeRefetch(refetch: () => Promise<unknown>, reason: string) {
  return refetch()
    .then(() => undefined)
    .catch((error: unknown) => {
      warnInDevelopment(
        `Activity timeline resume refresh failed after ${reason}.`,
        error,
      );
    });
}
