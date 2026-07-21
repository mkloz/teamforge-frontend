import { useRouteContext } from "@tanstack/react-router";
import { AdminAdultEligibilityCorrections } from "@/features/admin/components/admin-adult-eligibility-corrections";
import { AdminOverviewQueues } from "@/features/admin/components/admin-overview-queues";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";
import { StatusPill } from "@/shared/components/ui/status-pill";

export function AdminOverviewPage() {
  const { adminSession } = useRouteContext({ from: "/admin" });

  return (
    <AdminPageShell
      title="Admin overview"
      description="Review moderation cases, account appeals, worker status, and pilot readiness."
    >
      <div className="grid gap-8">
        <section className="grid gap-3 border-border border-t py-6 sm:grid-cols-2">
          <div className="grid content-start gap-1">
            <p className="font-semibold text-slate-muted text-xs">
              Signed in as
            </p>
            <p className="font-semibold text-ink">{adminSession.displayName}</p>
          </div>
          <div className="grid content-start justify-items-start gap-2">
            <p className="font-semibold text-slate-muted text-xs">Access</p>
            <StatusPill size="xs" tone="teal">
              Admin confirmed
            </StatusPill>
          </div>
        </section>

        <AdminOverviewQueues />

        <AdminAdultEligibilityCorrections
          canManage={adminSession.capabilities.manageAccountRights}
        />
      </div>
    </AdminPageShell>
  );
}
