import { useState } from "react";

import { ForgeCommands } from "@/features/forge/api/forge-commands";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { captureException } from "@/shared/lib/telemetry";

import type { UseForgeWizardSubmitActionsOptions } from "./types";

type UseSaveForgeIdentityActionOptions = Pick<
  UseForgeWizardSubmitActionsOptions,
  "goNext" | "state"
>;

export function useSaveForgeIdentityAction({
  goNext,
  state,
}: UseSaveForgeIdentityActionOptions) {
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const { guardOfflineAction } = useOfflineActionGuard();

  async function handleSaveIdentityAndContinue() {
    if (
      guardOfflineAction({
        id: "forge-identity-save-offline",
        description: "Reconnect before saving group identity.",
      })
    ) {
      return;
    }

    setIsSavingIdentity(true);

    try {
      await ForgeCommands.saveForgedIdentity({
        groupId: state.groupId,
        planId: state.planId,
        groupName: state.groupName,
        groupDescription: state.groupDescription,
        avatarImage: state.avatarImage,
        coverImage: state.coverImage,
      });
      goNext();
      setIsSavingIdentity(false);
    } catch (error) {
      captureException("forge.saveIdentity", error, {
        groupId: state.groupId ?? "missing",
      });
      goNext();
      setIsSavingIdentity(false);
    }
  }

  return {
    handleSaveIdentityAndContinue,
    isSavingIdentity,
  };
}
