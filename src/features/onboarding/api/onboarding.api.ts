import { z } from "zod";
import { apiClient } from "@/shared/api/api";
import { patchCurrentUser } from "@/shared/api/current-user-commands";
import { interestSchema } from "@/shared/schemas";
import type { Gender, PersonalityType } from "@/shared/schemas/enums";

const interestTreeResponseSchema = z
  .array(interestSchema)
  .min(1, "The interest catalog is empty.");
const setUserInterestsResponseSchema = z.object({
  interests: z.array(interestSchema),
});
const starterResultSchema = z.object({
  personalityType: z.enum([
    "INTJ",
    "INTP",
    "ENTJ",
    "ENTP",
    "INFJ",
    "INFP",
    "ENFJ",
    "ENFP",
    "ISTJ",
    "ISFJ",
    "ESTJ",
    "ESFJ",
    "ISTP",
    "ISFP",
    "ESTP",
    "ESFP",
  ]),
  starterSatisfied: z.literal(true),
});

export interface CompleteStarterDto {
  answers: Array<{ questionId: number; value: 1 | 2 | 3 | 4 | 5 }>;
  idempotencyKey: string;
  manifestHash: string;
  manifestVersion: string;
}

export interface UpdateOnboardingPersonalityDto {
  personalityType: PersonalityType;
  oceanO: number;
  oceanC: number;
  oceanE: number;
  oceanA: number;
  oceanN: number;
}

export interface UpdateProfileBasicsDto {
  dateOfBirth?: string;
  age?: number;
  gender: Gender;
  city: string;
  locationLat: number | null;
  locationLng: number | null;
}

export interface UpdateOnboardingIntentDto {
  onboardingIntent:
    | "BRING_A_PLAN"
    | "EXPLORE_AND_JOIN"
    | "BOTH_OR_UNSURE"
    | null;
}

export interface SetOnboardingInterestsDto {
  interestIds: string[];
}

export class OnboardingApi {
  static async completeStarter(payload: CompleteStarterDto) {
    const response = await apiClient
      .post("onboarding/starter", { json: payload })
      .json<unknown>();

    return starterResultSchema.parse(response);
  }

  static async getInterestTree() {
    const response = await apiClient.get("interests").json<unknown>();

    return interestTreeResponseSchema.parse(response);
  }

  static async updatePersonality(payload: UpdateOnboardingPersonalityDto) {
    const result = await patchCurrentUser(payload);

    return result.data;
  }

  static async updateProfileBasics(payload: UpdateProfileBasicsDto) {
    const result = await patchCurrentUser(payload);

    return result.data;
  }

  static async updateIntent(payload: UpdateOnboardingIntentDto) {
    const result = await patchCurrentUser(payload);

    return result.data;
  }

  static async setInterests(payload: SetOnboardingInterestsDto) {
    const response = await apiClient
      .post("users/me/interests", {
        json: payload,
      })
      .json<unknown>();

    return setUserInterestsResponseSchema.parse(response);
  }
}
