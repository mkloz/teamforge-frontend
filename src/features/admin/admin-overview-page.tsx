import { useRouteContext } from "@tanstack/react-router";
import { Bot, ShieldCheck, UserRoundCheck } from "lucide-react";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";
import { AdminReadOnlySection } from "@/features/admin/components/admin-read-only-section";
import { StatusPill } from "@/shared/components/ui/status-pill";

export function AdminOverviewPage() {
  const { adminSession } = useRouteContext({ from: "/admin" });

  return (
    <AdminPageShell
      title="Admin overview"
      description="A private starting point for the few moderation cases that need you. Open the review queue for live cases and Operations for system status."
    >
      <div className="grid gap-6">
        <section className="grid gap-3 border-border border-t py-6 sm:grid-cols-2">
          <div>
            <p className="font-semibold text-slate-muted text-xs">
              Signed in as
            </p>
            <p className="mt-1 font-semibold text-ink">
              {adminSession.displayName}
            </p>
          </div>
          <div>
            <p className="font-semibold text-slate-muted text-xs">Access</p>
            <StatusPill className="mt-2" size="xs" tone="teal">
              Admin confirmed
            </StatusPill>
          </div>
        </section>

        <div>
          <AdminReadOnlySection
            icon={ShieldCheck}
            title="Priority review"
            description="Critical escalations and cases that require human authority will appear here when the case feed is connected."
          />
          <AdminReadOnlySection
            icon={Bot}
            title="Automated decisions"
            description="Recent automated decisions, conflicts, and processing failures will be shown from server-owned audit records."
          />
          <AdminReadOnlySection
            icon={UserRoundCheck}
            title="Appeals and reversals"
            description="Appeals, human overrides, and reversal history will appear here when the feed is connected."
          />
        </div>
      </div>
    </AdminPageShell>
  );
}
