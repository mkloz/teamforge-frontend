import { queryOptions } from "@tanstack/react-query";

import { ForgeProposalsApi } from "@/features/forge-proposals/api/forge-proposals.api";

export const FORGE_PROPOSAL_QUERY_KEYS = {
  all: ["forge-proposals"] as const,
  current: ["forge-proposals", "current"] as const,
  detail(proposalId: string) {
    return ["forge-proposals", "detail", proposalId] as const;
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
      staleTime: 15_000,
    });
  },
};
