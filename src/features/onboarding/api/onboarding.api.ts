import { apiClient } from "@/shared/api/api";
import { fullUserResponseSchema, interestSchema } from "@/shared/schemas";
import type { PersonalityType } from "@/shared/schemas/enums";
import { z } from "zod";

const interestTreeResponseSchema = z.array(interestSchema);
const setUserInterestsResponseSchema = z.object({
  interests: z.array(interestSchema),
});

export interface UpdateOnboardingPersonalityDto {
  personalityType: PersonalityType;
  oceanO: number;
  oceanC: number;
  oceanE: number;
  oceanA: number;
  oceanN: number;
}

export interface SetOnboardingInterestsDto {
  interestIds: string[];
}

export class OnboardingApi {
  static async getInterestTree() {
    const response = await apiClient.get("interests").json<unknown>();

    return interestTreeResponseSchema.parse(response);
  }

  static async updatePersonality(payload: UpdateOnboardingPersonalityDto) {
    const response = await apiClient
      .patch("users/me", {
        json: payload,
      })
      .json<unknown>();

    return fullUserResponseSchema.parse(response);
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
