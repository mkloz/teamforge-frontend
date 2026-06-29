import { type RefObject, useMemo } from "react";

import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { ScrollToMessageOptions } from "./message-scroll.types";

interface UsePendingProposalShortcutInput {
  containerRef?: RefObject<HTMLDivElement | null>;
  getMessageElement: (id: string) => HTMLDivElement | null;
  messages: UnifiedMessage[];
  scrollToMessage: (id: string, options?: ScrollToMessageOptions) => void;
}

export function usePendingProposalShortcut({
  containerRef,
  getMessageElement,
  messages,
  scrollToMessage,
}: UsePendingProposalShortcutInput) {
  const pendingProposalMessages = useMemo(
    () =>
      messages.filter(
        (message) =>
          message.type === "PLAN_UPDATE" &&
          message.proposal?.status === "PENDING",
      ),
    [messages],
  );

  function scrollToClosestProposal() {
    const targetIds = pendingProposalMessages.map((message) => message.id);

    if (targetIds.length === 0) {
      return;
    }

    const viewport = containerRef?.current;
    const scrollOptions: ScrollToMessageOptions = { highlight: true };

    if (!viewport) {
      scrollToMessage(targetIds[0], scrollOptions);
      return;
    }

    const viewportCenter = viewport.scrollTop + viewport.clientHeight / 2;

    const closestTarget = targetIds
      .map((id) => {
        const element = getMessageElement(id);

        if (!element) {
          return null;
        }

        const distance = Math.abs(
          element.offsetTop + element.offsetHeight / 2 - viewportCenter,
        );

        return { distance, id };
      })
      .flatMap((candidate) => (candidate ? [candidate] : []))
      .sort((left, right) => left.distance - right.distance)[0];

    scrollToMessage(closestTarget?.id ?? targetIds[0], scrollOptions);
  }

  return {
    hasProposalShortcut: pendingProposalMessages.length > 0,
    scrollToClosestProposal,
  };
}
