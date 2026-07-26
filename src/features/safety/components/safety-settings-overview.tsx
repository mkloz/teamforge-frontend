import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight, RefreshCw } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { safetyQueries } from "@/features/safety/api/safety-queries";
import {
  ACCOUNT_ACTION_STATE_LABELS,
  formatCategory,
  formatSafetyDate,
  REPORT_STATUS_LABELS,
  RESTRICTION_STATE_LABELS,
} from "@/features/safety/lib/safety-language";
import { Button } from "@/shared/components/ui/button";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import {
  buildAccountActionNavigation,
  buildSafetyReportNavigation,
  buildSafetyRestrictionNavigation,
} from "@/shared/navigation/safety-navigation";
import type {
  Containment,
  EnforcementNotice,
  ReportSummary,
} from "@/shared/schemas/safety";

export function SafetySettingsOverview() {
  const isOnline = useNetworkStatus();

  useEffect(() => {
    const frameId = globalThis.location.hash.startsWith("#safety-")
      ? globalThis.requestAnimationFrame(() => {
          const targetId = globalThis.location.hash.slice(1);
          globalThis.document.getElementById(targetId)?.scrollIntoView();
        })
      : null;

    return () => {
      if (frameId !== null) globalThis.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="grid gap-9">
      {!isOnline ? (
        <OfflineNotice withIcon={false} size="md" className="px-3">
          You’re offline. Safety status updates may be out of date.
        </OfflineNotice>
      ) : null}
      <ReportHistory />
      <AccountActions />
      <SafetyRestrictions />
    </div>
  );
}

function ReportHistory() {
  const query = useQuery(safetyQueries.reports());

  return (
    <SafetyCollection
      id="safety-reports"
      title="Your reports"
      isLoading={query.isLoading}
      error={query.error}
      isEmpty={query.data?.items.length === 0}
      emptyTitle="No reports yet"
      onRetry={() => void query.refetch()}
    >
      {query.data?.items.map((report) => (
        <ReportRow key={report.id} report={report} />
      ))}
    </SafetyCollection>
  );
}

function ReportRow({ report }: { report: ReportSummary }) {
  return (
    <SafetyRow
      title={formatCategory(report.category)}
      status={REPORT_STATUS_LABELS[report.status]}
      description={`Reference ${report.referenceCode}`}
      date={formatSafetyDate(report.submittedAt)}
      link={
        <Link {...buildSafetyReportNavigation(report.id)}>View report</Link>
      }
    />
  );
}

function AccountActions() {
  const query = useQuery(safetyQueries.notices());

  return (
    <SafetyCollection
      id="safety-account-actions"
      title="Account actions"
      isLoading={query.isLoading}
      error={query.error}
      isEmpty={query.data?.items.length === 0}
      emptyTitle="No account actions"
      onRetry={() => void query.refetch()}
    >
      {query.data?.items.map((notice) => (
        <AccountActionRow key={notice.id} notice={notice} />
      ))}
    </SafetyCollection>
  );
}

function AccountActionRow({ notice }: { notice: EnforcementNotice }) {
  return (
    <SafetyRow
      title={notice.title}
      status={ACCOUNT_ACTION_STATE_LABELS[notice.state]}
      description={notice.message}
      date={formatSafetyDate(notice.startsAt)}
      link={
        <Link {...buildAccountActionNavigation(notice.id)}>View notice</Link>
      }
    />
  );
}

function SafetyRestrictions() {
  const query = useQuery(safetyQueries.containments());

  return (
    <SafetyCollection
      id="safety-restrictions"
      title="Safety restrictions"
      isLoading={query.isLoading}
      error={query.error}
      isEmpty={query.data?.items.length === 0}
      emptyTitle="No safety restrictions"
      onRetry={() => void query.refetch()}
    >
      {query.data?.items.map((containment) => (
        <RestrictionRow key={containment.id} containment={containment} />
      ))}
    </SafetyCollection>
  );
}

function RestrictionRow({ containment }: { containment: Containment }) {
  return (
    <SafetyRow
      title={containment.title}
      status={RESTRICTION_STATE_LABELS[containment.state]}
      description={containment.message}
      date={formatSafetyDate(containment.startedAt)}
      link={
        <Link {...buildSafetyRestrictionNavigation(containment.id)}>
          View restriction
        </Link>
      }
    />
  );
}

function SafetyCollection({
  children,
  emptyTitle,
  error,
  id,
  isEmpty,
  isLoading,
  onRetry,
  title,
}: {
  children: ReactNode;
  emptyTitle: string;
  error: Error | null;
  id: string;
  isEmpty: boolean;
  isLoading: boolean;
  onRetry: () => void;
  title: string;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="max-w-2xl">
        <h2 className="font-bold text-ink text-xl">{title}</h2>
      </div>

      <div className="mt-5 border-border border-t" aria-live="polite">
        <SafetyCollectionState
          emptyTitle={emptyTitle}
          error={error}
          isEmpty={isEmpty}
          isLoading={isLoading}
          onRetry={onRetry}
        >
          {children}
        </SafetyCollectionState>
      </div>
    </section>
  );
}

function SafetyCollectionState({
  children,
  emptyTitle,
  error,
  isEmpty,
  isLoading,
  onRetry,
}: {
  children: ReactNode;
  emptyTitle: string;
  error: Error | null;
  isEmpty: boolean;
  isLoading: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return <SafetyRowsLoading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-ink text-sm">
          Safety information could not load.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="py-6">
        <p className="font-semibold text-ink text-sm">{emptyTitle}</p>
      </div>
    );
  }

  return children;
}

function SafetyRowsLoading() {
  return (
    <div aria-busy="true">
      <output className="sr-only">Loading safety information</output>
      {["first", "second"].map((item) => (
        <div
          key={item}
          className="flex items-center gap-4 border-border border-b py-5 last:border-b-0"
        >
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-3 w-full max-w-sm" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function SafetyRow({
  date,
  description,
  link,
  status,
  title,
}: {
  date: string | null;
  description: string;
  link: ReactNode;
  status: string;
  title: string;
}) {
  return (
    <article className="sm:main-action-grid grid gap-3 border-border border-b py-4 last:border-b-0 sm:items-center sm:gap-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-base text-ink">{title}</h3>
          <StatusPill tone="teal" surface="soft" size="xs">
            {status}
          </StatusPill>
        </div>
        <p className="mt-1 line-clamp-2 text-slate-muted text-sm leading-relaxed">
          {description}
        </p>
        {date ? <p className="mt-1 text-slate-muted text-xs">{date}</p> : null}
      </div>
      <div className="inline-flex items-center gap-1 font-semibold text-primary text-sm [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-primary/30 [&_a]:rounded-md [&_a]:outline-none">
        {link}
        <ChevronRight className="size-4" aria-hidden="true" />
      </div>
    </article>
  );
}
