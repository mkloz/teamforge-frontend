import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ReputationCorrectionApi } from "@/features/settings/api/reputation-correction.api";
import {
  type ReputationCorrectionFormValues,
  reputationCorrectionFormSchema,
} from "@/features/settings/schemas/reputation-correction.schema";
import {
  useCurrentUserQuery,
  useInvalidateCurrentUser,
} from "@/shared/api/current-user-query";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

export function useReputationCorrection() {
  const currentUser = useCurrentUserQuery();
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<ReputationCorrectionFormValues>({
    defaultValues: { reason: "" },
    resolver: zodResolver(reputationCorrectionFormSchema),
  });
  const mutation = useMutation({
    mutationKey: ["settings", "reputation-correction"],
    mutationFn: (values: ReputationCorrectionFormValues) =>
      ReputationCorrectionApi.create(values.reason, crypto.randomUUID()),
  });

  const hasOpenCorrection = Boolean(
    submitted || currentUser.data?.reputationSummary?.hasOpenCorrection,
  );

  return {
    form,
    hasOpenCorrection,
    isOnline,
    isSubmitting: mutation.isPending,
    submitError,
    onSubmit: form.handleSubmit(async (values) => {
      setSubmitError(null);
      if (
        guardOfflineAction({
          description: "Reconnect before requesting a reputation correction.",
          id: "reputation-correction-offline",
        })
      ) {
        setSubmitError(
          "You are offline. Reconnect before sending this request.",
        );
        return;
      }

      try {
        await mutation.mutateAsync(values);
        setSubmitted(true);
        form.reset();
        await invalidateCurrentUser();
      } catch {
        setSubmitError("We couldn’t send your correction request. Try again.");
      }
    }),
  };
}
