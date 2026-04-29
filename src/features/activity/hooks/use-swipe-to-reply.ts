import { type PanInfo, useMotionValue, useTransform } from "framer-motion";
import { useActivityStore } from "../store/activity.store";
import type { UnifiedMessage } from "../lib/activity-contract";

/**
 * useSwipeToReply - Encapsulates logic for swipe-to-reply gesture.
 */
export function useSwipeToReply(message: UnifiedMessage, isOwn: boolean) {
  const setReplyingTo = useActivityStore((state) => state.setReplyingTo);

  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 50, 100], [0, 0.5, 1]);
  const scale = useTransform(x, [0, 50, 100], [0.8, 0.9, 1]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // Threshold of 80px for triggering reply
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
