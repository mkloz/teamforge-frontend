import { type PanInfo, useMotionValue, useTransform } from "framer-motion";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { useActivityStore } from "@/features/activity/store/activity.store";

/**
 * Handles the horizontal drag gesture used to reply to a message.
 */
export function useSwipeToReply(message: UnifiedMessage, isOwn: boolean) {
  const setReplyingTo = useActivityStore((state) => state.setReplyingTo);

  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);
  const scale = useTransform(x, [0, 50, 100], [0.8, 0.9, 1]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // Trigger a reply after an 80px horizontal drag.
    if (info.offset.x > 80 && !isOwn) {
      setReplyingTo(message);
    } else if (info.offset.x < -80 && isOwn) {
      setReplyingTo(message);
    }
  };

  return {
    x,
    opacity,
    scale,
    handleDragEnd,
  };
}
