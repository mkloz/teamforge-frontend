import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pause, Play, TriangleAlert } from "lucide-react";
import { useRef, useState } from "react";
import { OperatorApi } from "@/features/operator/api/operator.api";
import { OPERATOR_QUERY_KEYS } from "@/features/operator/api/operator-queries";
import {
  formatOperatorDate,
  humanizeCode,
} from "@/features/operator/lib/operator-language";
import type {
  OperatorWorkerKind,
  OperatorWorkerStatus,
} from "@/features/operator/schemas/operator.schemas";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export function OperatorWorkerHealthList({
  commandsEnabled,
  onCommandError,
  onSelect,
  selectedKind,
  workers,
}: {
  commandsEnabled: boolean;
  onCommandError: (error: unknown) => void;
  onSelect: (kind: OperatorWorkerKind) => void;
  selectedKind: string;
  workers: OperatorWorkerStatus[];
}) {
  if (!workers.length) {
    return (
      <div className="grid min-h-40 place-items-center rounded-xl border border-border border-dashed p-6 text-center">
        <div className="grid max-w-md gap-1">
          <h2 className="font-semibold text-base text-ink">
            No workers configured
          </h2>
          <p className="text-slate-muted text-sm">
            No moderation workers were returned by the moderation API.
          </p>
        </div>
      </div>
    );
  }

  const totalQueued = workers.reduce(
    (sum, worker) => sum + worker.queueDepth,
    0,
  );
  const totalFailures = workers.reduce(
    (sum, worker) => sum + worker.failedJobs + worker.deadJobs,
    0,
  );
  const maxWorkload = Math.max(
    1,
    ...workers.map((worker) => worker.queueDepth + worker.activeLeases),
  );

  return (
    <section className="grid gap-4" aria-labelledby="worker-health-heading">
      <header className="sm:main-action-grid grid items-end gap-3">
        <div className="grid gap-1">
          <h2
            id="worker-health-heading"
            className="font-semibold text-ink text-xl"
          >
            Worker health
          </h2>
          <p className="text-slate-muted text-sm">
            Compare current load, failures, and heartbeat recency.
          </p>
        </div>
        <p className="font-medium text-slate-muted text-sm">
          {totalQueued} queued · {totalFailures} failed or dead
        </p>
      </header>

      <div className="grouped-surface grid overflow-hidden rounded-2xl [&>*]:bg-card">
        {workers.map((worker) => (
          <WorkerRow
            key={worker.kind}
            worker={worker}
            maxWorkload={maxWorkload}
            selected={worker.kind === selectedKind}
            commandsEnabled={commandsEnabled}
            onCommandError={onCommandError}
            onSelect={() => onSelect(worker.kind)}
          />
        ))}
      </div>
    </section>
  );
}

