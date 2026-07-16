import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { OnboardingCache } from "@/features/onboarding/api/onboarding-cache";
import { OnboardingCommands } from "@/features/onboarding/api/onboarding-commands";
import {
  toOptionalOnboardingSearch,
  useOnboardingFlowState,
} from "@/features/onboarding/lib/onboarding-flow-state";
import {
  buildProfileBasicsFlowSearch,
  getProfileBasicsNextRoute,
  getProfileBasicsProgress,
  getProfileBasicsValuesFromUser,
  PROFILE_BASICS_DEFAULT_VALUES,
  toProfileBasicsDto,
} from "@/features/onboarding/lib/profile-basics-form-model";
import {
  type ProfileBasicsValues,
  profileBasicsSchema,
} from "@/features/onboarding/schemas/profile-basics.schema";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { getPostAuthRedirectPath } from "@/shared/lib/post-auth-route";

function areProfileBasicsValuesEqual(
  currentValues: ProfileBasicsValues,
  nextValues: ProfileBasicsValues,
) {
  return (
    currentValues.age === nextValues.age &&
    currentValues.gender === nextValues.gender &&
    currentValues.city === nextValues.city &&
    currentValues.locationLat === nextValues.locationLat &&
    currentValues.locationLng === nextValues.locationLng
  );
}

export function useProfileBasicsForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const flowState = useOnboardingFlowState();
  const { data: currentUser } = useCurrentUserQuery();
  const [saveError, setSaveError] = useState<string | null>(null);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();

  const form = useForm<ProfileBasicsValues>({
    resolver: zodResolver(profileBasicsSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: PROFILE_BASICS_DEFAULT_VALUES,
  });
  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const nextValues = getProfileBasicsValuesFromUser(currentUser);
    if (!areProfileBasicsValuesEqual(form.getValues(), nextValues)) {
      form.reset(nextValues);
    }
  }, [currentUser, form]);

  const profileBasicsMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't save those details. Please try again.",
    },
    mutationFn: (
      payload: Parameters<typeof OnboardingCommands.updateProfileBasics>[0],
    ) => OnboardingCommands.updateProfileBasics(payload),
    onSuccess: (updatedUser) => {
      OnboardingCache.setCurrentUser(queryClient, updatedUser);
    },
  });

  const progress = getProfileBasicsProgress(watchedValues);

  const onSubmit = form.handleSubmit(async (values) => {
    setSaveError(null);
    const payload = toProfileBasicsDto(values);

    if (!payload) {
      return;
    }

    if (
      guardOfflineAction({
        id: "onboarding-profile-basics-offline",
        description: "Reconnect before saving profile details.",
      })
    ) {
      setSaveError("You are offline. Reconnect before saving your details.");
      return;
    }

    try {
      const updatedUser = await profileBasicsMutation.mutateAsync(payload);
      form.resetField("dateOfBirth", { defaultValue: "" });
      const nextDestination = getPostAuthRedirectPath(updatedUser);
      const nextSearch = buildProfileBasicsFlowSearch(flowState);

      await navigate({
        to: getProfileBasicsNextRoute(nextDestination),
        search: toOptionalOnboardingSearch(nextSearch),
      });
    } catch (error) {
      setSaveError(
        getApiErrorMessage(
          error,
          "We couldn't save those details. Please try again.",
        ),
      );
    } finally {
      payload.dateOfBirth = "";
      profileBasicsMutation.reset();
    }
  });

  return {
    form,
    watchedValues,
    progress,
    saveError,
    isOnline,
    isSaving: profileBasicsMutation.isPending,
    onSubmit,
  };
}
