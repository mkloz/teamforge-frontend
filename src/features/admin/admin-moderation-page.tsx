import { FileWarning, Scale, ShieldAlert } from "lucide-react";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";
import { AdminReadOnlySection } from "@/features/admin/components/admin-read-only-section";

export function AdminModerationPage() {
  return (
    <AdminPageShell
      eyebrow="Moderation"
      title="Cases that need a person"
      description="This queue will contain exceptions that TeamForge cannot resolve safely on its own. Routine reports will not be sent here."
    >
      <div>
        <AdminReadOnlySection
          icon={ShieldAlert}
          title="Critical cases"
          description="Immediate safety risks will appear first, ordered by the server. No local priority or placeholder count is shown."
        />
        <AdminReadOnlySection
          icon={FileWarning}
          title="Conflicts and failures"
          description="Invalid assessments, conflicting evidence, and preservation failures will appear when they require your attention."
        />
        <AdminReadOnlySection
          icon={Scale}
          title="Human authority"
          description="Permanent actions, serious appeals, and policy exceptions will stay in a small, explicit decision queue."
        />
      </div>
    </AdminPageShell>
  );
}
