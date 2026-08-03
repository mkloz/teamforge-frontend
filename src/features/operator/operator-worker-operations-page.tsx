import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { HTTPError } from "ky";
import { RefreshCw, ServerCrash, ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLifecycleQueue } from "@/features/admin/public/admin-lifecycle-queue";
import { getOperatorControlErrorKind } from "@/features/operator/api/operator-control-errors";
import {
  OPERATOR_QUERY_KEYS,
  operatorQueries,
} from "@/features/operator/api/operator-queries";
import { OperatorJobList } from "@/features/operator/components/operator-job-list";
import { OperatorReauthenticationDialog } from "@/features/operator/components/operator-reauthentication-dialog";
import {
  OperatorAccessState,
  OperatorLoading,
} from "@/features/operator/components/operator-states";
import { OperatorWorkerHealthList } from "@/features/operator/components/operator-worker-health-list";
import {
  formatOperatorDate,
  humanizeCode,
} from "@/features/operator/lib/operator-language";
import { useOperatorSessionStepUp } from "@/features/operator/public/use-operator-session-step-up";
import {
  AdminSectionHeader,
  AdminSummaryMetric,
  AdminSummaryStrip,
} from "@/shared/components/admin/admin-visuals";
import { Button } from "@/shared/components/ui/button";

export function OperatorWorkerOperationsPage() {
  const queryClient = useQueryClient();
  const { reauthenticationDialogProps, rejectCurrentStepUp, sessionQuery } =
    useOperatorSessionStepUp();
  const canView = Boolean(
    sessionQuery.data?.roles.includes("OWNER_ADMIN") &&
      !sessionQuery.data.breakGlass,
  );
  const workersQuery = useQuery({
    ...operatorQueries.workers(),
    enabled: canView,
  });
  const [selectedKind, setSelectedKind] = useState("");
  const handleCommandError = (error: unknown) => {
    if (getOperatorControlErrorKind(error) === "STALE_SESSION") {
      rejectCurrentStepUp();
    }
  };

  useEffect(
    () => () => {
      queryClient.removeQueries({
        queryKey: OPERATOR_QUERY_KEYS.workers,
      });
    },
    [queryClient],
  );

  useEffect(() => {
    if (!isAccessError(workersQuery.error)) return;
    queryClient.removeQueries({
      queryKey: OPERATOR_QUERY_KEYS.workers,
    });
  }, [queryClient, workersQuery.error]);

  if (sessionQuery.isLoading) return <OperatorLoading />;
  if (sessionQuery.isError || !sessionQuery.data) {
    return (
      <OperatorAccessState
        error={sessionQuery.error}
        onRetry={() => void sessionQuery.refetch()}
      />
    );
  }

  if (!canView) return <OwnerAccessRequired />;

  if (workersQuery.isLoading) return <OperatorLoading />;
  if (workersQuery.isError || !workersQuery.data) {
    if (isForbidden(workersQuery.error)) return <OwnerAccessRequired />;
    return (
      <OperatorAccessState
        error={workersQuery.error}
        onRetry={() => void workersQuery.refetch()}
      />
    );
  }

  const workers = workersQuery.data.workers;
  const activeKind =
    workers.find((worker) => worker.kind === selectedKind)?.kind ??
    workers[0]?.kind;
  const healthyWorkers = workers.filter(
    (worker) => worker.state === "HEALTHY",
  ).length;
  const unavailableWorkers = workers.filter(
    (worker) => worker.state === "PAUSED" || worker.state === "UNAVAILABLE",
  ).length;
  const queuedJobs = workers.reduce(
    (sum, worker) => sum + worker.queueDepth,
    0,
  );
  const activeJobs = workers.reduce(
    (sum, worker) => sum + worker.activeLeases,
    0,
  );
  const exhaustedJobs = workers.reduce(
    (sum, worker) => sum + worker.failedJobs + worker.deadJobs,
    0,
  );
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-6 md:px-8 md:py-10">
      <header className="main-action-grid grid items-end gap-x-6 gap-y-2">
        <div className="grid max-w-3xl gap-2">
          <h1 className="font-extrabold text-3xl text-ink">
            Worker operations
          </h1>
          <p className="text-pretty text-slate-muted text-sm leading-relaxed sm:text-base">
            Monitor queue pressure and worker health, then intervene only when
            processing stalls.
          </p>
        </div>
        <p className="text-slate-muted text-xs sm:justify-self-end">
          Updated {formatOperatorDate(workersQuery.data.generatedAt)}
        </p>
      </header>

      <AdminSummaryStrip>
        <AdminSummaryMetric
          label="Healthy workers"
          value={`${healthyWorkers}/${workers.length}`}
          tone={
            unavailableWorkers > 0
              ? "danger"
              : healthyWorkers === workers.length
                ? "success"
                : "warning"
          }
          detail="Reporting normally"
        />
        <AdminSummaryMetric
          label="Queued"
          value={queuedJobs}
          tone={queuedJobs > 0 ? "warning" : "success"}
          detail="Waiting to be claimed"
        />
        <AdminSummaryMetric
          label="Processing"
          value={activeJobs}
          tone="success"
          detail="Active leases"
        />
        <AdminSummaryMetric
          label="Exhausted"
          value={exhaustedJobs}
          tone={exhaustedJobs > 0 ? "danger" : "success"}
          detail="Failed or dead"
        />
      </AdminSummaryStrip>

      <section
        className="grid gap-4 rounded-2xl bg-card p-5 sm:grid-cols-2 sm:p-6"
        aria-label="Moderation assistance settings"
      >
        <OperationsModeFact
          label="Assistance mode"
          value={humanizeCode(workersQuery.data.assistanceMode)}
          detail={assistanceModeDetail(workersQuery.data.assistanceMode)}
        />
        <OperationsModeFact
          label="Automatic safeguards"
          value={
            workersQuery.data.automaticActionsEnabled ? "Enabled" : "Disabled"
          }
          detail="Read-only control inherited from the active policy."
        />
      </section>

      <OperatorWorkerHealthList
        workers={workers}
        selectedKind={activeKind ?? ""}
        commandsEnabled
        onSelect={setSelectedKind}
        onCommandError={handleCommandError}
      />

      <AdminLifecycleQueue />

      <section className="grid gap-4">
        <AdminSectionHeader
          icon={ServerCrash}
          title="Failure queue"
          description="Inspect exhausted jobs for the selected worker and requeue only after the underlying cause is clear."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void workersQuery.refetch()}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Refresh
            </Button>
          }
        />
        {activeKind ? (
          <OperatorJobList
            key={activeKind}
            workerKind={activeKind}
            commandsEnabled
            onCommandError={handleCommandError}
          />
        ) : null}
      </section>
      <OperatorReauthenticationDialog {...reauthenticationDialogProps} />
    </div>
  );
}

