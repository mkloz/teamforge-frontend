import { useQuery } from "@tanstack/react-query";

import { groupProposalQueries } from "@/features/group-proposals/api/group-proposal-queries";

export type CompatibilityInputLockStatus =
  | "available"
  | "blocked"
  | "checking"
  | "error";

interface UseCompatibilityInputLockOptions {
  enabled?: boolean;
}

const LIVE_PROPOSAL_LOCK_MESSAGE =
  "You can change this after the current group proposal closes or after you leave it.";
const CHECKING_PROPOSAL_MESSAGE =
  "Checking whether you have a current group proposal…";
const PROPOSAL_CHECK_ERROR_MESSAGE =
  "We couldn’t check your current group proposal. Try again before changing this.";

export function useCompatibilityInputLock({
  enabled = true,
}: UseCompatibilityInputLockOptions = {}) {
  const currentProposalQuery = useQuery({
    ...groupProposalQueries.current(),
    enabled,
  });

  if (!enabled) {
    return buildCompatibilityInputLockState("available", null, () =>
      currentProposalQuery.refetch(),
    );
  }

  if (currentProposalQuery.isPending) {
    return buildCompatibilityInputLockState(
      "checking",
      CHECKING_PROPOSAL_MESSAGE,
      () => currentProposalQuery.refetch(),
    );
  }

  if (currentProposalQuery.isError) {
    return buildCompatibilityInputLockState(
      "error",
      PROPOSAL_CHECK_ERROR_MESSAGE,
      () => currentProposalQuery.refetch(),
    );
  }

  const proposal = currentProposalQuery.data.proposal;
  const hasLiveSeat =
    proposal?.viewer.disposition === "ACTIVE" &&
    (proposal.viewer.decision === "PENDING" ||
      proposal.viewer.decision === "ACCEPTED");

  if (hasLiveSeat) {
    return buildCompatibilityInputLockState(
      "blocked",
      LIVE_PROPOSAL_LOCK_MESSAGE,
      () => currentProposalQuery.refetch(),
    );
  }

  if (currentProposalQuery.isFetching) {
    return buildCompatibilityInputLockState(
      "checking",
      CHECKING_PROPOSAL_MESSAGE,
      () => currentProposalQuery.refetch(),
    );
  }

  return buildCompatibilityInputLockState("available", null, () =>
    currentProposalQuery.refetch(),
  );
}

function buildCompatibilityInputLockState(
  status: CompatibilityInputLockStatus,
  message: string | null,
  retry: () => unknown,
) {
  return {
    isBlocked: status !== "available",
    message,
    retry,
    status,
  };
}
