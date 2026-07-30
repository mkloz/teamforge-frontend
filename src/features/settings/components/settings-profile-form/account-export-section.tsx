import { Download, FileArchive, KeyRound, RefreshCw } from "lucide-react";
import { useState } from "react";

import { SectionHeading } from "@/features/settings/components/settings-profile-form/preference-section-parts";
import type { useAccountExport } from "@/features/settings/hooks/use-account-export";
import {
  ACCOUNT_DATA_COPY,
  getExportStatusCopy,
} from "@/features/settings/lib/account-data-copy";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { Input } from "@/shared/components/ui/input";
import { Notice } from "@/shared/components/ui/notice";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { StatusPill } from "@/shared/components/ui/status-pill";

interface AccountExportSectionProps {
  state: ReturnType<typeof useAccountExport>;
}

const EXPORT_STATE_LABELS = {
  QUEUED: "Waiting",
  PROCESSING: "Preparing",
  READY: "Ready",
  FAILED: "Needs attention",
  EXPIRED: "Expired",
  CONSUMED: "Downloaded",
} as const;

export function AccountExportSection({ state }: AccountExportSectionProps) {
  const accountExport = state.accountExport;

  return (
    <section>
      <SectionHeading
        title="Your data"
        description="Request a portable copy of the information tied to your TeamForge account."
      />

      <GroupedMenuList aria-label="Account data export" className="mt-5">
        <GroupedMenuItem>
          <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:px-5 sm:py-5">
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
              <IconTile
                icon={FileArchive}
                shape="circle"
                size="lg"
                tone={accountExport?.state === "READY" ? "teal" : "muted"}
                className="mt-0.5"
              />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-ink text-sm">
                    Account archive
                  </h3>
                  {state.isLoading ? (
                    <StatusPill tone="neutral" size="xs" surface="soft">
                      Checking
                    </StatusPill>
                  ) : accountExport ? (
                    <StatusPill
                      tone={
                        accountExport.state === "READY" ? "teal" : "neutral"
                      }
                      size="xs"
                      surface="soft"
                    >
                      {EXPORT_STATE_LABELS[accountExport.state]}
                    </StatusPill>
                  ) : null}
                </div>
                <p className="mt-1 text-slate-muted text-sm leading-relaxed">
                  {state.isLoading
                    ? "Checking your latest export…"
                    : getExportStatusCopy(accountExport)}
                </p>
              </div>

              <AccountExportAction state={state} />
            </div>

            {state.requiresRecentAuth ? (
              <Notice
                tone="info"
                size="md"
                action={<RecentAuthenticationAction state={state} />}
              >
                <p className="font-semibold">
                  {ACCOUNT_DATA_COPY.export.recentAuthTitle}
                </p>
                <p>
                  {state.canReauthenticateWithPassword
                    ? ACCOUNT_DATA_COPY.export.recentAuthDescription
                    : ACCOUNT_DATA_COPY.export.recentGoogleAuthDescription}
                </p>
              </Notice>
            ) : null}

            {state.error ? (
              <Notice
                role="alert"
                tone="danger"
                size="md"
                action={
                  state.hasLoadError ? (
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

            {!state.isOnline ? (
              <OfflineNotice withIcon={false} size="md">
                Reconnect before creating or downloading your data export.
              </OfflineNotice>
            ) : null}
          </div>
        </GroupedMenuItem>
      </GroupedMenuList>
    </section>
  );
}

function RecentAuthenticationAction({
  state,
}: Pick<AccountExportSectionProps, "state">) {
  if (!state.canReauthenticateWithPassword) {
    return (
      <Button
        type="button"
        variant="outline"
        size="xs"
        loading={state.isSigningInAgain}
        onClick={() => void state.signInAgain()}
      >
        Sign in again
      </Button>
    );
  }

  return <PasswordConfirmationDialog state={state} />;
}

function PasswordConfirmationDialog({
  state,
}: Pick<AccountExportSectionProps, "state">) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      state.clearReauthenticationError();
      return;
    }

    setPassword("");
  }

  return (
    <ActionDialog
      closeOnConfirm={false}
      confirmLabel="Confirm and continue"
      description="Enter your current TeamForge password. It is checked securely and is not stored."
      disabled={!password || state.isSigningInAgain}
      icon={<KeyRound className="size-5" aria-hidden="true" />}
      loading={state.isSigningInAgain}
      onConfirm={async () => {
        const confirmed = await state.confirmRecentAuthentication(password);

        if (confirmed) {
          handleOpenChange(false);
        }
      }}
      onOpenChange={handleOpenChange}
      open={open}
      title="Confirm your password"
      tone="info"
      trigger={
        <Button type="button" variant="outline" size="xs">
          Confirm password
        </Button>
      }
    >
      <div className="grid gap-2">
        <label
          className="font-semibold text-ink text-sm"
          htmlFor="account-export-password"
        >
          Password
        </label>
        <Input
          autoComplete="current-password"
          id="account-export-password"
          maxLength={100}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          type="password"
          value={password}
        />
        {state.reauthenticationError ? (
          <p className="text-destructive text-xs" role="alert">
            {state.reauthenticationError}
          </p>
        ) : null}
      </div>
    </ActionDialog>
  );
}

function AccountExportAction({ state }: AccountExportSectionProps) {
  const accountExport = state.accountExport;
  const buttonClassName = "col-span-2 w-full sm:col-auto sm:w-auto";

  if (state.isLoading) {
    return null;
  }

  if (accountExport?.canDownload) {
    return (
      <Button
        type="button"
        variant="primary"
        size="sm"
        className={buttonClassName}
        loading={state.isDownloading}
        disabled={!state.isOnline || state.isDownloading}
        onClick={() => void state.downloadExport()}
      >
        <Download className="size-4" aria-hidden="true" />
        Download data
      </Button>
    );
  }

  if (accountExport?.canRetry) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={buttonClassName}
        loading={state.isRetrying}
        disabled={!state.isOnline || state.isRetrying}
        onClick={() => void state.retryExport()}
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        Try export again
      </Button>
    );
  }

  if (accountExport?.canRequest || (!accountExport && !state.hasLoadError)) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={buttonClassName}
        loading={state.isCreating}
        disabled={!state.isOnline || state.isCreating}
        onClick={() => void state.createExport()}
      >
        <FileArchive className="size-4" aria-hidden="true" />
        Create data export
      </Button>
    );
  }

  return null;
}
