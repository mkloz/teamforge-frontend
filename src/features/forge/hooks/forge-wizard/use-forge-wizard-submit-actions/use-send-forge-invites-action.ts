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
    setIsSendingInvites(true);

    try {
      if (!state.groupId) {
        throw new Error("Cannot finish forge flow before a group is formed.");
      }

      if (state.forgeMode === "MANUAL") {
        await ForgeCommands.sendManualInvites({
          groupId: state.groupId,
          inviteeIds: state.manualInviteeIds,
          planName: state.planName,
        });
      }
      setField("invitesSent", true);
    } catch (error) {
      captureException("forge.sendInvites", error, {
        groupId: state.groupId ?? "missing",
      });
    } finally {
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
