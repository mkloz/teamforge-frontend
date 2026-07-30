import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Activity, ArrowRight } from "lucide-react";
import { adminPilotStatusQueryOptions } from "@/features/admin/api/admin.api";
import { adminPilotOperationsReadinessQueryOptions } from "@/features/admin/api/admin-pilot-operations.api";
import { operatorQueries } from "@/features/operator/public/operator-queries";
import {
  AdminSectionHeader,
  AdminSegmentedBar,
  AdminStatusLabel,
  AdminSummaryMetric,
  AdminSummaryStrip,
  type AdminTone,
} from "@/shared/components/admin/admin-visuals";
import { buildAdminNavigation } from "@/shared/navigation/admin-navigation";

export function AdminOverviewSystem() {
  const workersQuery = useQuery(operatorQueries.workers());
  const readinessQuery = useQuery(adminPilotOperationsReadinessQueryOptions());
  const pilotQuery = useQuery(adminPilotStatusQueryOptions());

  const workers = workersQuery.data?.workers ?? [];
  const healthyWorkers = workers.filter(
    (worker) => worker.state === "HEALTHY",
  ).length;
  const delayedWorkers = workers.filter(
    (worker) => worker.state === "DELAYED",
  ).length;
  const unavailableWorkers = workers.filter(
    (worker) => worker.state === "PAUSED" || worker.state === "UNAVAILABLE",
  ).length;
  const queuedJobs = workers.reduce(
    (sum, worker) => sum + worker.queueDepth,
    0,
  );
  const exhaustedJobs = workers.reduce(
    (sum, worker) => sum + worker.failedJobs + worker.deadJobs,
    0,
  );
  const readiness = readinessQuery.data;
  const activeCohort = pilotQuery.data?.activeCohort;
  const workerStatusTone: AdminTone = workersQuery.isError
    ? "muted"
    : workerTone(delayedWorkers, unavailableWorkers);

  return (
    <section
      aria-labelledby="admin-system-pulse-heading"
      className="grid gap-4"
    >
      <AdminSectionHeader
        id="admin-system-pulse-heading"
        icon={Activity}
        title="System pulse"
        description="Worker health, pilot readiness, and active cohort state in one operational view."
        action={
          <Link
            {...buildAdminNavigation("operations")}
            className="inline-flex min-h-10 items-center gap-2 font-semibold text-primary text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            Open operations
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />

      <AdminSummaryStrip className="2xl:grid-cols-3">
        <AdminSummaryMetric
          label="Pilot readiness"
          value={
            readinessQuery.isError
              ? "Unavailable"
              : readiness?.status === "READY"
                ? "Ready"
                : "Blocked"
          }
          tone={
            readinessQuery.isError
              ? "muted"
              : readiness?.status === "READY"
                ? "success"
                : "danger"
          }
          detail={
            readiness
              ? `${readiness.reasonCodes.length} ${
                  readiness.reasonCodes.length === 1 ? "blocker" : "blockers"
                }`
              : "Checking server state"
          }
        />
        <AdminSummaryMetric
          label="Worker health"
          value={
            workersQuery.isError
              ? "Unavailable"
              : `${healthyWorkers}/${workers.length || "—"}`
          }
          tone={workerTone(delayedWorkers, unavailableWorkers)}
          detail={
            workersQuery.isError
              ? "Owner access may be required"
              : `${queuedJobs} queued · ${exhaustedJobs} exhausted`
          }
        />
        <AdminSummaryMetric
          label="Active cohort"
          value={activeCohort ? activeCohort.code : "None"}
          tone={activeCohort ? "success" : "muted"}
          detail={
            activeCohort
              ? `${activeCohort.memberCount} of ${activeCohort.memberCap} members`
              : "No controlled cohort"
          }
        />
      </AdminSummaryStrip>

      <div className="grid gap-6 rounded-2xl bg-card p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.72fr)]">
        <div className="grid content-start gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-base text-ink">Worker fleet</h3>
            <AdminStatusLabel tone={workerStatusTone}>
              {workersQuery.isError
                ? "Status unavailable"
                : unavailableWorkers > 0
                  ? `${unavailableWorkers} unavailable`
                  : delayedWorkers > 0
                    ? `${delayedWorkers} delayed`
                    : "All reporting healthy"}
            </AdminStatusLabel>
          </div>
          <AdminSegmentedBar
            label="Worker health"
            segments={[
              { label: "Healthy", value: healthyWorkers, tone: "success" },
              { label: "Delayed", value: delayedWorkers, tone: "warning" },
              {
                label: "Unavailable",
                value: unavailableWorkers,
                tone: "danger",
              },
            ]}
          />
        </div>

        <div className="grid content-start gap-3 lg:border-border lg:border-l lg:pl-6">
          <h3 className="font-semibold text-base text-ink">Next decision</h3>
          {readiness?.status === "READY" ? (
            <>
              <AdminStatusLabel tone="success">
                Pilot can proceed
              </AdminStatusLabel>
              <p className="text-pretty text-slate-muted text-sm leading-relaxed">
                Required operational gates and worker checks are currently
                clear.
              </p>
            </>
          ) : readiness ? (
            <>
              <AdminStatusLabel tone="danger">
                {readiness.reasonCodes.length} blocking checks
              </AdminStatusLabel>
              <p className="text-pretty text-slate-muted text-sm leading-relaxed">
                Resolve the highest-impact blocker in Operations before opening
                more pilot activity.
              </p>
            </>
          ) : (
            <p className="text-pretty text-slate-muted text-sm leading-relaxed">
              Readiness is being evaluated from the current server state.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function workerTone(
  delayedWorkers: number,
  unavailableWorkers: number,
): AdminTone {
  if (unavailableWorkers > 0) return "danger";
  if (delayedWorkers > 0) return "warning";
  return "success";
}
