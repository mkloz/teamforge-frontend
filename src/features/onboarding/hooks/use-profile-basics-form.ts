import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { OnboardingCache } from "@/features/onboarding/api/onboarding-cache";
import { OnboardingCommands } from "@/features/onboarding/api/onboarding-commands";
import {
  buildProfileBasicsFlowSearch,
  getProfileBasicsNextRoute,
  getProfileBasicsProgress,
  getProfileBasicsValuesFromUser,
  PROFILE_BASICS_DEFAULT_VALUES,
  toProfileBasicsDto,
} from "@/features/onboarding/lib/profile-basics-form-model";
import { useOnboardingFlowState } from "@/features/onboarding/lib/onboarding-flow-state";
import {
  profileBasicsSchema,
  type ProfileBasicsValues,
} from "@/features/onboarding/schemas/profile-basics.schema";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { getPostAuthRedirectPath } from "@/shared/lib/post-auth-route";

export function useProfileBasicsForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const flowState = useOnboardingFlowState();
  const { data: currentUser } = useCurrentUserQuery();
  const [saveError, setSaveError] = useState<string | null>(null);

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

    form.reset(getProfileBasicsValuesFromUser(currentUser));
  }, [currentUser, form]);

  const profileBasicsMutation = useMutation({
    mutationFn: OnboardingCommands.updateProfileBasics,
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

    try {
      const updatedUser = await profileBasicsMutation.mutateAsync(payload);
      const nextDestination = getPostAuthRedirectPath(updatedUser);
      const nextSearch = buildProfileBasicsFlowSearch(flowState);

      await navigate({
        to: getProfileBasicsNextRoute(nextDestination),
        search: Object.keys(nextSearch).length > 0 ? nextSearch : undefined,
      });
    } catch (error) {
      setSaveError(
        getApiErrorMessage(
          error,
          "We couldn't save those details. Please try again.",
        ),
      );
    }
  });

  return {
    form,
    watchedValues,
    progress,
    saveError,
    isSaving: profileBasicsMutation.isPending,
    onSubmit,
  };
}
