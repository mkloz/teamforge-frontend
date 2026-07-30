import { LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";

import type { useAccountLifecycle } from "@/features/settings/hooks/use-account-lifecycle";
import { ACCOUNT_DATA_COPY } from "@/features/settings/lib/account-data-copy";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { Input } from "@/shared/components/ui/input";
import { Notice } from "@/shared/components/ui/notice";
import { StatusPill } from "@/shared/components/ui/status-pill";
import type { User } from "@/shared/schemas";

interface AccountLifecycleSectionProps {
  currentUser: User | undefined;
  state: ReturnType<typeof useAccountLifecycle>;
}

const DELETE_CONFIRMATION = "DELETE";

export function AccountLifecycleSection({
  currentUser,
  state,
}: AccountLifecycleSectionProps) {
  const [confirmation, setConfirmation] = useState("");
  const lifecycle = state.accountLifecycle;
  const lifecycleLabel = lifecycle
    ? { ACTIVE: "Active", DEACTIVATED: "Deactivated", DELETED: "Deleted" }[
        lifecycle.lifecycle
      ]
    : "Checking";
  const lifecycleDescription = lifecycle
    ? {
        ACTIVE: ACCOUNT_DATA_COPY.lifecycle.active,
        DEACTIVATED: ACCOUNT_DATA_COPY.lifecycle.deactivated,
        DELETED: ACCOUNT_DATA_COPY.lifecycle.deleted,
      }[lifecycle.lifecycle]
    : "Checking your account status…";

  return (
    <section>
      <div className="px-1">
        <h2 className="font-bold text-ink text-xl">Account access</h2>
        <p className="mt-1 max-w-2xl text-slate-muted text-sm leading-relaxed">
          Pause access to TeamForge or permanently remove your account.
        </p>
      </div>

      {state.error ? (
        <Notice
          className="mt-4"
          role="alert"
          tone="danger"
          size="md"
          action={
            state.isError ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => void state.refetch()}
              >
                Try again
              </Button>
            ) : null
          }
        >
          {state.error}
        </Notice>
      ) : null}

      {lifecycle?.retainedRecordNotice === "SHARED_HISTORY_AND_SAFETY" ? (
        <Notice className="mt-4" tone="neutral" size="md">
          {ACCOUNT_DATA_COPY.lifecycle.retainedRecords}
        </Notice>
      ) : null}

      <GroupedMenuList aria-label="Account access" className="mt-5">
        <GroupedMenuItem>
          <div className="flex min-h-16 items-center gap-3 px-3 py-3 sm:px-5">
            <IconTile
              icon={ShieldCheck}
              shape="circle"
              size="lg"
              tone={lifecycle?.lifecycle === "ACTIVE" ? "teal" : "neutral"}
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink text-sm">Account status</p>
              <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
                {lifecycleDescription}
              </p>
            </div>
            <StatusPill
              tone={lifecycle?.lifecycle === "ACTIVE" ? "teal" : "neutral"}
              size="xs"
              surface="soft"
            >
              {lifecycleLabel}
            </StatusPill>
          </div>
        </GroupedMenuItem>

        {lifecycle?.canDeactivate ? (
          <GroupedMenuItem>
            <div className="flex min-h-18 flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap sm:px-5 sm:py-4">
              <IconTile icon={LogOut} shape="circle" size="lg" tone="neutral" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink text-sm">
                  Take a break from TeamForge
                </p>
                <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
                  Sign out everywhere and stop new proposals until you return.
                </p>
              </div>
              <ActionDialog
                cancelLabel="Keep account active"
                closeOnConfirm={false}
                confirmLabel={
                  state.isDeactivating ? "Deactivating…" : "Deactivate"
                }
                description="You will be signed out on every device. Signing in again reactivates the account, but availability stays off until you turn it on."
                disabled={!state.isOnline || state.isDeactivating}
                loading={state.isDeactivating}
                onConfirm={state.deactivateAccount}
                title="Deactivate your account?"
                tone="warning"
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={!state.isOnline || state.isDeactivating}
                  >
                    Deactivate
                  </Button>
                }
              />
            </div>
          </GroupedMenuItem>
        ) : null}

        {lifecycle?.canDelete ? (
          <GroupedMenuItem className="bg-destructive/5">
            <div className="flex min-h-18 flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap sm:px-5 sm:py-4">
              <IconTile
                icon={Trash2}
                shape="circle"
                size="lg"
                tone="destructive"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink text-sm">Delete account</p>
                <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
                  Permanently remove this account and end access on every
                  device.
                </p>
              </div>
              <ActionDialog
                cancelLabel="Keep account"
                closeOnConfirm={false}
                confirmLabel={state.isDeleting ? "Deleting…" : "Delete account"}
                description={`Type DELETE to confirm deletion for ${currentUser?.email ?? "this account"}.`}
                details={[
                  "You will be signed out on every device.",
                  "Open corrections and data exports will be cancelled.",
                  "This cannot be undone in the app.",
                ]}
                disabled={
                  !state.isOnline ||
                  state.isDeleting ||
                  confirmation !== DELETE_CONFIRMATION
                }
                loading={state.isDeleting}
                onConfirm={state.deleteAccount}
                onOpenChange={(open) => {
                  if (!open) {
                    setConfirmation("");
                  }
                }}
                title="Delete your TeamForge account?"
                tone="danger"
                trigger={
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={!state.isOnline || state.isDeleting}
                  >
                    Delete account
                  </Button>
                }
              >
                <Input
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  disabled={!state.isOnline || state.isDeleting}
                  placeholder={DELETE_CONFIRMATION}
                  aria-label="Type DELETE to confirm account deletion"
                />
              </ActionDialog>
            </div>
          </GroupedMenuItem>
        ) : null}
      </GroupedMenuList>
    </section>
  );
}
