import { useRouteContext } from "@tanstack/react-router";
import { ChartNoAxesCombined } from "lucide-react";
import { AdminAdultEligibilityCorrections } from "@/features/admin/components/admin-adult-eligibility-corrections";
import { AdminOverviewQueues } from "@/features/admin/components/admin-overview-queues";
import { AdminOverviewSystem } from "@/features/admin/components/admin-overview-system";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";
import { AdminPilotMetrics } from "@/features/admin/components/admin-pilot-metrics";
import { CollapsibleSection } from "@/shared/components/ui/collapsible-section";

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
        <CollapsibleSection
          variant="panel"
          summary={
            <div className="grid gap-1">
              <span className="flex items-center gap-2.5 text-base">
                <ChartNoAxesCombined
                  className="size-5 shrink-0"
                  aria-hidden="true"
                />
                Product outcomes
              </span>
              <span className="font-normal text-slate-muted text-xs">
                Activation, response, and early beta results
              </span>
            </div>
          }
        >
          <AdminPilotMetrics />
        </CollapsibleSection>

        <AdminAdultEligibilityCorrections
          canManage={adminSession.capabilities.manageAccountRights}
        />
      </div>
    </AdminPageShell>
  );
}
