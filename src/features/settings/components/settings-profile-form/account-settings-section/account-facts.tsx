import {
  CalendarDays,
  CheckCircle2,
  type LucideIcon,
  Mail,
  ShieldCheck,
} from "lucide-react";
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
    <div className="flex gap-3 border-border border-b py-4 last:border-b-0">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-slate-muted">
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-slate-muted text-xs uppercase tracking-widest">
          {label}
        </p>
        <p className="mt-1 break-words font-semibold text-ink text-sm">
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
    <div className="border-border border-y lg:border-y-0 lg:border-l lg:pl-6">
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
