import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { HTTPError } from "ky";
import { ArrowLeft, RefreshCw, ShieldOff, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { getOperatorControlErrorKind } from "@/features/operator/api/operator-control-errors";
import {
  OPERATOR_QUERY_KEYS,
  operatorQueries,
} from "@/features/operator/api/operator-queries";
import { OperatorJobList } from "@/features/operator/components/operator-job-list";
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
import { Button } from "@/shared/components/ui/button";

export function OperatorWorkerOperationsPage() {
  const queryClient = useQueryClient();
  const {
    hasCurrentStepUp: commandsEnabled,
    isSigningInAgain,
    rejectCurrentStepUp,
    sessionQuery,
    signInAgain,
    signInAgainError,
  } = useOperatorSessionStepUp();
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
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-8 md:py-10">
      <Button asChild variant="ghost" className="w-fit px-2">
        <Link to="/admin/moderation" search={{ queue: "CRITICAL_NOW" }}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to queues
        </Link>
      </Button>

      <header className="grid gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-extrabold text-2xl text-ink">
            Worker operations
          </h1>
          <p className="text-slate-muted text-xs">
            Updated {formatOperatorDate(workersQuery.data.generatedAt)}
          </p>
        </div>
        <p className="max-w-3xl text-slate-muted text-sm leading-relaxed">
          Review queue health, pause new work, and requeue failed jobs. These
          controls do not decide a case or apply an account action.
        </p>
      </header>

      <section
        className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2"
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
          detail="This setting is read-only in the admin workspace."
        />
      </section>

      {!commandsEnabled ? (
        <div className="flex items-start gap-3 rounded-2xl border border-accent/25 bg-accent/10 p-4 text-amber-900 dark:text-amber-200">
          <TriangleAlert
            className="mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />
          <div className="grid gap-1">
            <h2 className="font-semibold text-sm">Recent sign-in required</h2>
            <p className="text-sm leading-relaxed">
              Worker status is visible, but pause, resume, and requeue commands
              require a recently verified admin session. Sign out and sign in
              again to continue; you will return to this page afterward.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-fit"
              disabled={isSigningInAgain}
              loading={isSigningInAgain}
              onClick={() => void signInAgain()}
            >
              Sign in again
            </Button>
            {signInAgainError ? (
              <p className="mt-2 text-destructive text-sm" role="alert">
                Sign-out could not be completed. Try again.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <OperatorWorkerHealthList
        workers={workers}
        selectedKind={activeKind ?? ""}
        commandsEnabled={commandsEnabled}
        onSelect={setSelectedKind}
        onCommandError={handleCommandError}
      />

      {activeKind ? (
        <OperatorJobList
          key={activeKind}
          workerKind={activeKind}
          commandsEnabled={commandsEnabled}
          onCommandError={handleCommandError}
        />
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={() => void workersQuery.refetch()}
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        Refresh worker status
      </Button>
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
        <ShieldOff className="mx-auto size-9 text-primary" aria-hidden="true" />
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
