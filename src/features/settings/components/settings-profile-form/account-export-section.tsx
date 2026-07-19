import { Download, FileArchive, RefreshCw } from "lucide-react";
import { SectionHeading } from "@/features/settings/components/settings-profile-form/preference-section-parts";
import type { useAccountExport } from "@/features/settings/hooks/use-account-export";
import {
  ACCOUNT_DATA_COPY,
  getExportStatusCopy,
} from "@/features/settings/lib/account-data-copy";
import { Button } from "@/shared/components/ui/button";
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
  const isPreparing =
    accountExport?.state === "QUEUED" || accountExport?.state === "PROCESSING";

  return (
    <section className="border-border border-t pt-7">
      <SectionHeading
        title="Download your data"
        description="Create a private copy of your TeamForge account data. Passwords, sessions, and other people's private details are not included."
      />

      <div className="mt-5 flex max-w-2xl flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="max-w-xl text-slate-muted text-sm leading-relaxed">
            {state.isLoading
              ? "Checking your latest export…"
              : getExportStatusCopy(accountExport)}
          </p>
          {accountExport ? (
            <StatusPill
              tone={accountExport.state === "READY" ? "teal" : "neutral"}
              size="sm"
            >
              {EXPORT_STATE_LABELS[accountExport.state]}
            </StatusPill>
          ) : null}
        </div>

        {state.requiresRecentAuth ? (
          <Notice
            tone="info"
            size="md"
            action={
              <Button
                type="button"
                variant="outline"
                size="xs"
                loading={state.isSigningInAgain}
                onClick={() => void state.signInAgain()}
              >
                Sign in again
              </Button>
            }
          >
            <p className="font-semibold">
              {ACCOUNT_DATA_COPY.export.recentAuthTitle}
            </p>
            <p>{ACCOUNT_DATA_COPY.export.recentAuthDescription}</p>
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

        <div>
          {accountExport?.canDownload ? (
            <Button
              type="button"
              variant="primary"
              size="compact"
              loading={state.isDownloading}
              disabled={!state.isOnline || state.isDownloading}
              onClick={() => void state.downloadExport()}
            >
              <Download className="size-4" aria-hidden="true" />
              Download data
            </Button>
          ) : accountExport?.canRetry ? (
            <Button
              type="button"
              variant="outline"
              size="compact"
              loading={state.isRetrying}
              disabled={!state.isOnline || state.isRetrying}
              onClick={() => void state.retryExport()}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Try export again
            </Button>
          ) : accountExport?.canRequest ||
            (!accountExport && !state.hasLoadError) ? (
            <Button
              type="button"
              variant="outline"
              size="compact"
              loading={state.isCreating}
              disabled={!state.isOnline || state.isCreating || state.isLoading}
              onClick={() => void state.createExport()}
            >
              <FileArchive className="size-4" aria-hidden="true" />
              Create data export
            </Button>
          ) : isPreparing ? (
            <Button type="button" variant="outline" size="compact" disabled>
              <FileArchive className="size-4" aria-hidden="true" />
              Preparing export
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
