import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  createInvitePayloadSchema,
  createPaginatedSchema,
  inviteSchema,
} from "@/shared/schemas";

export async function getPendingSentInvites(groupId: string) {
  const response = await apiClient
    .get("invites/sent", {
      searchParams: {
        groupId,
        limit: 100,
        status: "PENDING",
      },
    })
    .json<unknown>();

  return createPaginatedSchema(inviteSchema).parse(response).items;
}

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

export async function cancelInvite(inviteId: string) {
  const response = await apiClient.delete(`invites/${inviteId}`);

  return parseJsonWithRequestId(response, (value) => inviteSchema.parse(value));
}
