import { Activity, CircleGauge, ServerCog } from "lucide-react";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";
import { AdminReadOnlySection } from "@/features/admin/components/admin-read-only-section";

export function AdminOperationsPage() {
  return (
    <AdminPageShell
      eyebrow="Moderation operations"
      title="Processing health"
      description="Worker health and processing failures will be visible here. This first slice does not poll workers or offer operational controls."
    >
      <div>
        <AdminReadOnlySection
          icon={Activity}
          title="Worker health"
          description="Queue depth, delayed work, failed jobs, and recent heartbeats will come from the operations API."
        />
        <AdminReadOnlySection
          icon={CircleGauge}
          title="Latency and cost"
          description="Moderation and assessment timing, token estimates, and cost will be grouped by the exact recorded model and configuration version."
        />
        <AdminReadOnlySection
          icon={ServerCog}
          title="Recovery controls"
          description="Pause, resume, and retry controls will remain disabled until server authority and recent step-up are connected."
        />
      </div>
    </AdminPageShell>
  );
}
