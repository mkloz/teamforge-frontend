import { Check, ClipboardCheck, X } from "lucide-react";

import type { HomeParticipationAnswer } from "@/features/home/hooks/use-home-participation-actions";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import type { AttentionQueueParticipation } from "./attention-queue.types";
import { AttentionQueueMetaList } from "./attention-queue-meta-list";
import {
  getParticipationQueueItemRenderState,
  type ParticipationQueueItemState,
} from "./participation-queue-item-render-state";

interface ParticipationQueueItemProps {
  group: AttentionQueueParticipation;
  onAnswer: (answer: HomeParticipationAnswer) => Promise<void>;
  state: ParticipationQueueItemState;
}

export function ParticipationQueueItem({
  group,
  onAnswer,
  state,
}: ParticipationQueueItemProps) {
  const {
    actionsDisabled,
    actionTitle,
    isNoLoading,
    isYesLoading,
    plan,
    planMeta,
    rowClassName,
  } = getParticipationQueueItemRenderState(group, state);

  const answer = (status: HomeParticipationAnswer["status"]) =>
    void onAnswer({
      groupId: group.id,
      planId: plan.id,
      responseDeadline: plan.responseDeadline,
      status,
    });

  return (
    <li className={rowClassName}>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <IconTile icon={ClipboardCheck} size="lg" tone="teal" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground text-sm">
              Did you take part in {plan.title}?
            </p>
            <p className="mt-1 font-medium text-muted-foreground text-xs leading-relaxed">
              Your answer is private and can't be changed.
            </p>
            <AttentionQueueMetaList items={planMeta} />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 pl-13 sm:pl-0">
          <Button
            variant="outline"
            size="xs"
            disabled={actionsDisabled}
            loading={isNoLoading}
            onClick={() => answer("DID_NOT_PARTICIPATE")}
            aria-label={`No, I did not take part in ${plan.title}`}
            title={actionTitle}
          >
            <X className="size-3.5" aria-hidden="true" />
            No
          </Button>
          <Button
            size="xs"
            disabled={actionsDisabled}
            loading={isYesLoading}
            onClick={() => answer("PARTICIPATED")}
            aria-label={`Yes, I took part in ${plan.title}`}
            title={actionTitle}
          >
            <Check className="size-3.5" aria-hidden="true" />
            Yes
          </Button>
        </div>
      </div>
    </li>
  );
}
