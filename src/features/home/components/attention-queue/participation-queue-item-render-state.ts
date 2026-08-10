import { CalendarCheck2, Clock3 } from "lucide-react";

import type { HomeParticipationAnswer } from "@/features/home/hooks/use-home-participation-actions";
import type { AttentionQueueParticipation } from "./attention-queue.types";
import { getQueueMomentLabel } from "./attention-queue-formatters";
import {
  getQueueActionDisabled,
  getQueueItemClassName,
  getQueueOfflineTitle,
} from "./queue-item-render-state";

export interface ParticipationQueueItemState {
  isOnline: boolean;
  isPending: boolean;
  pendingAnswer: HomeParticipationAnswer | null;
}

export function getParticipationQueueItemRenderState(
  group: AttentionQueueParticipation,
  state: ParticipationQueueItemState,
) {
  const plan = group.pendingParticipationPlan;
  const actionsDisabled = getQueueActionDisabled({
    isAccepting: state.isPending,
    isDeclining: false,
    isOnline: state.isOnline,
  });

  return {
    actionsDisabled,
    actionTitle: getQueueOfflineTitle(
      state.isOnline,
      "Reconnect before answering this check-in.",
    ),
    isNoLoading:
      state.isPending &&
      isCurrentAnswer(group, state.pendingAnswer, "DID_NOT_PARTICIPATE"),
    isYesLoading:
      state.isPending &&
      isCurrentAnswer(group, state.pendingAnswer, "PARTICIPATED"),
    plan,
    planMeta: getParticipationMeta(group),
    rowClassName: getQueueItemClassName(false, "hover:bg-primary-soft"),
  };
}

function isCurrentAnswer(
  group: AttentionQueueParticipation,
  answer: HomeParticipationAnswer | null,
  status: HomeParticipationAnswer["status"],
) {
  return (
    answer?.groupId === group.id &&
    answer.planId === group.pendingParticipationPlan.id &&
    answer.status === status
  );
}

function getParticipationMeta(group: AttentionQueueParticipation) {
  const plan = group.pendingParticipationPlan;
  const completedLabel = getQueueMomentLabel(plan.completedAt, "Completed");
  const deadlineLabel = plan.responseDeadline
    ? getQueueMomentLabel(plan.responseDeadline, "Answer by")
    : null;

  return [
    completedLabel ? { icon: CalendarCheck2, label: completedLabel } : null,
    deadlineLabel ? { icon: Clock3, label: deadlineLabel } : null,
  ].filter(isParticipationMetaItem);
}

function isParticipationMetaItem<Item>(item: Item | null): item is Item {
  return item !== null;
}
