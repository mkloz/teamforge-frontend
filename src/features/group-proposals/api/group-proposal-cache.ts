import type { QueryClient } from "@tanstack/react-query";

import { GROUP_PROPOSAL_QUERY_KEYS } from "@/features/group-proposals/api/group-proposal-queries";
import type { CurrentGroupProposalResponse } from "@/features/group-proposals/lib/group-proposal-contract";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export async function clearGroupProposalSensitiveCaches(
  queryClient: QueryClient,
  proposalId?: string,
) {
  const detailQueryKey = proposalId
    ? GROUP_PROPOSAL_QUERY_KEYS.detail(proposalId)
    : ([...GROUP_PROPOSAL_QUERY_KEYS.all, "detail"] as const);
  const reportTargetsQueryKey = proposalId
    ? GROUP_PROPOSAL_QUERY_KEYS.reportTargetsByProposal(proposalId)
    : GROUP_PROPOSAL_QUERY_KEYS.reportTargets;
  await Promise.all([
    queryClient.cancelQueries({
      ...(proposalId ? { exact: true } : {}),
      queryKey: detailQueryKey,
    }),
    queryClient.cancelQueries({
      exact: true,
      queryKey: GROUP_PROPOSAL_QUERY_KEYS.current,
    }),
    queryClient.cancelQueries({
      queryKey: APP_QUERY_KEYS.groupFormation.proposalOpenings,
    }),
    queryClient.cancelQueries({
      ...(proposalId ? { exact: true } : {}),
      queryKey: reportTargetsQueryKey,
    }),
  ]);

  const detailReset = queryClient.resetQueries({
    ...(proposalId ? { exact: true } : {}),
    queryKey: detailQueryKey,
  });
  const reportTargetsReset = queryClient.resetQueries({
    ...(proposalId ? { exact: true } : {}),
    queryKey: reportTargetsQueryKey,
  });
  queryClient.removeQueries({
    queryKey: APP_QUERY_KEYS.groupFormation.proposalOpenings,
  });
  queryClient.setQueryData<CurrentGroupProposalResponse>(
    GROUP_PROPOSAL_QUERY_KEYS.current,
    (current) =>
      !proposalId || current?.proposal?.id === proposalId
        ? { proposal: null }
        : current,
  );

  await Promise.all([detailReset, reportTargetsReset]);
}
