import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import { createInvitePayloadSchema, inviteSchema } from "@/shared/schemas";

export async function createInvite(payload: unknown) {
  const response = await apiClient.post("invites", {
    json: createInvitePayloadSchema.parse(payload),
  });

  return parseJsonWithRequestId(response, (value) => inviteSchema.parse(value));
}

export async function acceptInvite(inviteId: string) {
  const response = await apiClient.post(`invites/${inviteId}/accept`);

  return parseJsonWithRequestId(response, (value) => inviteSchema.parse(value));
}

export async function declineInvite(inviteId: string) {
  const response = await apiClient.post(`invites/${inviteId}/decline`);

  return parseJsonWithRequestId(response, (value) => inviteSchema.parse(value));
}
