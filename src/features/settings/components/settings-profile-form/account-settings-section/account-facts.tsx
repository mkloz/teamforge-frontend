import { formatMemberSince } from "./account-formatters";
import type { User } from "@/shared/schemas";
import {
  CalendarDays,
  CheckCircle2,
  Mail,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

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
    <div className="flex gap-3 border-b border-border py-4 last:border-b-0">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-slate-muted">
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-widest text-slate-muted uppercase">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold break-words text-ink">
          {value}
        </p>
      </div>
    </div>
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
    <div className="border-y border-border lg:border-y-0 lg:border-l lg:pl-6">
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
    </div>
  );
}
