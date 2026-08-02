import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Download } from "lucide-react";
import { useState } from "react";
import {
  downloadPlanCalendar,
  getPlanCalendarConflictSummary,
} from "@/shared/api/plan-membership-api";
import { Button } from "@/shared/components/ui/button";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

interface PlanCalendarActionsProps {
  planId: string;
}

export function PlanCalendarActions({ planId }: PlanCalendarActionsProps) {
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const conflictQuery = useQuery({
    queryKey: ["plans", planId, "calendar-conflicts"],
    queryFn: () => getPlanCalendarConflictSummary(planId),
    staleTime: 60_000,
  });

  async function downloadCalendar() {
    setDownloadError(null);
    if (
      guardOfflineAction({
        id: `plan-calendar-download-offline-${planId}`,
        description: "Reconnect before adding this plan to your calendar.",
      })
    ) {
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await downloadPlanCalendar(planId);
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, "teamforge-plan.ics");
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
    } catch (cause) {
      setDownloadError(
        getApiErrorMessage(
          cause,
          "We couldn’t download this calendar file. Please try again.",
        ),
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="mt-4 border-forge-teal/25 border-t pt-4">
      {conflictQuery.data?.data.hasConflict ? (
        <p
          className="mb-3 flex items-start gap-2 text-spark-amber text-xs leading-relaxed"
          role="status"
        >
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            Overlaps with {conflictQuery.data.data.conflictCount} other
            TeamForge
            {conflictQuery.data.data.conflictCount === 1 ? " plan" : " plans"}.
            TeamForge plans only—this won’t stop you adding it.
          </span>
        </p>
      ) : null}

      <Button
        className="w-full"
        disabled={!isOnline}
        loading={isDownloading}
        onClick={downloadCalendar}
        size="md"
        variant="subtle"
      >
        <Download className="size-4" aria-hidden />
        Add to calendar
      </Button>
      <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
        This downloads a private snapshot. It won’t update automatically, and
        TeamForge can’t remove the copy later.
      </p>
      {downloadError ? (
        <p className="mt-2 text-destructive text-xs" role="alert">
          {downloadError}
        </p>
      ) : null}
      {conflictQuery.isError ? (
        <p className="mt-2 text-muted-foreground text-xs" role="status">
          We couldn’t check your other TeamForge plans.
        </p>
      ) : null}
    </div>
  );
}

function triggerDownload(url: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
}
