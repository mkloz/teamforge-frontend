import { apiClient } from "@/shared/api/api";
import { publicUserResponseSchema } from "@/shared/schemas";

export async function getPublicUserById(userId: string) {
  const response = await apiClient.get(`users/${userId}`).json<unknown>();

  return publicUserResponseSchema.parse(response);
}
