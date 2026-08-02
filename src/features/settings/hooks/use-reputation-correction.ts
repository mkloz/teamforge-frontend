import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<ReputationCorrectionFormValues>({
    defaultValues: { inputId: "", reason: "" },
    resolver: zodResolver(reputationCorrectionFormSchema),
  });
  const mutation = useMutation({
    mutationKey: ["settings", "reputation-correction"],
    mutationFn: (values: ReputationCorrectionFormValues) =>
      ReputationCorrectionApi.create(
        values.inputId,
        values.reason,
        crypto.randomUUID(),
      ),
  });
  const evidenceQuery = useQuery({
    queryKey: ["settings", "reputation-evidence"],
    queryFn: () => ReputationCorrectionApi.listEvidence(),
  });
  const disputesQuery = useQuery({
    queryKey: ["settings", "reputation-disputes"],
    queryFn: () => ReputationCorrectionApi.listDisputes(),
  });

  const hasOpenCorrection = Boolean(
    submitted || currentUser.data?.reputationSummary?.hasOpenCorrection,
  );

  return {
    form,
    evidence: evidenceQuery.data ?? [],
    isLoadingEvidence: evidenceQuery.isPending,
    latestResolvedDispute: disputesQuery.data?.find(
      (dispute) =>
        dispute.status === "ACCEPTED" || dispute.status === "REJECTED",
    ),
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
        await Promise.all([
          invalidateCurrentUser(),
          queryClient.invalidateQueries({
            queryKey: ["settings", "reputation-evidence"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["settings", "reputation-disputes"],
          }),
        ]);
      } catch {
        setSubmitError("We couldn’t send your correction request. Try again.");
      }
    }),
  };
}
