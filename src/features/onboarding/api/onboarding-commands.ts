import {
  OnboardingApi,
  type SetOnboardingInterestsDto,
  type UpdateOnboardingPersonalityDto,
  type UpdateProfileBasicsDto,
} from "@/features/onboarding/api/onboarding.api";

export class OnboardingCommands {
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