function WorkerRow({
  commandsEnabled,
  maxWorkload,
  onCommandError,
  onSelect,
  selected,
  worker,
}: {
  commandsEnabled: boolean;
  maxWorkload: number;
  onCommandError: (error: unknown) => void;
  onSelect: () => void;
  selected: boolean;
  worker: OperatorWorkerStatus;
}) {
  const queuedWidth = (worker.queueDepth / maxWorkload) * 100;
  const activeWidth = (worker.activeLeases / maxWorkload) * 100;
  const failureCount = worker.failedJobs + worker.deadJobs;

  return (
    <article
      className={cn(
        "relative grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-2 lg:items-center 2xl:grid-cols-[minmax(13rem,0.9fr)_minmax(12rem,0.85fr)_minmax(16rem,1fr)_auto]",
        selected &&
          "bg-primary/[0.035] before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary",
      )}
    >
      <div className="grid min-w-0 gap-1">
        <h3 className="truncate font-semibold text-ink">
          {worker.displayName}
        </h3>
        <p className="flex items-center gap-2 text-slate-muted text-xs">
          <span
            className={cn(
              "size-1.5 rounded-full",
              worker.state === "HEALTHY"
                ? "bg-primary"
                : worker.state === "DELAYED"
                  ? "bg-accent"
                  : "bg-danger",
            )}
            aria-hidden="true"
          />
          {humanizeCode(worker.state)}
          <span aria-hidden="true">·</span>
          {humanizeCode(worker.mode)} mode
        </p>
        {worker.pauseReasonCode ? (
          <p className="flex items-center gap-1.5 font-medium text-accent text-xs [&_svg]:text-current">
            <TriangleAlert className="size-3.5" aria-hidden="true" />
            Paused {formatOperatorDate(worker.pausedAt)}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-semibold text-slate-muted text-xs">Workload</p>
          <p className="text-ink text-xs">
            {worker.queueDepth} queued · {worker.activeLeases} processing
          </p>
        </div>
        <span
          className="flex h-1.5 overflow-hidden rounded-full bg-muted/80"
          aria-label={`${worker.queueDepth} queued and ${worker.activeLeases} active`}
          role="img"
        >
          <span
            className="h-full bg-accent"
            style={{ width: `${queuedWidth}%` }}
          />
          <span
            className="h-full bg-primary"
            style={{ width: `${activeWidth}%` }}
          />
        </span>
        <p className="text-slate-muted text-xs">
          Oldest {formatOperatorDate(worker.oldestQueuedAt)}
        </p>
      </div>

      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-5">
          <WorkerFact
            label="Failed"
            value={String(worker.failedJobs)}
            danger={worker.failedJobs > 0}
          />
          <WorkerFact
            label="Dead"
            value={String(worker.deadJobs)}
            danger={worker.deadJobs > 0}
          />
        </div>
        <WorkerHeartbeat
          heartbeatAt={worker.lastHeartbeatAt}
          successAt={worker.lastSuccessAt}
        />
      </div>

      <div className="flex flex-wrap gap-2 2xl:justify-end">
        <Button
          type="button"
          variant={selected ? "primary" : "outline"}
          size="sm"
          onClick={onSelect}
          aria-controls="operator-worker-jobs"
          aria-label={`Review jobs for ${worker.displayName}`}
          aria-pressed={selected}
        >
          Review jobs
        </Button>
        {commandsEnabled && worker.kind === "MODERATION_ASSISTANCE" ? (
          <WorkerStateCommand worker={worker} onCommandError={onCommandError} />
        ) : null}
      </div>
      {failureCount > 0 ? (
        <span className="sr-only">
          {failureCount} failed or dead jobs need attention
        </span>
      ) : null}
    </article>
  );
}

function WorkerStateCommand({
  onCommandError,
  worker,
}: {
  onCommandError: (error: unknown) => void;
  worker: OperatorWorkerStatus;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const action = worker.state === "PAUSED" ? "resume" : "pause";
  const commandRef = useRef<{
    action: "pause" | "resume";
    key: string;
    version: number;
  } | null>(null);
  const mutation = useMutation({
    mutationKey: [
      "admin",
      "operator",
      "moderation",
      "worker-command",
      worker.kind,
    ],
    mutationFn: () => {
      if (
        commandRef.current?.action !== action ||
        commandRef.current.version !== worker.version
      ) {
        commandRef.current = {
          action,
          key: crypto.randomUUID(),
          version: worker.version,
        };
      }
      const input = {
        idempotencyKey: commandRef.current.key,
        expectedVersion: worker.version,
        reasonCode:
          action === "pause" ? "OWNER_WORKER_PAUSE" : "OWNER_WORKER_RESUME",
      };
      return action === "pause"
        ? OperatorApi.pauseWorker(worker.kind, input)
        : OperatorApi.resumeWorker(worker.kind, input);
    },
    onError: onCommandError,
    onSuccess: () => {
      setOpen(false);
      commandRef.current = null;
      void queryClient.invalidateQueries({
        queryKey: OPERATOR_QUERY_KEYS.workers,
      });
    },
  });

  const resuming = action === "resume";
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          {resuming ? (
            <Play className="size-4" aria-hidden="true" />
          ) : (
            <Pause className="size-4" aria-hidden="true" />
          )}
          {resuming ? "Resume worker" : "Pause new work"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {resuming ? "Resume this worker?" : "Pause new work?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {resuming
              ? `New jobs may be claimed by ${worker.displayName} after this change.`
              : `This stops ${worker.displayName} from claiming new jobs. Reports remain available for human review.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {mutation.isError ? (
          <p className="text-destructive text-sm" role="alert">
            The worker status was not changed. Refresh the page and check your
            owner access before trying again.
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            disabled={mutation.isPending}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {resuming ? "Resume worker" : "Pause new work"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function WorkerFact({
  danger = false,
  label,
  value,
}: {
  danger?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-0.5">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd
        className={cn(
          "wrap-break-word font-semibold text-sm tabular-nums",
          danger ? "text-danger" : "text-ink",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function WorkerHeartbeat({
  heartbeatAt,
  successAt,
}: {
  heartbeatAt: string | null;
  successAt: string | null;
}) {
  const heartbeatAge = heartbeatAt
    ? Math.max(0, Date.now() - new Date(heartbeatAt).getTime())
    : Number.POSITIVE_INFINITY;
  const healthy = heartbeatAge <= 5 * 60_000;
  const delayed = heartbeatAge > 5 * 60_000 && heartbeatAge <= 30 * 60_000;
  const activeSegments = healthy ? 4 : delayed ? 2 : heartbeatAt ? 1 : 0;

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-slate-muted text-xs">Heartbeat</p>
        <p
          className={cn(
            "truncate text-xs",
            healthy
              ? "text-foreground"
              : delayed
                ? "text-accent"
                : "text-danger",
          )}
        >
          {formatOperatorDate(heartbeatAt)}
        </p>
      </div>
      <span
        className="grid grid-cols-4 gap-1"
        aria-label={`Last heartbeat ${formatOperatorDate(heartbeatAt)}`}
        role="img"
      >
        {[0, 1, 2, 3].map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-1.5 rounded-full",
              segment < activeSegments
                ? healthy
                  ? "bg-primary"
                  : delayed
                    ? "bg-accent"
                    : "bg-danger"
                : "bg-muted",
            )}
          />
        ))}
      </span>
      <p className="truncate text-slate-muted text-xs">
        Last success {formatOperatorDate(successAt)}
      </p>
    </div>
  );
}
