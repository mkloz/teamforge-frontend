import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { SettingsCommands } from "@/features/settings/api/settings-commands";
import {
  type AdultEligibilityFormValues,
  adultEligibilityFormSchema,
} from "@/features/settings/schemas/adult-eligibility.schema";
import { useInvalidateCurrentUser } from "@/shared/api/current-user-query";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import type { AdultEligibility } from "@/shared/schemas";

interface UseAdultEligibilityFormOptions {
  adultEligibility?: AdultEligibility;
}

export function useAdultEligibilityForm({
  adultEligibility,
}: UseAdultEligibilityFormOptions) {
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [recentEligibility, setRecentEligibility] =
    useState<AdultEligibility | null>(null);
  const form = useForm<AdultEligibilityFormValues>({
    resolver: zodResolver(adultEligibilityFormSchema),
    defaultValues: {
      dateOfBirth: "",
    },
  });
  const eligibilityMutation = useMutation({
    mutationKey: ["settings", "adult-eligibility"],
    meta: {
      errorToast: false,
    },
    mutationFn: (
      payload: Parameters<typeof SettingsCommands.updateAdultEligibility>[0],
    ) => SettingsCommands.updateAdultEligibility(payload),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    if (
      guardOfflineAction({
        id: "settings-adult-eligibility-offline",
        description: "Reconnect before checking your age eligibility.",
      })
    ) {
      setSubmitError(
        "You are offline. Reconnect before checking your age eligibility.",
      );
      return;
    }

    const payload = { dateOfBirth: values.dateOfBirth };

    try {
      const result = await eligibilityMutation.mutateAsync(payload);

      payload.dateOfBirth = "";
      form.reset({ dateOfBirth: "" });
      eligibilityMutation.reset();
      setRecentEligibility(result.data);
      void invalidateCurrentUser();
    } catch (error) {
      payload.dateOfBirth = "";
      eligibilityMutation.reset();
      setSubmitError(
        getApiErrorMessage(
          error,
          "We couldn't check your age eligibility. Please try again.",
        ),
      );
    }
  });

  return {
    eligibility: getLatestEligibility(adultEligibility, recentEligibility),
    form,
    isOnline,
    isSubmitting: eligibilityMutation.isPending,
    onSubmit,
    submitError,
  };
}

function getLatestEligibility(
  currentEligibility: AdultEligibility | undefined,
  recentEligibility: AdultEligibility | null,
) {
  if (
    recentEligibility &&
    (!currentEligibility ||
      recentEligibility.accessVersion > currentEligibility.accessVersion)
  ) {
    return recentEligibility;
  }

  return currentEligibility;
}
