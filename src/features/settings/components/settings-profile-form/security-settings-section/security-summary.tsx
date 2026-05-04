import { StatPill } from "@/features/settings/components/settings-profile-form/settings-form-controls";
import type { User } from "@/shared/schemas";

interface SecuritySummaryProps {
  currentUser: User | undefined;
}

export function SecuritySummary({ currentUser }: SecuritySummaryProps) {
  return (
    <div className="mt-6 grid gap-5 border-t border-border pt-6 md:grid-cols-2 xl:grid-cols-4">
      <StatPill label="Email" value={currentUser?.email ?? "Not set"} />
      <StatPill
        label="Provider"
        value={currentUser?.authProvider === "GOOGLE" ? "Google" : "Email"}
      />
      <StatPill
        label="Verification"
        value={currentUser?.emailVerified ? "Verified" : "Pending"}
      />
      <StatPill
        label="Profile complete"
        value={currentUser?.profileComplete ? "Complete" : "In progress"}
      />
    </div>
  );
}
