import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Gauge,
  RefreshCw,
  ShieldAlert,
  UserRoundCheck,
} from "lucide-react";
import { operatorQueries } from "@/features/operator/public/operator-queries";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { buildAdminNavigation } from "@/shared/navigation/admin-navigation";

export function AdminOverviewQueues() {
  const criticalNowQuery = useQuery(
    operatorQueries.cases({ queue: "CRITICAL_NOW", page: 1, limit: 1 }),
  );
  const appealsQuery = useQuery(
    operatorQueries.cases({ queue: "APPEALS", page: 1, limit: 1 }),
  );

  return (
    <div className="grid gap-8">
      <section
        aria-labelledby="admin-review-queues-heading"
        className="grid gap-4"
      >
        <header className="grid gap-1">
          <h2
            id="admin-review-queues-heading"
            className="font-semibold text-ink text-xl"
          >
            Review queues
          </h2>
          <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
            Current totals returned by the critical and appeal queues. Each
            queue links to the cases behind its total.
          </p>
        </header>

        <div className="divide-y divide-border border-border border-y">
          <QueueSummary
            description="Immediate safety risk or overdue urgent work."
            icon={ShieldAlert}
            label="Critical now"
            queue="CRITICAL_NOW"
            total={criticalNowQuery.data?.total}
            isPending={criticalNowQuery.isPending}
            isError={criticalNowQuery.isError}
            isFetching={criticalNowQuery.isFetching}
            onRetry={() => void criticalNowQuery.refetch()}
          />
          <QueueSummary
            description="Account action appeals awaiting review."
            icon={UserRoundCheck}
            label="Appeals"
            queue="APPEALS"
            total={appealsQuery.data?.total}
            isPending={appealsQuery.isPending}
            isError={appealsQuery.isError}
            isFetching={appealsQuery.isFetching}
            onRetry={() => void appealsQuery.refetch()}
          />
        </div>
      </section>

      <section
        aria-labelledby="admin-system-status-heading"
        className="grid gap-4 border-border border-t pt-6"
      >
        <header className="grid gap-1">
          <h2
            id="admin-system-status-heading"
            className="font-semibold text-ink text-xl"
          >
            System status
          </h2>
          <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
            Review rollout readiness, worker safeguards, and recorded pilot
            outcomes in Operations.
          </p>
        </header>

        <nav aria-label="Admin operations shortcuts" className="grid">
          <OperationsLink
            description="Review pilot readiness and server-owned outcomes."
            icon={Gauge}
            label="Open Operations"
          />
        </nav>
      </section>
    </div>
  );
}

function QueueSummary({
  description,
  icon: Icon,
  isError,
  isFetching,
  isPending,
  label,
  onRetry,
  queue,
  total,
}: {
  description: string;
  icon: LucideIcon;
  isError: boolean;
  isFetching: boolean;
  isPending: boolean;
  label: string;
  onRetry: () => void;
  queue: "APPEALS" | "CRITICAL_NOW";
  total: number | undefined;
}) {
  return (
    <article className="sm:main-action-grid grid gap-4 py-4 sm:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="grid min-w-0 gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-semibold text-base text-ink">{label}</h3>
            <QueueTotal
              isError={isError}
              isFetching={isFetching}
              isPending={isPending}
              onRetry={onRetry}
              total={total}
            />
          </div>
          <p className="text-pretty text-slate-muted text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <Link
        {...buildAdminNavigation("moderation")}
        search={{ queue }}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl font-semibold text-primary text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:justify-self-end"
      >
        Open queue
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

function QueueTotal({
  isError,
  isFetching,
  isPending,
  onRetry,
  total,
}: {
  isError: boolean;
  isFetching: boolean;
  isPending: boolean;
  onRetry: () => void;
  total: number | undefined;
}) {
  if (total !== undefined) {
    return (
      <span className="font-semibold text-slate-muted text-sm">
        {total} {total === 1 ? "case" : "cases"}
      </span>
    );
  }

  if (isPending) {
    return (
      <span role="status" aria-label="Loading queue total">
        <Skeleton className="h-4 w-16" />
      </span>
    );
  }

  if (isError) {
    return (
      <span className="flex flex-wrap items-center gap-1">
        <span className="text-slate-muted text-xs">Total unavailable</span>
        <Button
          type="button"
          variant="link"
          size="xs"
          loading={isFetching}
          onClick={onRetry}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Try again
        </Button>
      </span>
    );
  }

  return null;
}

function OperationsLink({
  description,
  icon: Icon,
  label,
}: {
  description: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      {...buildAdminNavigation("operations")}
      className="group flex items-start gap-3 border-border border-b py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
    >
      <Icon
        className="mt-0.5 size-5 shrink-0 text-primary"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className="grid min-w-0 flex-1 gap-1">
        <span className="flex items-center justify-between gap-3 font-semibold text-ink text-sm">
          {label}
          <ArrowRight
            className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
        <span className="text-pretty text-slate-muted text-xs leading-relaxed">
          {description}
        </span>
      </span>
    </Link>
  );
}
