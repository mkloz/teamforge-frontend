const ATTENTION_QUEUE_ENTER_EASE = [0.22, 1, 0.36, 1] as [
  number,
  number,
  number,
  number,
];

export function getAttentionQueueItemMotion({
  animateOnInsert,
  shouldReduceMotion,
}: {
  animateOnInsert: boolean;
  shouldReduceMotion: boolean | null;
}) {
  if (!animateOnInsert) {
    return {
      animate: { opacity: 1, y: 0 },
      initial: false as const,
    };
  }

  if (shouldReduceMotion) {
    return {
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      initial: { opacity: 0 },
      transition: { duration: 0.08 },
    };
  }

  return {
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -2 },
    initial: { opacity: 0, y: 4 },
    transition: {
      duration: 0.16,
      ease: ATTENTION_QUEUE_ENTER_EASE,
    },
  };
}
