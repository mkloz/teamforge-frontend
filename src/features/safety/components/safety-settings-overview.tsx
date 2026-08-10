import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Flag,
  Gavel,
  type LucideIcon,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
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
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  StatusPill,
  type StatusPillTone,
} from "@/shared/components/ui/status-pill";
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
    <div className="grid gap-5">
      {!isOnline ? (
        <OfflineNotice withIcon={false} size="md" className="px-3">
          You’re offline. Safety status updates may be out of date.
        </OfflineNotice>
      ) : null}

      <section>
        <div className="px-1">
          <h2 className="font-bold text-ink text-xl">Safety activity</h2>
          <p className="mt-1 max-w-2xl text-slate-muted text-sm leading-relaxed">
            Track reports you sent and any safety decisions affecting your
            account.
          </p>
        </div>

        <GroupedMenuList aria-label="Safety activity" className="mt-5">
          <ReportHistory />
          <AccountActions />
          <SafetyRestrictions />
        </GroupedMenuList>
      </section>
    </div>
  );
}

function ReportHistory() {
  const query = useQuery(safetyQueries.reports());
  const items = query.data?.items ?? [];

  return (
    <SafetyCollection
      description="Reports you send to Findafew appear here."
      error={query.error}
      icon={Flag}
      id="safety-reports"
      isLoading={query.isLoading}
      itemCount={items.length}
      onRetry={() => void query.refetch()}
      title="Your reports"
    >
      {items.map((report) => (
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
  const items = query.data?.items ?? [];

  return (
    <SafetyCollection
      activityTone="amber"
      description="Warnings or moderation decisions affecting your account."
      error={query.error}
      icon={Gavel}
      id="safety-account-actions"
      isLoading={query.isLoading}
      itemCount={items.length}
      onRetry={() => void query.refetch()}
      title="Account actions"
    >
      {items.map((notice) => (
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
  const items = query.data?.items ?? [];

  return (
    <SafetyCollection
      activityTone="amber"
      description="Temporary limits used to protect people and groups."
      error={query.error}
      icon={ShieldAlert}
      id="safety-restrictions"
      isLoading={query.isLoading}
      itemCount={items.length}
      onRetry={() => void query.refetch()}
      title="Safety restrictions"
    >
      {items.map((containment) => (
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
  activityTone = "neutral",
  children,
  description,
  error,
  icon,
  id,
  isLoading,
  itemCount,
  onRetry,
  title,
}: {
  activityTone?: StatusPillTone;
  children: ReactNode;
  description: string;
  error: Error | null;
  icon: LucideIcon;
  id: string;
  isLoading: boolean;
  itemCount: number;
  onRetry: () => void;
  title: string;
}) {
  return (
    <>
      <GroupedMenuItem id={id} className="scroll-mt-6">
        <div className="flex min-h-16 flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap sm:px-5">
          <IconTile
            icon={icon}
            shape="circle"
            size="lg"
            tone={itemCount > 0 ? "teal" : "neutral"}
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink text-sm">{title}</p>
            <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
              {error ? "This safety information could not load." : description}
            </p>
          </div>
          <SafetyCollectionStatus
            activityTone={activityTone}
            error={error}
            isLoading={isLoading}
            itemCount={itemCount}
            onRetry={onRetry}
          />
        </div>
      </GroupedMenuItem>

      {isLoading ? <SafetyRowLoading /> : null}
      {!isLoading && !error ? children : null}
    </>
  );
}

function SafetyCollectionStatus({
  activityTone,
  error,
  isLoading,
  itemCount,
  onRetry,
}: {
  activityTone: StatusPillTone;
  error: Error | null;
  isLoading: boolean;
  itemCount: number;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <Button type="button" variant="ghost" size="xs" onClick={onRetry}>
        <RefreshCw className="size-3.5" aria-hidden="true" />
        Retry
      </Button>
    );
  }

  if (isLoading) {
    return <Skeleton shape="pill" className="h-5 w-16 shrink-0" />;
  }

  if (itemCount === 0) {
    return (
      <StatusPill size="xs" surface="soft" tone="teal">
        Clear
      </StatusPill>
    );
  }

  return (
    <StatusPill size="xs" surface="soft" tone={activityTone} numeric>
      {itemCount}
    </StatusPill>
  );
}

function SafetyRowLoading() {
  return (
    <GroupedMenuItem className="bg-background/55">
      <div className="flex min-h-16 items-center gap-3 px-3 py-3 sm:px-5">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-full max-w-sm" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </GroupedMenuItem>
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
    <GroupedMenuItem className="bg-background/55 transition-colors hover:bg-foreground/5">
      <article className="sm:main-action-grid grid min-h-16 gap-3 px-3 py-3 sm:items-center sm:gap-6 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink text-sm">{title}</h3>
            <StatusPill tone="teal" surface="soft" size="xs">
              {status}
            </StatusPill>
          </div>
          <p className="mt-1 line-clamp-2 text-slate-muted text-xs leading-relaxed">
            {description}
          </p>
          {date ? (
            <p className="mt-1 text-slate-muted text-xs">{date}</p>
          ) : null}
        </div>
        <div className="inline-flex items-center gap-1 font-semibold text-foreground text-sm [&_a:focus-visible]:ring-1 [&_a:focus-visible]:ring-foreground [&_a:focus-visible]:ring-offset-2 [&_a:focus-visible]:ring-offset-background [&_a]:rounded-md [&_a]:outline-none">
          {link}
          <ChevronRight className="size-4" aria-hidden="true" />
        </div>
      </article>
    </GroupedMenuItem>
  );
}
