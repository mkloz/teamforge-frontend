import { queryOptions } from "@tanstack/react-query";

import { GroupProposalsApi } from "@/features/group-proposals/api/group-proposals.api";

export const GROUP_PROPOSAL_QUERY_KEYS = {
  all: ["group-proposals"] as const,
  current: ["group-proposals", "current"] as const,
  detail(proposalId: string) {
    return ["group-proposals", "detail", proposalId] as const;
  },
  reportTargets: ["group-proposals", "report-targets"] as const,
  reportTargetsByProposal(proposalId: string) {
    return ["group-proposals", "report-targets", proposalId] as const;
  },
};

export const groupProposalQueries = {
  current() {
    return queryOptions({
      queryKey: GROUP_PROPOSAL_QUERY_KEYS.current,
      queryFn: () => GroupProposalsApi.getCurrent(),
      staleTime: 15_000,
    });
  },

  detail(proposalId: string) {
    return queryOptions({
      queryKey: GROUP_PROPOSAL_QUERY_KEYS.detail(proposalId),
      queryFn: () => GroupProposalsApi.getById(proposalId),
      enabled: proposalId.length > 0,
      refetchInterval: (query) => (query.state.data?.recovery ? 15_000 : false),
      staleTime: 15_000,
    });
  },

  reportTargets(proposalId: string) {
    return queryOptions({
      queryKey: GROUP_PROPOSAL_QUERY_KEYS.reportTargetsByProposal(proposalId),
      queryFn: () => GroupProposalsApi.getReportTargets(proposalId),
      enabled: proposalId.length > 0,
      meta: { errorToast: false },
      retry: false,
      staleTime: 60_000,
    });
  },
};
