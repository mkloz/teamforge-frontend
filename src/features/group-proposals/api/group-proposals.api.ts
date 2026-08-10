import type {
  GroupProposalDecisionCommand,
  GroupProposalDeclineCommand,
  GroupProposalRecoveryCommand,
} from "@/features/group-proposals/schemas/group-proposal.schema";
import {
  currentGroupProposalResponseSchema,
  groupProposalDecisionCommandSchema,
  groupProposalDecisionReceiptSchema,
  groupProposalDeclineCommandSchema,
  groupProposalRecoveryCommandSchema,
  groupProposalSchema,
} from "@/features/group-proposals/schemas/group-proposal.schema";
import { groupProposalReportTargetsSchema } from "@/features/group-proposals/schemas/group-proposal-report-targets.schema";
import { apiClient } from "@/shared/api/api";
import { formationOpeningOrganizerReceiptSchema } from "@/shared/api/formation-opening-api";

export class GroupProposalsApi {
  static async getCurrent() {
    const response = await apiClient
      .get("group-proposals/current")
      .json<unknown>();

    return currentGroupProposalResponseSchema.parse(response);
  }

  static async getById(proposalId: string) {
    const response = await apiClient
      .get(`group-proposals/${proposalId}`)
      .json<unknown>();

    return groupProposalSchema.parse(response);
  }

  static async getReportTargets(proposalId: string) {
    const response = await apiClient
      .get(`group-proposals/${proposalId}/report-targets`)
      .json<unknown>();
    const reportTargets = groupProposalReportTargetsSchema.parse(response);

    if (reportTargets.proposalId !== proposalId) {
      throw new Error(
        "Proposal report targets returned for the wrong proposal.",
      );
    }

    return reportTargets;
  }

  static accept(
    proposalId: string,
    payload: GroupProposalDecisionCommand,
    idempotencyKey: string,
  ) {
    return GroupProposalsApi.runDecision(
      proposalId,
      "accept",
      groupProposalDecisionCommandSchema.parse(payload),
      idempotencyKey,
    );
  }

  static decline(
    proposalId: string,
    payload: GroupProposalDeclineCommand,
    idempotencyKey: string,
  ) {
    return GroupProposalsApi.runDecision(
      proposalId,
      "decline",
      groupProposalDeclineCommandSchema.parse(payload),
      idempotencyKey,
    );
  }

  static withdraw(
    proposalId: string,
    payload: GroupProposalDecisionCommand,
    idempotencyKey: string,
  ) {
    return GroupProposalsApi.runDecision(
      proposalId,
      "withdraw",
      groupProposalDecisionCommandSchema.parse(payload),
      idempotencyKey,
    );
  }

  static async openRecoverySeat(
    proposalId: string,
    payload: GroupProposalRecoveryCommand,
    idempotencyKey: string,
  ) {
    const response = await apiClient
      .post(`group-proposals/${proposalId}/open-recovery-seat`, {
        headers: { "Idempotency-Key": idempotencyKey },
        json: groupProposalRecoveryCommandSchema.parse(payload),
      })
      .json<unknown>();

    return formationOpeningOrganizerReceiptSchema.parse(response);
  }

  private static async runDecision(
    proposalId: string,
    action: "accept" | "decline" | "withdraw",
    payload: GroupProposalDecisionCommand | GroupProposalDeclineCommand,
    idempotencyKey: string,
  ) {
    const response = await apiClient
      .post(`group-proposals/${proposalId}/${action}`, {
        headers: { "Idempotency-Key": idempotencyKey },
        json: payload,
      })
      .json<unknown>();

    return groupProposalDecisionReceiptSchema.parse(response);
  }
}
