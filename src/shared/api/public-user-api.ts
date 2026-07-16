import { apiClient } from "@/shared/api/api";
import { viewerProfileSchema } from "@/shared/schemas/viewer-profile";

export async function getViewerProfileById(userId: string) {
  const response = await apiClient.get(`users/${userId}`).json<unknown>();

  return viewerProfileSchema.parse(response);
}
