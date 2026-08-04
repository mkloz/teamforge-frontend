import { AdminPageShell } from "@/features/admin/components/admin-page-shell";
import { AdminPilotOperationsReadiness } from "@/features/admin/components/admin-pilot-operations-readiness/admin-pilot-operations-readiness";
import { AdminPilotStatus } from "@/features/admin/components/admin-pilot-status";

export function AdminOperationsPage() {
  return (
    <AdminPageShell
      title="Operations"
      description="Control the beta rollout and see the safety queues and system workers that need attention."
    >
      <div className="grid gap-10">
        <AdminPilotStatus />
        <AdminPilotOperationsReadiness />
      </div>
    </AdminPageShell>
  );
}
