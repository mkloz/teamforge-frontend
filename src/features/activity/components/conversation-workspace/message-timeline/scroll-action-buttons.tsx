import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CountBadge } from "@/shared/components/ui/count-badge";

interface ScrollActionButtonsProps {
  showScrollToBottom: boolean;
  onScrollToBottom: () => void;
  newMessageCount: number;
  hasProposalShortcut: boolean;
  onScrollToProposal: () => void;
}

const proposalShortcutMotion = {
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: -8 },
  initial: { opacity: 0, scale: 0.8, y: -8 },
} as const;

const scrollToBottomMotion = {
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 10 },
  initial: { opacity: 0, scale: 0.8, y: 10 },
} as const;

export function ScrollActionButtons({
  showScrollToBottom,
  onScrollToBottom,
  newMessageCount,
  hasProposalShortcut,
  onScrollToProposal,
}: ScrollActionButtonsProps) {
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="popLayout">
        {hasProposalShortcut && (
          <ProposalShortcutButton onScrollToProposal={onScrollToProposal} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {showScrollToBottom && (
          <ScrollToBottomButton
            newMessageCount={newMessageCount}
            onScrollToBottom={onScrollToBottom}
          />
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}

function ProposalShortcutButton({
  onScrollToProposal,
}: {
  onScrollToProposal: () => void;
}) {
  return (
    <m.div
      initial={proposalShortcutMotion.initial}
      animate={proposalShortcutMotion.animate}
      exit={proposalShortcutMotion.exit}
      className="pointer-events-none absolute top-4 right-4 z-30"
    >
      <Button
        onClick={onScrollToProposal}
        variant="secondary"
        size="xs"
        className="pointer-events-auto px-2.5 py-1.5 shadow-md"
        aria-label="Jump to proposal that needs your vote"
      >
        <AlertCircle className="size-3.5 animate-pulse motion-reduce:animate-none" />
        <span className="font-black text-xs tracking-wider">Vote</span>
      </Button>
    </m.div>
  );
}

function ScrollToBottomButton({
  newMessageCount,
  onScrollToBottom,
}: {
  newMessageCount: number;
  onScrollToBottom: () => void;
}) {
  return (
    <m.div
      initial={scrollToBottomMotion.initial}
      animate={scrollToBottomMotion.animate}
      exit={scrollToBottomMotion.exit}
      className="pointer-events-none absolute right-6 bottom-6 z-30"
    >
      <Button
        onClick={() => onScrollToBottom()}
        variant="outline"
        size="icon"
        className="pointer-events-auto relative size-10 shrink-0 rounded-full"
        aria-label={getScrollToBottomLabel(newMessageCount)}
      >
        <ChevronDown className="size-5 transition-transform group-hover:translate-y-0.5" />
        {newMessageCount > 0 && (
          <CountBadge
            count={newMessageCount}
            max={99}
            size="xs"
            tone="amber"
            className="type-signature-label absolute -top-1 -right-1 z-10 h-4 min-w-4 px-1 leading-4 ring-2 ring-canvas"
          />
        )}
      </Button>
    </m.div>
  );
}

function getScrollToBottomLabel(newMessageCount: number) {
  return newMessageCount > 0
    ? `Scroll to latest messages, ${formatNewMessageCountLabel(newMessageCount)} new`
    : "Scroll to latest messages";
}

function formatNewMessageCountLabel(newMessageCount: number) {
  return newMessageCount > 98 ? "99+" : String(newMessageCount);
}
