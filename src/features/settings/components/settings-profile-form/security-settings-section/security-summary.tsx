import { StatPill } from "@/features/settings/components/settings-profile-form/settings-form-controls";
import type { User } from "@/shared/schemas";

interface SecuritySummaryProps {
  currentUser: User | undefined;
}

const EMPTY_SECURITY_SUMMARY_ITEMS = [
  { label: "Email", value: "Not set" },
  { label: "Provider", value: "Email" },
  { label: "Verification", value: "Pending" },
  { label: "Profile complete", value: "In progress" },
];

export function SecuritySummary({ currentUser }: SecuritySummaryProps) {
  const summaryItems = getSecuritySummaryItems(currentUser);

  return (
    <div className="mt-6 grid gap-5 border-border border-t pt-6 md:grid-cols-2 xl:grid-cols-4">
      {summaryItems.map((item) => (
        <StatPill key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  );
}

function getSecuritySummaryItems(currentUser: User | undefined) {
  if (!currentUser) {
    return EMPTY_SECURITY_SUMMARY_ITEMS;
  }

  return [
    { label: "Email", value: currentUser.email },
    { label: "Provider", value: getAuthProviderLabel(currentUser) },
    {
      label: "Verification",
      value: currentUser.emailVerified ? "Verified" : "Pending",
    },
    {
      label: "Profile complete",
      value: currentUser.profileComplete ? "Complete" : "In progress",
    },
  ];
}

function getAuthProviderLabel(currentUser: User) {
  return currentUser.authProvider === "GOOGLE" ? "Google" : "Email";
}
