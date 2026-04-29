import { apiClient } from "@/shared/api/api";
import { publicUserResponseSchema } from "@/shared/schemas";

export class ProfileApi {
  static async getUserProfile(userId: string) {
    const response = await apiClient.get(`users/${userId}`).json<unknown>();

    return publicUserResponseSchema.parse(response);
  }
}
