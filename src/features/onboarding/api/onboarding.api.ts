import { z } from "zod";
import { apiClient } from "@/shared/api/api";
import { patchCurrentUser } from "@/shared/api/current-user-commands";
import { interestSchema } from "@/shared/schemas";
import type { Gender, PersonalityType } from "@/shared/schemas/enums";

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

export interface UpdateProfileBasicsDto {
  age: number;
  gender: Gender;
  city: string;
  locationLat: number | null;
  locationLng: number | null;
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
    const result = await patchCurrentUser(payload);

    return result.data;
  }

  static async updateProfileBasics(payload: UpdateProfileBasicsDto) {
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
