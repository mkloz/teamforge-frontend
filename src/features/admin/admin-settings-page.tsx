import { useRouteContext } from "@tanstack/react-router";

import { AdminModerationGovernance } from "@/features/admin/components/admin-moderation-governance";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";

export function AdminSettingsPage() {
  const { adminSession } = useRouteContext({ from: "/admin" });

  return (
    <AdminPageShell
      title="Policy and rollout"
      description="Every change is validated and recorded by the server."
    >
      <AdminModerationGovernance
        canManage={adminSession.capabilities.manageConfiguration}
      />
    </AdminPageShell>
  );
}
