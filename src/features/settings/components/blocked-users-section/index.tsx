import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { OfflineSettingsNotice } from "@/features/settings/components/settings-profile-form/preference-section-parts";
import { Button } from "@/shared/components/ui/button";
import { buildSafetyNavigation } from "@/shared/navigation/safety-navigation";
import { BlockedUsersList } from "./blocked-users-list";
import type { BlockedUsersSectionProps } from "./types";

export function BlockedUsersSection({
  blockedUsers,
  errorMessage,
  isOnline,
  isLoading,
  unblockingUserId,
  onUnblockUser,
}: BlockedUsersSectionProps) {
  return (
    <div className="grid gap-9">
      <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="font-bold text-ink text-xl">
              Reports and account actions
            </h2>
            <p className="mt-1 text-pretty text-slate-muted text-sm leading-relaxed">
              Review reports you sent, account actions, appeals, and temporary
              restrictions.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-fit">
          <Link {...buildSafetyNavigation()}>
            Open Safety Center
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </section>

      <section>
        <div className="flex max-w-2xl items-start gap-3">
          <div className="min-w-0">
            <h2 className="font-bold text-ink text-xl">Blocked users</h2>
            <p className="mt-1 text-slate-muted text-sm leading-relaxed">
              See who you have blocked and unblock someone when you are ready.
            </p>
          </div>
        </div>

        {!isOnline ? (
          <div className="mt-6">
            <OfflineSettingsNotice message="Reconnect before changing your blocked users list." />
          </div>
        ) : null}

        <div className="mt-6 border-border border-t">
          <BlockedUsersList
            blockedUsers={blockedUsers}
            errorMessage={errorMessage}
            isOnline={isOnline}
            isLoading={isLoading}
            unblockingUserId={unblockingUserId}
            onUnblockUser={onUnblockUser}
          />
        </div>
      </section>
    </div>
  );
}