function assistanceModeDetail(mode: "DISABLED" | "SHADOW" | "PAUSED") {
  if (mode === "DISABLED") return "New moderation assessments are disabled.";
  if (mode === "PAUSED") return "New moderation assessment jobs are paused.";
  return "Assessments do not decide cases or apply account actions.";
}

function OperationsModeFact({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-1">
      <h2 className="font-semibold text-slate-muted text-xs">{label}</h2>
      <p className="font-semibold text-ink text-sm">{value}</p>
      <p className="text-slate-muted text-xs leading-relaxed">{detail}</p>
    </div>
  );
}

function OwnerAccessRequired() {
  return (
    <div className="mx-auto grid min-h-[60dvh] w-full max-w-xl place-items-center px-4 py-10 text-center">
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-8">
        <ShieldOff className="mx-auto size-9" aria-hidden="true" />
        <div className="grid gap-2">
          <h1 className="font-bold text-2xl text-ink">Owner access required</h1>
          <p className="text-pretty text-slate-muted text-sm leading-relaxed">
            Worker operations are not available with your current admin access.
          </p>
        </div>
        <Button asChild variant="outline" className="mx-auto">
          <Link to="/admin/moderation" search={{ queue: "CRITICAL_NOW" }}>
            Return to queues
          </Link>
        </Button>
      </div>
    </div>
  );
}

function isAccessError(error: unknown) {
  return (
    error instanceof HTTPError && [401, 403].includes(error.response.status)
  );
}

function isForbidden(error: unknown) {
  return error instanceof HTTPError && error.response.status === 403;
}
