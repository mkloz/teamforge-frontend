import {
  type CompleteStarterDto,
  OnboardingApi,
  type SetOnboardingInterestsDto,
  type UpdateOnboardingIntentDto,
  type UpdateOnboardingPersonalityDto,
  type UpdateProfileBasicsDto,
} from "@/features/onboarding/api/onboarding.api";

export class OnboardingCommands {
  static completeStarter(payload: CompleteStarterDto) {
    return OnboardingApi.completeStarter(payload);
  }

  static updatePersonality(payload: UpdateOnboardingPersonalityDto) {
    return OnboardingApi.updatePersonality(payload);
  }

  static updateProfileBasics(payload: UpdateProfileBasicsDto) {
    return OnboardingApi.updateProfileBasics(payload);
  }

  static updateIntent(payload: UpdateOnboardingIntentDto) {
    return OnboardingApi.updateIntent(payload);
  }

  static setInterests(payload: SetOnboardingInterestsDto) {
    return OnboardingApi.setInterests(payload);
  }
}
