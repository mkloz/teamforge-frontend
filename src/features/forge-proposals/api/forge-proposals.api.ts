import {
  currentForgeProposalResponseSchema,
  forgeProposalSchema,
} from "@/features/forge-proposals/schemas/forge-proposal.schema";
import { apiClient } from "@/shared/api/api";

export class ForgeProposalsApi {
  static async getCurrent() {
    const response = await apiClient
      .get("forge-proposals/current")
      .json<unknown>();

    return currentForgeProposalResponseSchema.parse(response);
  }

  static async getById(proposalId: string) {
    const response = await apiClient
      .get(`forge-proposals/${proposalId}`)
      .json<unknown>();

    return forgeProposalSchema.parse(response);
  }
}
