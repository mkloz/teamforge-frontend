import { queryOptions } from "@tanstack/react-query";

import {
  OnboardingApi,
  type SetOnboardingInterestsDto,
  type UpdateProfileBasicsDto,
  type UpdateOnboardingPersonalityDto,
} from "./onboarding.api";

export class OnboardingQueries {
  static interestTree() {
    return queryOptions({
      queryKey: ["interests", "tree"],
      queryFn: () => OnboardingApi.getInterestTree(),
      staleTime: 5 * 60_000,
    });
  }

  static updatePersonality(payload: UpdateOnboardingPersonalityDto) {
    return OnboardingApi.updatePersonality(payload);
  }

  static updateProfileBasics(payload: UpdateProfileBasicsDto) {
    return OnboardingApi.updateProfileBasics(payload);
  }

  static setInterests(payload: SetOnboardingInterestsDto) {
    return OnboardingApi.setInterests(payload);
  }
}
