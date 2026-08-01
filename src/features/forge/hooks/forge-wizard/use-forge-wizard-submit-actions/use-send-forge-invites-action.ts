import { useState } from "react";

import { ForgeCommands } from "@/features/forge/api/forge-commands";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { captureException } from "@/shared/lib/telemetry";

import type { UseForgeWizardSubmitActionsOptions } from "./types";

type UseSendForgeInvitesActionOptions = Pick<
  UseForgeWizardSubmitActionsOptions,
  "setField" | "state"
>;
type ForgeInviteState = UseForgeWizardSubmitActionsOptions["state"];
type ManualInviteRequest = Pick<
  ForgeInviteState,
  "manualInviteeIds" | "planName"
> & {
  groupId: string;
};

export function useSendForgeInvitesAction({
  setField,
  state,
}: UseSendForgeInvitesActionOptions) {
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const { guardOfflineAction } = useOfflineActionGuard();
  const { groupId, manualInviteeIds, planName } = state;

  async function handleSendInvites() {
    if (!groupId) {
      captureMissingForgeGroup();
      return;
    }

    if (shouldBlockForgeInviteSend({ guardOfflineAction })) {
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
      captureException("forge.sendInvites", error, {
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

function captureMissingForgeGroup() {
  captureException(
    "forge.sendInvites",
    new Error("Cannot send invitations before a group is formed."),
    {
      groupId: "missing",
    },
  );
}

function shouldBlockForgeInviteSend({
  guardOfflineAction,
}: Pick<ReturnType<typeof useOfflineActionGuard>, "guardOfflineAction">) {
  return guardOfflineAction({
    id: "forge-manual-invites-offline",
    description: "Reconnect before sending invites.",
  });
}

async function sendManualInvitesIfNeeded({
  groupId,
  manualInviteeIds,
  planName,
}: ManualInviteRequest) {
  await ForgeCommands.sendManualInvites({
    groupId,
    inviteeIds: manualInviteeIds,
    planName,
  });
}
