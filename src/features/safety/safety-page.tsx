import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import { FileWarning, Scale, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { safetyQueries } from "@/features/safety/api/safety-queries";
import {
  ACCOUNT_ACTION_STATE_LABELS,
  formatCategory,
  formatSafetyDate,
  REPORT_STATUS_LABELS,
  RESTRICTION_STATE_LABELS,
} from "@/features/safety/lib/safety-language";
import { SafetyPageLoading } from "@/features/safety/safety-page.loading";
import { PageErrorState } from "@/shared/components/page-error-state";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";
import { cn } from "@/shared/lib/utils";
import {
  buildAccountActionNavigation,
  buildSafetyNavigation,
  buildSafetyReportNavigation,
  buildSafetyRestrictionNavigation,
  type SafetySection,
} from "@/shared/navigation/safety-navigation";
import type {
  Containment,
  EnforcementNotice,
  ReportSummary,
} from "@/shared/schemas/safety";

const SAFETY_SECTIONS: Array<{
  id: SafetySection;
  label: string;
  description: string;
  icon: typeof FileWarning;
}> = [
  {
    id: "reports",
    label: "Your reports",
    description: "Reports you sent to TeamForge",
    icon: FileWarning,
  },
  {
    id: "account-actions",
    label: "Account actions",
    description: "Notices and appeal status",
    icon: Scale,
  },
  {
    id: "restrictions",
    label: "Safety restrictions",
    description: "Temporary restrictions and review requests",
    icon: ShieldCheck,
  },
];

export function SafetyPage() {
  const search = useSearch({ from: "/app-shell/safety" });
  const activeSection = search.section ?? "reports";

  usePageMetadata(
    createTeamForgePageMetadata({
      title: "Safety Center",
      description:
        "See reports you sent, account actions, and temporary safety restrictions.",
    }),
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="grid gap-2">
        <h1 className="text-balance font-extrabold text-3xl text-ink">
          Safety Center
        </h1>
        <p className="max-w-2xl text-pretty text-slate-muted leading-relaxed">
          See reports you sent, account actions, and temporary safety
          restrictions.
        </p>
      </header>

      <nav
        aria-label="Safety Center sections"
        className="grid gap-2 md:grid-cols-3"
      >
        {SAFETY_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <Link
              key={section.id}
              {...buildSafetyNavigation(section.id)}
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                isActive
                  ? "border-primary/40 bg-primary/8 text-ink"
                  : "border-border bg-card text-slate-muted hover:border-primary/25 hover:text-ink",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className="size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block font-semibold text-sm">
                  {section.label}
                </span>
                <span className="block text-xs">{section.description}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      {activeSection === "reports" ? <ReportHistory /> : null}
      {activeSection === "account-actions" ? <AccountActions /> : null}
      {activeSection === "restrictions" ? <SafetyRestrictions /> : null}
    </div>
  );
}

function ReportHistory() {
  const query = useQuery(safetyQueries.reports());
  return (
    <SafetyListState
      isLoading={query.isLoading}
      error={query.error}
      isEmpty={query.data?.items.length === 0}
      emptyTitle="No reports yet"
      emptyDescription="Reports you send will appear here."
      onRetry={() => void query.refetch()}
    >
      {query.data?.items.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </SafetyListState>
  );
}

function ReportCard({ report }: { report: ReportSummary }) {
  return (
    <SafetyListCard
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
    <SafetyListState
      isLoading={query.isLoading}
      error={query.error}
      isEmpty={query.data?.items.length === 0}
      emptyTitle="No account actions"
      emptyDescription="There are no account actions to review."
      onRetry={() => void query.refetch()}
    >
      {query.data?.items.map((notice) => (
        <AccountActionCard key={notice.id} notice={notice} />
      ))}
    </SafetyListState>
  );
}

function AccountActionCard({ notice }: { notice: EnforcementNotice }) {
  return (
    <SafetyListCard
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
    <SafetyListState
      isLoading={query.isLoading}
      error={query.error}
      isEmpty={query.data?.items.length === 0}
      emptyTitle="No safety restrictions"
      emptyDescription="There are no current or past restrictions to review."
      onRetry={() => void query.refetch()}
    >
      {query.data?.items.map((containment) => (
        <RestrictionCard key={containment.id} containment={containment} />
      ))}
    </SafetyListState>
  );
}

function RestrictionCard({ containment }: { containment: Containment }) {
  return (
    <SafetyListCard
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

function SafetyListState({
  children,
  emptyDescription,
  emptyTitle,
  error,
  isEmpty,
  isLoading,
  onRetry,
}: {
  children: ReactNode;
  emptyDescription: string;
  emptyTitle: string;
  error: Error | null;
  isEmpty: boolean;
  isLoading: boolean;
  onRetry: () => void;
}) {
  const isOnline = useNetworkStatus();

  if (isLoading) return <SafetyPageLoading />;
  if (error) {
    return (
      <PageErrorState
        title="Safety Center could not load"
        description={
          isOnline
            ? "Your safety information did not load."
            : "You’re offline. Reconnect to load your Safety Center."
        }
        onRetry={onRetry}
      />
    );
  }

  return (
    <section className="grid gap-3" aria-live="polite">
      {!isOnline ? (
        <OfflineNotice>
          You’re offline. Status updates may be out of date.
        </OfflineNotice>
      ) : null}
      {isEmpty ? (
        <div className="grid min-h-48 place-items-center rounded-2xl border border-border bg-card p-6 text-center">
          <div className="grid max-w-sm gap-2">
            <h2 className="font-bold text-ink text-xl">{emptyTitle}</h2>
            <p className="text-slate-muted text-sm leading-relaxed">
              {emptyDescription}
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function SafetyListCard({
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
    <article className="sm:main-action-grid grid gap-3 rounded-2xl border border-border bg-card p-5 sm:items-center sm:gap-6">
      <div className="grid min-w-0 gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-ink text-lg">{title}</h2>
          <span className="rounded-full bg-primary/9 px-2.5 py-1 font-semibold text-primary text-xs">
            {status}
          </span>
        </div>
        <p className="line-clamp-2 text-slate-muted text-sm leading-relaxed">
          {description}
        </p>
        {date ? <p className="text-slate-muted text-xs">{date}</p> : null}
      </div>
      <div className="font-semibold text-primary text-sm underline decoration-primary/30 underline-offset-4">
        {link}
      </div>
    </article>
  );
}
