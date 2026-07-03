import { domMax, LazyMotion, m } from "framer-motion";
import { Reply } from "lucide-react";
import type { ReactNode } from "react";

import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { getProposalSwipeShellStateForOwnership } from "./proposal-message-render-state";
import type { ProposalMessageSwipeState } from "./proposal-message-types";

interface ProposalMessageSwipeShellProps {
  children: ReactNode;
  handleDragEnd: ProposalMessageSwipeState["handleDragEnd"];
  message: UnifiedMessage;
  opacity: ProposalMessageSwipeState["opacity"];
  scale: ProposalMessageSwipeState["scale"];
  x: ProposalMessageSwipeState["x"];
}

export function ProposalMessageSwipeShell({
  children,
  handleDragEnd,
  message,
  opacity,
  scale,
  x,
}: ProposalMessageSwipeShellProps) {
  const swipeShellState = getProposalSwipeShellStateForOwnership(message.isOwn);

  return (
    <LazyMotion features={domMax}>
      <m.div
        style={{ opacity, scale, x: swipeShellState.replyIndicatorX }}
        className={swipeShellState.replyIndicatorClassName}
      >
        <Reply className="size-4" strokeWidth={2.5} />
      </m.div>

      <m.div
        drag="x"
        dragConstraints={swipeShellState.dragConstraints}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={swipeShellState.dragSurfaceClassName}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
