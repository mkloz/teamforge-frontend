import { KeyRound, Mail } from "lucide-react";
import { GroupedMenuItem } from "@/shared/components/ui/grouped-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { getUserSignInMethods } from "@/shared/lib/user-sign-in-methods";
import type { User } from "@/shared/schemas";

interface SecuritySummaryProps {
  currentUser: User | undefined;
}

export function SecuritySummary({ currentUser }: SecuritySummaryProps) {
  const email = currentUser?.email ?? "Not set";
  const isVerified = currentUser?.emailVerified ?? false;
  const signInMethods = getSignInMethodsSummary(currentUser);

  return (
    <>
      <GroupedMenuItem>
        <div className="flex min-h-16 items-center gap-3 px-3 py-3 sm:px-5">
          <IconTile icon={Mail} shape="circle" size="lg" tone="neutral" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink text-sm">Account email</p>
            <p className="mt-0.5 truncate text-slate-muted text-xs">{email}</p>
          </div>
          <StatusPill
            size="xs"
            surface="soft"
            tone={isVerified ? "teal" : "amber"}
          >
            {isVerified ? "Verified" : "Pending"}
          </StatusPill>
        </div>
      </GroupedMenuItem>

      <GroupedMenuItem>
        <div className="flex min-h-16 items-center gap-3 px-3 py-3 sm:px-5">
          <IconTile icon={KeyRound} shape="circle" size="lg" tone="neutral" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink text-sm">Sign-in method</p>
            <p className="mt-0.5 text-slate-muted text-xs">
              {signInMethods.description}
            </p>
          </div>
          <StatusPill size="xs" surface="soft" tone="neutral">
            {signInMethods.label}
          </StatusPill>
        </div>
      </GroupedMenuItem>
    </>
  );
}

function getSignInMethodsSummary(currentUser: User | undefined) {
  const methods = getUserSignInMethods(currentUser);

  if (methods.google && methods.password) {
    return {
      label: "2 connected",
      description: "Sign in with Google or your email and password.",
    };
  }

  return methods.google
    ? {
        label: "Google",
        description: "Sign in with your connected Google account.",
      }
    : {
        label: "Email",
        description: "Sign in with your email and password.",
      };
}
