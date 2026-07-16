import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";

import { forgeProposalQueries } from "@/features/forge-proposals/api/forge-proposal-queries";
import {
  ForgeProposalSurface,
  type ForgeProposalSurfaceState,
} from "@/features/forge-proposals/components/forge-proposal-surface";
import type { ForgeProposal } from "@/features/forge-proposals/lib/forge-proposal-contract";
import { Button } from "@/shared/components/ui/button";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const FORGE_PROPOSAL_PAGE_METADATA = createTeamForgePageMetadata({
  title: "Group proposal",
  description:
    "Review the activity, plan details, and proposed TeamForge group.",
});

export function ForgeProposalPage() {
  usePageMetadata(FORGE_PROPOSAL_PAGE_METADATA);

  const { proposalId } = useParams({
    from: "/app-shell/forge/proposals/$proposalId",
  });
  const proposalQuery = useQuery(forgeProposalQueries.detail(proposalId));
  const terminalAction = (
    <Button asChild variant="outline">
      <Link to="/home">Back to home</Link>
    </Button>
  );

  return (
    <ForgeProposalSurface
      state={getProposalSurfaceState(proposalQuery)}
      terminalAction={terminalAction}
    />
  );
}

function getProposalSurfaceState(
  query: UseQueryResult<ForgeProposal>,
): ForgeProposalSurfaceState {
  if (query.isPending) {
    return { status: "loading" };
  }

  if (query.isError) {
    const status = getHttpErrorStatus(query.error);

    return status === 403 || status === 404
      ? { status: "unavailable" }
      : { status: "error", onRetry: () => void query.refetch() };
  }

  return { status: "ready", proposal: query.data };
}
