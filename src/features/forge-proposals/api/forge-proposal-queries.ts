import { queryOptions } from "@tanstack/react-query";

import { ForgeProposalsApi } from "@/features/forge-proposals/api/forge-proposals.api";

export const FORGE_PROPOSAL_QUERY_KEYS = {
  all: ["forge-proposals"] as const,
  current: ["forge-proposals", "current"] as const,
  detail(proposalId: string) {
    return ["forge-proposals", "detail", proposalId] as const;
  },
  reportTargets: ["forge-proposals", "report-targets"] as const,
  reportTargetsByProposal(proposalId: string) {
    return ["forge-proposals", "report-targets", proposalId] as const;
  },
};

export const forgeProposalQueries = {
  current() {
    return queryOptions({
      queryKey: FORGE_PROPOSAL_QUERY_KEYS.current,
      queryFn: () => ForgeProposalsApi.getCurrent(),
      staleTime: 15_000,
    });
  },

  detail(proposalId: string) {
    return queryOptions({
      queryKey: FORGE_PROPOSAL_QUERY_KEYS.detail(proposalId),
      queryFn: () => ForgeProposalsApi.getById(proposalId),
      enabled: proposalId.length > 0,
      refetchInterval: (query) => (query.state.data?.recovery ? 15_000 : false),
      staleTime: 15_000,
    });
  },

  reportTargets(proposalId: string) {
    return queryOptions({
      queryKey: FORGE_PROPOSAL_QUERY_KEYS.reportTargetsByProposal(proposalId),
      queryFn: () => ForgeProposalsApi.getReportTargets(proposalId),
      enabled: proposalId.length > 0,
      meta: { errorToast: false },
      retry: false,
      staleTime: 60_000,
    });
  },
};
