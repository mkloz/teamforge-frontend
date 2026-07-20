import { useRouteContext } from "@tanstack/react-router";

import { AdminModerationGovernance } from "@/features/admin/components/admin-moderation-governance";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";

export function AdminSettingsPage() {
  const { adminSession } = useRouteContext({ from: "/admin" });

  return (
    <AdminPageShell
      eyebrow="Moderation settings"
      title="Policy and rollout"
      description="Review each saved policy version, prepare a draft, and control what can be released. Every change is checked and recorded by the server."
    >
      <AdminModerationGovernance
        canManage={adminSession.capabilities.manageConfiguration}
      />
    </AdminPageShell>
  );
}
