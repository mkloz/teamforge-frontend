import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { UpdateOnboardingIntentDto } from "@/features/onboarding/api/onboarding.api";
import { OnboardingCache } from "@/features/onboarding/api/onboarding-cache";
import { OnboardingCommands } from "@/features/onboarding/api/onboarding-commands";
import {
  buildOnboardingReturnSearch,
  toOptionalOnboardingSearch,
  useOnboardingFlowState,
} from "@/features/onboarding/lib/onboarding-flow-state";
import {
  type OnboardingIntentValues,
  onboardingIntentSchema,
} from "@/features/onboarding/schemas/onboarding-intent.schema";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { ensureOnboardingProductState } from "@/shared/api/onboarding-product-state-query";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { getProductStateRedirectPath } from "@/shared/lib/post-auth-route";

const DEFAULT_VALUES: OnboardingIntentValues = { onboardingIntent: null };

export function useOnboardingIntentForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const flowState = useOnboardingFlowState();
  const { data: currentUser } = useCurrentUserQuery();
  const [saveError, setSaveError] = useState<string | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const form = useForm<OnboardingIntentValues>({
    resolver: zodResolver(onboardingIntentSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!currentUser || form.formState.isDirty) return;
    form.reset({ onboardingIntent: currentUser.onboardingIntent ?? null });
  }, [currentUser, form]);

  const mutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't save that choice. Please try again.",
    },
    mutationFn: (payload: UpdateOnboardingIntentDto) =>
      OnboardingCommands.updateIntent(payload),
  });

  async function save(
    onboardingIntent: OnboardingIntentValues["onboardingIntent"],
  ) {
    setSaveError(null);
    if (
      guardOfflineAction({
        id: "onboarding-intent-offline",
        description: "Reconnect before saving your onboarding choice.",
      })
    ) {
      setSaveError("You are offline. Reconnect before continuing.");
      return;
    }

    try {
      const updatedUser = await mutation.mutateAsync({ onboardingIntent });
      OnboardingCache.setCurrentUser(queryClient, updatedUser);
      await OnboardingCache.invalidateProductState(queryClient);
      const productState = await ensureOnboardingProductState();
      const destination = getProductStateRedirectPath(productState);
      const nextDestination =
        destination === "/onboarding/intent"
          ? "/onboarding/personality"
          : destination;
      const nextSearch = buildOnboardingReturnSearch(flowState);

      await navigate({
        to: nextDestination,
        search: toOptionalOnboardingSearch(nextSearch),
      });
    } catch (error) {
      setSaveError(
        getApiErrorMessage(
          error,
          "We couldn't save that choice. Please try again.",
        ),
      );
    } finally {
      mutation.reset();
    }
  }

  const onSubmit = form.handleSubmit(({ onboardingIntent }) =>
    save(onboardingIntent),
  );

  const onBack = () => {
    const previousSearch = buildOnboardingReturnSearch(flowState);

    return navigate({
      to: "/onboarding/profile",
      search: toOptionalOnboardingSearch(previousSearch),
    });
  };

  return {
    form,
    isOnline,
    isSaving: mutation.isPending,
    onBack,
    onSkip: () => save(null),
    onSubmit,
    saveError,
  };
}
