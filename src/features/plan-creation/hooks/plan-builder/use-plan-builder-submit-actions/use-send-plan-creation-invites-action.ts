import { useState } from "react";

import { PlanCreationCommands } from "@/features/plan-creation/api/plan-creation-commands";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { captureException } from "@/shared/lib/telemetry";

import type { UsePlanBuilderSubmitActionsOptions } from "./types";

type UseSendPlanCreationInvitesActionOptions = Pick<
  UsePlanBuilderSubmitActionsOptions,
  "setField" | "state"
>;
type PlanCreationInviteState = UsePlanBuilderSubmitActionsOptions["state"];
type ManualInviteRequest = Pick<
  PlanCreationInviteState,
  "manualInviteeIds" | "planName"
> & {
  groupId: string;
};

export function useSendPlanCreationInvitesAction({
  setField,
  state,
}: UseSendPlanCreationInvitesActionOptions) {
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const { guardOfflineAction } = useOfflineActionGuard();
  const { groupId, manualInviteeIds, planName } = state;

  async function handleSendInvites() {
    if (!groupId) {
      captureMissingPlanCreationGroup();
      return;
    }

    if (shouldBlockPlanCreationInviteSend({ guardOfflineAction })) {
      return;
    }

    setIsSendingInvites(true);

    try {
      await sendManualInvitesIfNeeded({
        groupId,
        manualInviteeIds,
        planName,
      });
      setField("invitesSent", true);
      setIsSendingInvites(false);
    } catch (error) {
      captureException("planCreation.sendInvites", error, {
        groupId,
      });
      setIsSendingInvites(false);
    }
  }

  return {
    handleSendInvites,
    isSendingInvites,
  };
}

function captureMissingPlanCreationGroup() {
  captureException(
    "planCreation.sendInvites",
    new Error("Cannot send invitations before a group is formed."),
    {
      groupId: "missing",
    },
  );
}

function shouldBlockPlanCreationInviteSend({
  guardOfflineAction,
}: Pick<ReturnType<typeof useOfflineActionGuard>, "guardOfflineAction">) {
  return guardOfflineAction({
    id: "plan-creation-manual-invites-offline",
    description: "Reconnect before sending invites.",
  });
}

async function sendManualInvitesIfNeeded({
  groupId,
  manualInviteeIds,
  planName,
}: ManualInviteRequest) {
  await PlanCreationCommands.sendManualInvites({
    groupId,
    inviteeIds: manualInviteeIds,
    planName,
  });
}
