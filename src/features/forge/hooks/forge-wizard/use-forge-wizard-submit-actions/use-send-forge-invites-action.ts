import { useCallback, useState } from "react";

import { ForgeCommands } from "@/features/forge/api/forge-commands";
import { captureException } from "@/shared/lib/telemetry";

import type { UseForgeWizardSubmitActionsOptions } from "./types";

type UseSendForgeInvitesActionOptions = Pick<
  UseForgeWizardSubmitActionsOptions,
  "setField" | "state"
>;

export function useSendForgeInvitesAction({
  setField,
  state,
}: UseSendForgeInvitesActionOptions) {
  const [isSendingInvites, setIsSendingInvites] = useState(false);

  const handleSendInvites = useCallback(async () => {
    if (!state.groupId) {
      captureException(
        "forge.sendInvites",
        new Error("Cannot finish forge flow before a group is formed."),
        {
          groupId: "missing",
        },
      );
      return;
    }

    setIsSendingInvites(true);

    try {
      if (state.forgeMode === "MANUAL") {
        await ForgeCommands.sendManualInvites({
          groupId: state.groupId,
          inviteeIds: state.manualInviteeIds,
          planName: state.planName,
        });
      }
      setField("invitesSent", true);
      setIsSendingInvites(false);
    } catch (error) {
      captureException("forge.sendInvites", error, {
        groupId: state.groupId ?? "missing",
      });
      setIsSendingInvites(false);
    }
  }, [
    setField,
    state.forgeMode,
    state.groupId,
    state.manualInviteeIds,
    state.planName,
  ]);

  return {
    handleSendInvites,
    isSendingInvites,
  };
}
