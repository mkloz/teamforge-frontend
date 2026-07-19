import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AccountDataCommands } from "@/features/settings/api/account-data-commands";
import { SettingsCache } from "@/features/settings/api/settings-cache";
import { settingsQueries } from "@/features/settings/api/settings-queries";
import { ACCOUNT_DATA_COPY } from "@/features/settings/lib/account-data-copy";
import {
  type AdultEligibilityCorrectionFormValues,
  adultEligibilityCorrectionFormSchema,
} from "@/features/settings/schemas/account-data.schema";
import { useInvalidateCurrentUser } from "@/shared/api/current-user-query";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

interface UseAdultEligibilityCorrectionOptions {
  enabled: boolean;
  userId: string | undefined;
}

export function useAdultEligibilityCorrection({
  enabled,
  userId,
}: UseAdultEligibilityCorrectionOptions) {
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<AdultEligibilityCorrectionFormValues>({
    resolver: zodResolver(adultEligibilityCorrectionFormSchema),
    defaultValues: { dateOfBirth: "" },
  });
  const query = useQuery({
    ...settingsQueries.adultEligibilityCorrection(userId ?? "unknown"),
    enabled: enabled && Boolean(userId),
  });
  const requestMutation = useMutation({
    mutationFn: (values: AdultEligibilityCorrectionFormValues) =>
      AccountDataCommands.requestAdultEligibilityCorrection(
        { dateOfBirth: values.dateOfBirth },
        crypto.randomUUID(),
      ),
    meta: { errorToast: false },
  });
  const cancelMutation = useMutation({
    mutationFn: () =>
      AccountDataCommands.cancelAdultEligibilityCorrection(crypto.randomUUID()),
    meta: { errorToast: false },
  });

  const submitCorrection = form.handleSubmit(async (values) => {
    setError(null);

    if (
      guardOfflineAction({
        id: "settings-adult-eligibility-correction-offline",
        description: "Reconnect before requesting a correction.",
      })
    ) {
      setError("You are offline. Reconnect before requesting a correction.");
      return;
    }

    try {
      const result = await requestMutation.mutateAsync(values);

      if (userId) {
        SettingsCache.setAdultEligibilityCorrection(userId, result.data);
      }

      form.reset();
      void invalidateCurrentUser();
    } catch {
      setError(ACCOUNT_DATA_COPY.correction.requestError);
    }
  });

  async function cancelCorrection() {
    setError(null);

    if (
      guardOfflineAction({
        id: "settings-adult-eligibility-correction-cancel-offline",
        description: "Reconnect before cancelling your correction request.",
      })
    ) {
      setError(
        "You are offline. Reconnect before cancelling your correction request.",
      );
      return;
    }

    try {
      const result = await cancelMutation.mutateAsync();

      if (userId) {
        SettingsCache.setAdultEligibilityCorrection(userId, result.data);
      }

      void invalidateCurrentUser();
    } catch {
      setError(ACCOUNT_DATA_COPY.correction.cancelError);
    }
  }

  return {
    cancelCorrection,
    correction: query.data?.request ?? null,
    error:
      error ??
      (query.isError
        ? "We couldn't load your correction request. Please try again."
        : null),
    form,
    isCancelling: cancelMutation.isPending,
    hasLoadError: query.isError,
    isLoading: query.isLoading,
    isOnline,
    isRequesting: requestMutation.isPending,
    refetch: query.refetch,
    submitCorrection,
  };
}
