import { useParams } from "@tanstack/react-router";
import { FileLock2, History, ListChecks } from "lucide-react";
import { AdminPageShell } from "@/features/admin/components/admin-page-shell";
import { AdminReadOnlySection } from "@/features/admin/components/admin-read-only-section";

export function AdminCasePage() {
  useParams({ from: "/admin/moderation/cases/$caseId" });

  return (
    <AdminPageShell
      eyebrow="Moderation case"
      title="Case review"
      description="The route is protected and ready for the versioned case reader. Evidence and decision controls remain closed in this read-only slice."
    >
      <div>
        <AdminReadOnlySection
          icon={ListChecks}
          title="Assessment and policy"
          description="The contextual assessment, moderation signals, evidence references, and applicable policy will appear from one validated case response."
        />
        <AdminReadOnlySection
          icon={FileLock2}
          title="Preserved evidence"
          description="Evidence will remain metadata-only until a recent step-up and an audited reveal both succeed."
        />
        <AdminReadOnlySection
          icon={History}
          title="Decision history"
          description="AI actions, human decisions, overrides, and reversals will be shown in the order recorded by the backend."
        />
      </div>
    </AdminPageShell>
  );
}
