import { useRouteContext } from "@tanstack/react-router";
import { AdminAdultEligibilityCorrections } from "@/features/admin/components/admin-adult-eligibility-corrections";
import { AdminOverviewQueues } from "@/features/admin/components/admin-overview-queues";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";

export function AdminOverviewPage() {
  const { adminSession } = useRouteContext({ from: "/admin" });

  return (
    <AdminPageShell title="Admin overview">
      <div className="grid gap-8">
        <AdminOverviewQueues />

        <AdminAdultEligibilityCorrections
          canManage={adminSession.capabilities.manageAccountRights}
        />
      </div>
    </AdminPageShell>
  );
}
