import { apiClient } from "@/shared/api/api";
import { fullUserResponseSchema } from "@/shared/schemas";

export interface UpdateSettingsProfileDto {
  name: string;
  bio: string | null;
  age: number | null;
  gender: import("@/shared/schemas").Gender | null;
  city: string | null;
}

export class SettingsApi {
  static async updateProfile(payload: UpdateSettingsProfileDto) {
    const response = await apiClient
      .patch("users/me", {
        json: payload,
      })
      .json<unknown>();

    return fullUserResponseSchema.parse(response);
  }

  static async uploadAvatar(file: File) {
    const body = new FormData();
    body.set("avatar", file);

    const response = await apiClient
      .patch("users/me/avatar", {
        body,
      })
      .json<unknown>();

    return fullUserResponseSchema.parse(response);
  }
}
