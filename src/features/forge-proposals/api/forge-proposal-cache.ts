import type { QueryClient } from "@tanstack/react-query";

import { FORGE_PROPOSAL_QUERY_KEYS } from "@/features/forge-proposals/api/forge-proposal-queries";
import type { CurrentForgeProposalResponse } from "@/features/forge-proposals/lib/forge-proposal-contract";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export async function clearForgeProposalSensitiveCaches(
  queryClient: QueryClient,
  proposalId?: string,
) {
  const detailQueryKey = proposalId
    ? FORGE_PROPOSAL_QUERY_KEYS.detail(proposalId)
    : ([...FORGE_PROPOSAL_QUERY_KEYS.all, "detail"] as const);
  const reportTargetsQueryKey = proposalId
    ? FORGE_PROPOSAL_QUERY_KEYS.reportTargetsByProposal(proposalId)
    : FORGE_PROPOSAL_QUERY_KEYS.reportTargets;
  await Promise.all([
    queryClient.cancelQueries({
      ...(proposalId ? { exact: true } : {}),
      queryKey: detailQueryKey,
    }),
    queryClient.cancelQueries({
      exact: true,
      queryKey: FORGE_PROPOSAL_QUERY_KEYS.current,
    }),
    queryClient.cancelQueries({
      queryKey: APP_QUERY_KEYS.forge.proposalOpenings,
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
    queryKey: APP_QUERY_KEYS.forge.proposalOpenings,
  });
  queryClient.setQueryData<CurrentForgeProposalResponse>(
    FORGE_PROPOSAL_QUERY_KEYS.current,
    (current) =>
      !proposalId || current?.proposal?.id === proposalId
        ? { proposal: null }
        : current,
  );

  await Promise.all([detailReset, reportTargetsReset]);
}
