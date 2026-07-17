import { Bot, LockKeyhole, SlidersHorizontal } from "lucide-react";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";
import { AdminReadOnlySection } from "@/features/admin/components/admin-read-only-section";

export function AdminSettingsPage() {
  return (
    <AdminPageShell
      eyebrow="Moderation settings"
      title="Policy and rollout settings"
      description="Configuration will stay versioned, audited, and server-owned. No editable defaults or unverified policy values are embedded in this page."
    >
      <div>
        <AdminReadOnlySection
          icon={Bot}
          title="Rollout and models"
          description="The active rollout mode and selected moderation models will appear after the configuration API is connected."
        />
        <AdminReadOnlySection
          icon={SlidersHorizontal}
          title="Thresholds and authority"
          description="Versioned thresholds and the actions AI may take will be read from the current audited configuration."
        />
        <AdminReadOnlySection
          icon={LockKeyhole}
          title="Protected changes"
          description="Any future change will require fresh configuration, recent step-up, an expected version, and explicit confirmation."
        />
      </div>
    </AdminPageShell>
  );
}
