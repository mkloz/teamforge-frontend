import { useRouteContext } from "@tanstack/react-router";
import { AdminFixedPilotSummary } from "@/features/admin/components/admin-fixed-pilot-summary";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";
import { AdminPilotMetrics } from "@/features/admin/components/admin-pilot-metrics";
import { AdminPilotStatus } from "@/features/admin/components/admin-pilot-status";

export function AdminOperationsPage() {
  const { adminSession } = useRouteContext({ from: "/admin" });

  return (
    <AdminPageShell
      eyebrow="Moderation operations"
      title="Controlled pilot"
      description="Review the server's current cohort, rollout gates, readiness checks, activity outcomes, and fixed pilot summary."
    >
      <div className="grid gap-8">
        <AdminPilotStatus />
        <AdminPilotMetrics />
        <AdminFixedPilotSummary
          canManage={adminSession.capabilities.manageSponsorArtifacts}
        />
      </div>
    </AdminPageShell>
  );
}
