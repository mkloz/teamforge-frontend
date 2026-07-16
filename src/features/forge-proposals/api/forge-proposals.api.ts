import type {
  ForgeProposalDecisionCommand,
  ForgeProposalDeclineCommand,
} from "@/features/forge-proposals/schemas/forge-proposal.schema";
import {
  currentForgeProposalResponseSchema,
  forgeProposalDecisionCommandSchema,
  forgeProposalDecisionReceiptSchema,
  forgeProposalDeclineCommandSchema,
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

  static accept(
    proposalId: string,
    payload: ForgeProposalDecisionCommand,
    idempotencyKey: string,
  ) {
    return ForgeProposalsApi.runDecision(
      proposalId,
      "accept",
      forgeProposalDecisionCommandSchema.parse(payload),
      idempotencyKey,
    );
  }

  static decline(
    proposalId: string,
    payload: ForgeProposalDeclineCommand,
    idempotencyKey: string,
  ) {
    return ForgeProposalsApi.runDecision(
      proposalId,
      "decline",
      forgeProposalDeclineCommandSchema.parse(payload),
      idempotencyKey,
    );
  }

  static withdraw(
    proposalId: string,
    payload: ForgeProposalDecisionCommand,
    idempotencyKey: string,
  ) {
    return ForgeProposalsApi.runDecision(
      proposalId,
      "withdraw",
      forgeProposalDecisionCommandSchema.parse(payload),
      idempotencyKey,
    );
  }

  private static async runDecision(
    proposalId: string,
    action: "accept" | "decline" | "withdraw",
    payload: ForgeProposalDecisionCommand | ForgeProposalDeclineCommand,
    idempotencyKey: string,
  ) {
    const response = await apiClient
      .post(`forge-proposals/${proposalId}/${action}`, {
        headers: { "Idempotency-Key": idempotencyKey },
        json: payload,
      })
      .json<unknown>();

    return forgeProposalDecisionReceiptSchema.parse(response);
  }
}
