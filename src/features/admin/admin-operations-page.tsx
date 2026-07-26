import { useRouteContext } from "@tanstack/react-router";
import { AdminFixedPilotSummary } from "@/features/admin/components/admin-fixed-pilot-summary";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";
import { AdminPilotMetrics } from "@/features/admin/components/admin-pilot-metrics";
import { AdminPilotOperationsReadiness } from "@/features/admin/components/admin-pilot-operations-readiness/admin-pilot-operations-readiness";
import { AdminPilotRetentionStatus } from "@/features/admin/components/admin-pilot-retention-status";
import { AdminPilotStatus } from "@/features/admin/components/admin-pilot-status";

export function AdminOperationsPage() {
  const { adminSession } = useRouteContext({ from: "/admin" });

  return (
    <AdminPageShell title="Controlled pilot">
      <div className="grid gap-8">
        <AdminPilotStatus />
        <AdminPilotOperationsReadiness />
        <AdminPilotMetrics />
        <AdminPilotRetentionStatus
          canManage={adminSession.capabilities.managePilotRetention}
        />
        <AdminFixedPilotSummary
          canManage={adminSession.capabilities.manageSponsorArtifacts}
        />
      </div>
    </AdminPageShell>
  );
}
