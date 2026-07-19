import { Flag } from "lucide-react";

import { ReportDialog } from "@/features/reporting/components/report-dialog";
import { Button } from "@/shared/components/ui/button";

export function FormationOpeningReportAction({
  activityId,
  activityTitle,
}: {
  activityId: string;
  activityTitle: string;
}) {
  return (
    <ReportDialog
      targets={[
        {
          id: activityId,
          label: `${activityTitle} opening`,
          type: "ACTIVITY",
        },
      ]}
      trigger={
        <Button
          aria-label={`Report the ${activityTitle} opening`}
          size="xs"
          variant="ghost"
        >
          <Flag className="size-3.5" aria-hidden="true" />
          Report
        </Button>
      }
    />
  );
}
