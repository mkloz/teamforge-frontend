import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CircleCheck,
  Clock3,
  MessageCircleQuestion,
  ShieldOff,
  TriangleAlert,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";

import type {
  HomeContinuationAnswer,
  HomeContinuationFeedback,
} from "@/features/home/hooks/use-home-continuation-actions";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { buildGroupPlanDetailNavigation } from "@/shared/navigation";
import type { AttentionQueueContinuation } from "./attention-queue.types";
import { getQueueMomentLabel } from "./attention-queue-formatters";
import { AttentionQueueMetaList } from "./attention-queue-meta-list";
import { getQueueItemClassName } from "./queue-item-render-state";

interface ContinuationQueueItemState {
  feedback: HomeContinuationFeedback | null;
  isOnline: boolean;
  isPending: boolean;
  pendingAnswer: (HomeContinuationAnswer & { idempotencyKey: string }) | null;
}

interface ContinuationQueueItemProps {
  group: AttentionQueueContinuation;
  onAnswer: (answer: HomeContinuationAnswer) => Promise<void>;
  state: ContinuationQueueItemState;
}

export function ContinuationQueueItem({
  group,
  onAnswer,
  state,
}: ContinuationQueueItemProps) {
  const checkIn = group.continuationCheckIn;
  const feedback = getVisibleFeedback(state.feedback, state.isOnline);
  const model = getContinuationModel(group.name, feedback);
  const isActionable =
    feedback === null || feedback === "FAILED" || feedback === "OFFLINE";
  const actionsDisabled = !state.isOnline || state.isPending;
  const statusRef = useRef<HTMLParagraphElement>(null);
  const navigation = buildGroupPlanDetailNavigation(group.id, {
    source: "home",
  });
  const deadlineLabel = getQueueMomentLabel(
    checkIn.responseWindowEndsAt,
    "Answer by",
  );

  const answer = (response: HomeContinuationAnswer["response"]) =>
    void onAnswer({
      checkInId: checkIn.id,
      response,
    });

  useEffect(() => {
    if (!isActionable) {
      statusRef.current?.focus();
    }
  }, [isActionable]);

  return (
    <li
      className={getQueueItemClassName(false, "hover:bg-primary-soft")}
      aria-live="polite"
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <IconTile icon={model.icon} size="lg" tone={model.tone} />
          <div className="min-w-0 flex-1">
            <p
              ref={statusRef}
              className="font-bold text-foreground text-sm"
              tabIndex={isActionable ? undefined : -1}
            >
              {isActionable ? (
                <>
                  Are you still meeting or keeping in touch with{" "}
                  <Link
                    {...navigation}
                    className="rounded-sm underline decoration-border underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {group.name}
                  </Link>
                  ?
                </>
              ) : (
                model.title
              )}
            </p>
            <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed">
              {model.description}
            </p>
            {deadlineLabel ? (
              <AttentionQueueMetaList
                items={[{ icon: Clock3, label: deadlineLabel }]}
              />
            ) : null}
          </div>
        </div>

        {isActionable ? (
          <div className="flex shrink-0 items-center justify-end gap-2 pl-13 sm:pl-0">
            <Button
              variant="outline"
              size="xs"
              className="h-11 [@media(pointer:fine)]:h-9"
              disabled={actionsDisabled}
              loading={isPendingResponse(checkIn.id, "NOT_CONTINUED", state)}
              onClick={() => answer("NOT_CONTINUED")}
              aria-label={`No, I am not still meeting or keeping in touch with ${group.name}`}
              title={
                state.isOnline
                  ? undefined
                  : "Reconnect before answering this check-in."
              }
            >
              <X className="size-3.5" aria-hidden="true" />
              No
            </Button>
            <Button
              size="xs"
              className="h-11 [@media(pointer:fine)]:h-9"
              disabled={actionsDisabled}
              loading={isPendingResponse(checkIn.id, "CONTINUED", state)}
              onClick={() => answer("CONTINUED")}
              aria-label={`Yes, I am still meeting or keeping in touch with ${group.name}`}
              title={
                state.isOnline
                  ? undefined
                  : "Reconnect before answering this check-in."
              }
            >
              <Check className="size-3.5" aria-hidden="true" />
              Yes
            </Button>
          </div>
        ) : feedback !== "NO_LONGER_ELIGIBLE" ? (
          <Link
            {...navigation}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1 self-end rounded-full border border-border px-3 font-bold text-foreground text-xs transition-all hover:-translate-y-0.5 hover:border-foreground/35 hover:shadow-soft-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground sm:h-8 sm:self-auto"
          >
            View group
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </li>
  );
}

function getVisibleFeedback(
  feedback: HomeContinuationFeedback | null,
  isOnline: boolean,
) {
  if (feedback === "OFFLINE" && isOnline) {
    return null;
  }

  if (
    !isOnline &&
    feedback !== "ANSWERED" &&
    feedback !== "CLOSED" &&
    feedback !== "NO_LONGER_ELIGIBLE"
  ) {
    return "OFFLINE";
  }

  return feedback;
}

function getContinuationModel(
  groupName: string,
  feedback: HomeContinuationFeedback | null,
) {
  if (feedback === "ANSWERED") {
    return {
      description: "Only you can see your response.",
      icon: CircleCheck,
      title: `Your check-in for ${groupName} is saved.`,
      tone: "teal" as const,
    };
  }

  if (feedback === "CLOSED") {
    return {
      description: "The response window ended before an answer was saved.",
      icon: Clock3,
      title: `The check-in for ${groupName} has closed.`,
      tone: "muted" as const,
    };
  }

  if (feedback === "NO_LONGER_ELIGIBLE") {
    return {
      description: `You can no longer answer this check-in for ${groupName}.`,
      icon: ShieldOff,
      title: "This check-in is no longer available.",
      tone: "muted" as const,
    };
  }

  if (feedback === "FAILED") {
    return {
      description: "We couldn't save your answer. Try again.",
      icon: TriangleAlert,
      title: "",
      tone: "destructive" as const,
    };
  }

  if (feedback === "OFFLINE") {
    return {
      description: "Reconnect to answer. Your response will stay private.",
      icon: WifiOff,
      title: "",
      tone: "muted" as const,
    };
  }

  return {
    description: "Your answer is private. Other members won't see it.",
    icon: MessageCircleQuestion,
    title: "",
    tone: "teal" as const,
  };
}

function isPendingResponse(
  checkInId: string,
  response: HomeContinuationAnswer["response"],
  state: ContinuationQueueItemState,
) {
  return (
    state.isPending &&
    state.pendingAnswer?.checkInId === checkInId &&
    state.pendingAnswer.response === response
  );
}
