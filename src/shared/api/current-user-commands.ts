import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import { fullUserResponseSchema } from "@/shared/schemas";

export async function patchCurrentUser(payload: unknown) {
  const response = await apiClient.patch("users/me", {
    json: payload,
  });

  return parseJsonWithRequestId(response, (value) =>
    fullUserResponseSchema.parse(value),
  );
}
