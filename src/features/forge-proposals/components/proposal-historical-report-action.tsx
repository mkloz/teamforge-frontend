import { useQuery } from "@tanstack/react-query";
import { Flag, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { forgeProposalQueries } from "@/features/forge-proposals/api/forge-proposal-queries";
import type { ForgeProposalReportTargets } from "@/features/forge-proposals/schemas/forge-proposal-report-targets.schema";
import { ReportDialog } from "@/features/reporting/public/reporting";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";

const NEUTRAL_REPORT_TARGET_STATUSES = new Set([403, 404, 410]);
const MAX_TIMEOUT_MS = 2_147_483_647;

export function ProposalHistoricalReportAction({
  proposalId,
}: {
  proposalId: string;
}) {
  const reportTargetsQuery = useQuery(
    forgeProposalQueries.reportTargets(proposalId),
  );
  const [reportingWindowEnded, setReportingWindowEnded] = useState(false);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const reportTargets = reportTargetsQuery.data;

  useEffect(() => {
    if (!reportTargets) return undefined;

    const deadline = new Date(reportTargets.reportableUntil).getTime();
    let timeoutId: number | undefined;

    function scheduleWindowCheck() {
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) {
        setReportingWindowEnded(true);
        return;
      }

      setReportingWindowEnded(false);
      timeoutId = window.setTimeout(
        scheduleWindowCheck,
        Math.min(MAX_TIMEOUT_MS, remainingMs + 50),
      );
    }

    scheduleWindowCheck();
    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [reportTargets]);

  if (reportTargetsQuery.isPending) {
    return null;
  }

  if (reportTargetsQuery.isError) {
    const status = getHttpErrorStatus(reportTargetsQuery.error);

    if (status !== null && NEUTRAL_REPORT_TARGET_STATUSES.has(status)) {
      return null;
    }

    return (
      <Button
        loading={reportTargetsQuery.isFetching}
        size="compact"
        variant="subtle"
        onClick={() => void reportTargetsQuery.refetch()}
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        Try report options again
      </Button>
    );
  }

  if (!reportTargets) return null;

  if (reportingWindowEnded || reportTargets.targets.length === 0) {
    return null;
  }

  const selectedTarget = reportTargets.targets.find(
    (target) => target.seatId === selectedSeatId,
  );

  return (
    <>
      <HistoricalTargetPicker
        targets={reportTargets.targets}
        onSelect={setSelectedSeatId}
      />
      {selectedTarget ? (
        <ReportDialog
          open
          onOpenChange={(open) => {
            if (!open) setSelectedSeatId(null);
          }}
          targets={[
            {
              id: selectedTarget.seatId,
              label: `${selectedTarget.displayName} from this proposal`,
              type: "PROPOSAL_SEAT",
            },
          ]}
        />
      ) : null}
    </>
  );
}

function HistoricalTargetPicker({
  onSelect,
  targets,
}: {
  onSelect: (seatId: string) => void;
  targets: ForgeProposalReportTargets["targets"];
}) {
  if (targets.length === 1 && targets[0]) {
    return (
      <Button
        size="compact"
        variant="subtle"
        onClick={() => onSelect(targets[0].seatId)}
      >
        <Flag className="size-4" aria-hidden="true" />
        Report {targets[0].displayName}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="compact" variant="subtle">
          <Flag className="size-4" aria-hidden="true" />
          Report someone
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {targets.map((target) => (
          <DropdownMenuItem
            key={target.seatId}
            className="gap-3"
            onSelect={() => onSelect(target.seatId)}
          >
            <Avatar
              src={target.avatar}
              name={target.displayName}
              imageSize={40}
              className="size-8 ring-1 ring-border/50"
            />
            <span className="min-w-0 truncate">{target.displayName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
