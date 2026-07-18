import { AdminPageShell } from "@/features/admin/components/admin-page-shell";
import { AdminPilotStatus } from "@/features/admin/components/admin-pilot-status";

export function AdminOperationsPage() {
  return (
    <AdminPageShell
      eyebrow="Moderation operations"
      title="Controlled pilot"
      description="The server's current cohort, rollout gates, and readiness checks. This page is read only and does not change pilot settings."
    >
      <AdminPilotStatus />
    </AdminPageShell>
  );
}
