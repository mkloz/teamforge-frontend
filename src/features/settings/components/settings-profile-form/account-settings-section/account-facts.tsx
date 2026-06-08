import {
  CalendarDays,
  CheckCircle2,
  type LucideIcon,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { FactItem } from "@/shared/components/ui/fact-item";
import type { User } from "@/shared/schemas";
import { formatMemberSince } from "./account-formatters";

function AccountFact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <FactItem
      icon={Icon}
      iconTone="neutral"
      iconTileClassName="mt-0.5 bg-muted"
      label={label}
      labelClassName="font-semibold"
      value={value}
      valueClassName="mt-1"
      className="items-start gap-3 border-border border-b py-4 last:border-b-0"
    />
  );
}

export function AccountFacts({
  currentUser,
}: {
  currentUser: User | undefined;
}) {
  const verificationLabel = currentUser?.emailVerified
    ? "Verified"
    : "Needs verification";
  const providerLabel =
    currentUser?.authProvider === "GOOGLE" ? "Google" : "Email";

  return (
    <dl className="border-border border-y lg:border-y-0 lg:border-l lg:pl-6">
      <AccountFact
        icon={Mail}
        label="Email"
        value={currentUser?.email ?? "Not set"}
      />
      <AccountFact icon={ShieldCheck} label="Sign-in" value={providerLabel} />
      <AccountFact
        icon={CheckCircle2}
        label="Verification"
        value={verificationLabel}
      />
      <AccountFact
        icon={CalendarDays}
        label="Member since"
        value={formatMemberSince(currentUser?.createdAt)}
      />
    </dl>
  );
}
