import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, Flag } from "lucide-react";
import { useState } from "react";

import { clearForgeProposalSensitiveCaches } from "@/features/forge-proposals/api/forge-proposal-cache";
import type { ForgeProposalSeat } from "@/features/forge-proposals/lib/forge-proposal-contract";
import { ReportDialog } from "@/features/reporting/public/reporting";
import { blockUser } from "@/shared/api/friendship-membership-api";
import {
  invalidateFormationOpeningApplicationSurfaces,
  refreshAccessSensitiveSurfaces,
} from "@/shared/api/query-invalidation";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

const BLOCK_ERROR_MESSAGE = "We couldn't change that block setting right now.";
const BLOCK_OFFLINE_MESSAGE = "Reconnect before blocking someone.";

interface ProposalSeatSafetyActionsProps {
  proposalId: string;
  seat: ForgeProposalSeat;
}

export function ProposalSeatSafetyActions({
  proposalId,
  seat,
}: ProposalSeatSafetyActionsProps) {
  const queryClient = useQueryClient();
  const { guardOfflineAction } = useOfflineActionGuard();
  const [blockError, setBlockError] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const blockMutation = useMutation({
    mutationKey: ["forge-proposals", proposalId, "block-seat", seat.seatId],
    mutationFn: () => blockUser(seat.userId),
    meta: { errorToast: false },
    onSuccess: async () => {
      setBlockError(null);
      setIsBlocked(true);
      await clearForgeProposalSensitiveCaches(queryClient);
      await Promise.allSettled([
        invalidateFormationOpeningApplicationSurfaces(),
        refreshAccessSensitiveSurfaces(),
        queryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.forge.currentAutoRequest,
        }),
      ]);
    },
    onError: () => {
      setBlockError(BLOCK_ERROR_MESSAGE);
    },
  });

  async function blockProposalMember() {
    if (blockMutation.isPending || isBlocked) return;

    if (
      guardOfflineAction({
        description: BLOCK_OFFLINE_MESSAGE,
        id: `forge-proposal-${proposalId}-block-offline`,
      })
    ) {
      setBlockError(BLOCK_OFFLINE_MESSAGE);
      return;
    }

    setBlockError(null);
    await blockMutation.mutateAsync().catch(() => null);
  }

  const blockDisabled = blockMutation.isPending || isBlocked;

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <ReportDialog
          targets={[
            {
              id: seat.seatId,
              label: `${seat.profile.name} from this proposal`,
              type: "PROPOSAL_SEAT",
            },
          ]}
          trigger={
            <Button
              aria-label={`Report ${seat.profile.name} from this proposal`}
              size="compact"
              variant="subtle"
            >
              <Flag className="size-4" aria-hidden="true" />
              Report
            </Button>
          }
        />

        <ActionDialog
          cancelLabel="Not now"
          confirmLabel="Block person"
          description={`Blocking stops contact between you and ${seat.profile.name}. If this proposal is still open, it will close for everyone.`}
          details={[
            "The other members can be considered for another group.",
            "TeamForge will not tell them who blocked whom.",
            "You can unblock this person later in Safety settings.",
          ]}
          disabled={blockDisabled}
          loading={blockMutation.isPending}
          onConfirm={blockProposalMember}
          title={`Block ${seat.profile.name}?`}
          tone="danger"
          trigger={
            <Button
              aria-label={`Block ${seat.profile.name}`}
              size="compact"
              variant="destructive"
              disabled={blockDisabled}
            >
              <Ban className="size-4" aria-hidden="true" />
              {isBlocked ? "Blocked" : "Block"}
            </Button>
          }
        />
      </div>

      {blockError ? (
        <p role="alert" className="mt-2 text-destructive text-sm sm:text-right">
          {blockError}
        </p>
      ) : null}
    </div>
  );
}
