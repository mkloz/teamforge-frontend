import { Bot, LockKeyhole, SlidersHorizontal } from "lucide-react";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";
import { AdminReadOnlySection } from "@/features/admin/components/admin-read-only-section";

export function AdminSettingsPage() {
  return (
    <AdminPageShell
      eyebrow="Moderation settings"
      title="Policy and rollout settings"
      description="Configuration is versioned, audited, and stored on the server. This page stays read-only until the controls are connected."
    >
      <div>
        <AdminReadOnlySection
          icon={Bot}
          title="Rollout and models"
          description="The current rollout mode and moderation models will appear here when the configuration controls are connected."
        />
        <AdminReadOnlySection
          icon={SlidersHorizontal}
          title="Thresholds and authority"
          description="The current thresholds and actions allowed for automated moderation will come from the audited configuration."
        />
        <AdminReadOnlySection
          icon={LockKeyhole}
          title="Protected changes"
          description="Changes will require a recent sign-in check, the latest configuration version, and a final confirmation."
        />
      </div>
    </AdminPageShell>
  );
}
