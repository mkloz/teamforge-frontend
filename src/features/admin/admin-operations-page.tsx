import { AdminPageShell } from "@/features/admin/components/admin-page-shell";
import { AdminPilotMetrics } from "@/features/admin/components/admin-pilot-metrics";
import { AdminPilotStatus } from "@/features/admin/components/admin-pilot-status";

export function AdminOperationsPage() {
  return (
    <AdminPageShell
      eyebrow="Moderation operations"
      title="Controlled pilot"
      description="The server's current cohort, rollout gates, readiness checks, and activity outcome tracking. This page is read only and does not change pilot settings."
    >
      <div className="grid gap-8">
        <AdminPilotStatus />
        <AdminPilotMetrics />
      </div>
    </AdminPageShell>
  );
}
