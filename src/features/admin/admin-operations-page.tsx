import { useRouteContext } from "@tanstack/react-router";
import { Archive, ChartNoAxesCombined } from "lucide-react";
import { AdminFixedPilotSummary } from "@/features/admin/components/admin-fixed-pilot-summary";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";
import { AdminPilotMetrics } from "@/features/admin/components/admin-pilot-metrics";
import { AdminPilotOperationsReadiness } from "@/features/admin/components/admin-pilot-operations-readiness/admin-pilot-operations-readiness";
import { AdminPilotRetentionStatus } from "@/features/admin/components/admin-pilot-retention-status";
import { AdminPilotStatus } from "@/features/admin/components/admin-pilot-status";
import { CollapsibleSection } from "@/shared/components/ui/collapsible-section";

export function AdminOperationsPage() {
  const { adminSession } = useRouteContext({ from: "/admin" });

  return (
    <AdminPageShell
      title="Pilot operations"
      description="Follow the cohort, clear operational blockers, and expand deeper evidence only when it is needed."
    >
      <div className="grid gap-10">
        <AdminPilotStatus />
        <AdminPilotOperationsReadiness />
        <CollapsibleSection
          variant="panel"
          summary={
            <div className="grid gap-1">
              <span className="flex items-center gap-2.5 text-base">
                <ChartNoAxesCombined
                  className="size-5 shrink-0"
                  aria-hidden="true"
                />
                Outcome measurement
              </span>
              <span className="font-normal text-slate-muted text-xs">
                Activation, response, and internal operational measures
              </span>
            </div>
          }
        >
          <AdminPilotMetrics />
        </CollapsibleSection>
        <CollapsibleSection
          variant="panel"
          summary={
            <div className="grid gap-1">
              <span className="flex items-center gap-2.5 text-base">
                <Archive className="size-5 shrink-0" aria-hidden="true" />
                Records and sponsor output
              </span>
              <span className="font-normal text-slate-muted text-xs">
                Retention controls and the fixed pilot summary
              </span>
            </div>
          }
        >
          <div className="grid gap-10">
            <AdminPilotRetentionStatus
              canManage={adminSession.capabilities.managePilotRetention}
            />
            <AdminFixedPilotSummary
              canManage={adminSession.capabilities.manageSponsorArtifacts}
            />
          </div>
        </CollapsibleSection>
      </div>
    </AdminPageShell>
  );
}
