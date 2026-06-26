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

type AccountFactConfig = {
  getValue: (currentUser: User | undefined) => string;
  icon: LucideIcon;
  label: string;
};

type AuthProvider = NonNullable<User["authProvider"]>;

const AUTH_PROVIDER_LABELS: Partial<Record<AuthProvider, string>> = {
  GOOGLE: "Google",
};

const ACCOUNT_FACTS = [
  {
    icon: Mail,
    label: "Email",
    getValue: getEmailFactValue,
  },
  {
    icon: ShieldCheck,
    label: "Sign-in",
    getValue: getSignInFactValue,
  },
  {
    icon: CheckCircle2,
    label: "Verification",
    getValue: getVerificationFactValue,
  },
  {
    icon: CalendarDays,
    label: "Member since",
    getValue: getMemberSinceFactValue,
  },
] satisfies readonly AccountFactConfig[];

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
  return (
    <dl className="border-border border-y lg:border-y-0 lg:border-l lg:pl-6">
      {ACCOUNT_FACTS.map((fact) => (
        <AccountFact
          key={fact.label}
          icon={fact.icon}
          label={fact.label}
          value={fact.getValue(currentUser)}
        />
      ))}
    </dl>
  );
}

function getEmailFactValue(currentUser: User | undefined) {
  return currentUser?.email ?? "Not set";
}

function getSignInFactValue(currentUser: User | undefined) {
  return getAuthProviderLabel(currentUser?.authProvider);
}

function getAuthProviderLabel(provider: User["authProvider"] | undefined) {
  return getKnownAuthProviderLabel(provider) ?? "Email";
}

function getKnownAuthProviderLabel(provider: User["authProvider"] | undefined) {
  if (!provider) {
    return undefined;
  }

  return AUTH_PROVIDER_LABELS[provider];
}

function getVerificationFactValue(currentUser: User | undefined) {
  return currentUser?.emailVerified ? "Verified" : "Needs verification";
}

function getMemberSinceFactValue(currentUser: User | undefined) {
  return formatMemberSince(currentUser?.createdAt);
}
