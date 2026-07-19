import { LogOut, Trash2 } from "lucide-react";
import { useState } from "react";

import type { useAccountLifecycle } from "@/features/settings/hooks/use-account-lifecycle";
import { ACCOUNT_DATA_COPY } from "@/features/settings/lib/account-data-copy";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
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
    <section className="border-border border-t pt-7">
      <div className="flex max-w-2xl flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink text-lg">Account status</h3>
          <p className="mt-1 text-slate-muted text-sm leading-relaxed">
            {lifecycleDescription}
          </p>
        </div>
        <StatusPill
          tone={lifecycle?.lifecycle === "ACTIVE" ? "teal" : "neutral"}
          size="sm"
        >
          {lifecycleLabel}
        </StatusPill>
      </div>

      {state.error ? (
        <Notice
          className="mt-5 max-w-2xl"
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
        <Notice className="mt-5 max-w-2xl" tone="neutral" size="md">
          {ACCOUNT_DATA_COPY.lifecycle.retainedRecords}
        </Notice>
      ) : null}

      {lifecycle?.canDeactivate ? (
        <div className="mt-6 flex flex-col gap-4 border-border border-t py-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <h4 className="font-semibold text-ink text-sm">
              Take a break from TeamForge
            </h4>
            <p className="mt-1 text-slate-muted text-sm leading-relaxed">
              This signs you out and stops new group proposals. Your account
              data and reviewed safety records stay in place.
            </p>
          </div>
          <ActionDialog
            cancelLabel="Keep account active"
            closeOnConfirm={false}
            confirmLabel={state.isDeactivating ? "Deactivating…" : "Deactivate"}
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
                size="compact"
                disabled={!state.isOnline || state.isDeactivating}
              >
                <LogOut className="size-4" aria-hidden="true" />
                Deactivate
              </Button>
            }
          />
        </div>
      ) : null}

      {lifecycle?.canDelete ? (
        <div className="flex flex-col gap-4 border-destructive/30 border-t pt-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <p className="font-semibold text-destructive text-xs">
              Permanent action
            </p>
            <h4 className="mt-2 font-semibold text-ink text-sm">
              Delete account
            </h4>
            <p className="mt-1 text-slate-muted text-sm leading-relaxed">
              This removes your active account. Some reviewed safety records and
              shared group history may be kept when required.
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
                size="compact"
                disabled={!state.isOnline || state.isDeleting}
              >
                <Trash2 className="size-4" aria-hidden="true" />
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
      ) : null}
    </section>
  );
}
