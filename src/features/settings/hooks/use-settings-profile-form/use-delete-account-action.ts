import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SettingsCommands } from "@/features/settings/api/settings-commands";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";

export function useDeleteAccountAction() {
  const navigate = useNavigate();
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(
    null,
  );

  const deleteAccountMutation = useMutation({
    meta: {
      telemetryName: trackedMutationNames.settingsDeleteAccount,
    },
    mutationFn: SettingsCommands.deleteAccount,
    onSuccess: async (result) => {
      trackMutationOutcome(
        trackedMutationNames.settingsDeleteAccount,
        "success",
        {
          requestId: result.requestId,
        },
      );
      SettingsCommands.clearAuthState();
      await navigate({ to: "/auth/login" });
    },
    onError: (error) => {
      setDeleteAccountError(
        getApiErrorMessage(
          error,
          "We couldn't delete your account right now. Please try again.",
        ),
      );
      trackMutationOutcome(trackedMutationNames.settingsDeleteAccount, "error");
    },
  });

  return {
    deleteAccount: async () => {
      setDeleteAccountError(null);
      await deleteAccountMutation.mutateAsync();
    },
    isDeletingAccount: deleteAccountMutation.isPending,
    deleteAccountError,
  };
}
