import { useRouteContext } from "@tanstack/react-router";
import { AdminAdultEligibilityCorrections } from "@/features/admin/components/admin-adult-eligibility-corrections";
import { AdminOverviewQueues } from "@/features/admin/components/admin-overview-queues";
import { AdminOverviewSystem } from "@/features/admin/components/admin-overview-system";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";

export function AdminOverviewPage() {
  const { adminSession } = useRouteContext({ from: "/admin" });

  return (
    <AdminPageShell
      title="Admin overview"
      description="The decisions, system health, and account rights that need attention now."
    >
      <div className="grid gap-10">
        <AdminOverviewQueues />
        <AdminOverviewSystem />

        <AdminAdultEligibilityCorrections
          canManage={adminSession.capabilities.manageAccountRights}
        />
      </div>
    </AdminPageShell>
  );
}
