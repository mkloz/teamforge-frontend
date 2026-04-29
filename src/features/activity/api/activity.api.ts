import { apiClient } from "@/shared/api/api";
import {
  chatApiSchema,
  createPaginatedSchema,
  friendshipApiSchema,
  groupApiSchema,
  messageApiSchema,
  planProposalSchema,
} from "@/shared/schemas";
import { z } from "zod";

const DEFAULT_LIMIT = "100";
const DEFAULT_MESSAGE_LIMIT = "50";

const paginatedGroupsSchema = createPaginatedSchema(groupApiSchema);
const paginatedChatsSchema = createPaginatedSchema(chatApiSchema);
const paginatedFriendshipsSchema = createPaginatedSchema(friendshipApiSchema);
const paginatedMessagesSchema = createPaginatedSchema(messageApiSchema);
const planProposalsSchema = z.array(planProposalSchema);

export interface CreatePlanProposalDto {
  field: "TITLE" | "DESCRIPTION" | "DATE_TIME" | "LOCATION";
  proposedValue: string;
}

export interface VotePlanProposalDto {
  vote: "APPROVE" | "REJECT";
}

export class ActivityApi {
  static async getGroups() {
    const response = await apiClient
      .get("groups", {
        searchParams: {
          limit: DEFAULT_LIMIT,
        },
      })
      .json<unknown>();

    return paginatedGroupsSchema.parse(response).items;
  }

  static async getGroup(groupId: string) {
    const response = await apiClient.get(`groups/${groupId}`).json<unknown>();

    return groupApiSchema.parse(response);
  }

  static async getChats() {
    const response = await apiClient
      .get("chats", {
        searchParams: {
          limit: DEFAULT_LIMIT,
        },
      })
      .json<unknown>();

    return paginatedChatsSchema.parse(response).items;
  }

  static async getFriendships() {
    const response = await apiClient
      .get("friends", {
        searchParams: {
          limit: DEFAULT_LIMIT,
        },
      })
      .json<unknown>();

    return paginatedFriendshipsSchema.parse(response).items;
  }

  static async getChatMessages(chatId: string, limit = DEFAULT_MESSAGE_LIMIT) {
    const response = await apiClient
      .get(`chats/${chatId}/messages`, {
        searchParams: {
          limit,
        },
      })
      .json<unknown>();

    return paginatedMessagesSchema.parse(response).items;
  }

  static async sendMessage(
    chatId: string,
    content: string,
    replyToId?: string | null,
  ) {
    const response = await apiClient
      .post(`chats/${chatId}/messages`, {
        json: replyToId ? { content, replyToId } : { content },
      })
      .json<unknown>();

    return messageApiSchema.parse(response);
  }

  static async getPlanProposals(planId: string) {
    const response = await apiClient
      .get(`plans/${planId}/proposals`)
      .json<unknown>();

    return planProposalsSchema.parse(response);
  }

  static async createPlanProposal(
    planId: string,
    payload: CreatePlanProposalDto,
  ) {
    const response = await apiClient
      .post(`plans/${planId}/proposals`, {
        json: payload,
      })
      .json<unknown>();

    return planProposalSchema.parse(response);
  }

  static async votePlanProposal(
    proposalId: string,
    payload: VotePlanProposalDto,
  ) {
    const response = await apiClient
      .post(`proposals/${proposalId}/vote`, {
        json: payload,
      })
      .json<unknown>();

    return planProposalSchema.parse(response);
  }

  static async withdrawPlanProposal(proposalId: string) {
    const response = await apiClient
      .delete(`proposals/${proposalId}`)
      .json<unknown>();

    return planProposalSchema.parse(response);
  }
}
