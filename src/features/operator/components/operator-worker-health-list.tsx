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
      <div className="grid min-h-40 place-items-center rounded-2xl border border-border bg-card p-6 text-center">
        <div className="grid gap-1">
          <h2 className="font-bold text-ink text-lg">No workers configured</h2>
          <p className="text-slate-muted text-sm">
            No moderation workers were returned by the moderation API.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="grid gap-3" aria-labelledby="worker-health-heading">
      <h2 id="worker-health-heading" className="font-bold text-ink text-xl">
        Worker health
      </h2>
      <div className="grid gap-3 lg:grid-cols-2">
        {workers.map((worker) => (
          <WorkerCard
            key={worker.kind}
            worker={worker}
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

function WorkerCard({
  commandsEnabled,
  onCommandError,
  onSelect,
  selected,
  worker,
}: {
  commandsEnabled: boolean;
  onCommandError: (error: unknown) => void;
  onSelect: () => void;
  selected: boolean;
  worker: OperatorWorkerStatus;
}) {
  return (
    <article
      className={cn(
        "grid gap-4 rounded-2xl border bg-card p-5",
        selected ? "border-primary/40" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h3 className="font-semibold text-ink">{worker.displayName}</h3>
          <p className="text-slate-muted text-xs">
            {humanizeCode(worker.mode)} mode
          </p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 font-semibold text-slate-muted text-xs">
          {humanizeCode(worker.state)}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <WorkerFact label="Queued" value={String(worker.queueDepth)} />
        <WorkerFact label="Active leases" value={String(worker.activeLeases)} />
        <WorkerFact label="Failed" value={String(worker.failedJobs)} />
        <WorkerFact label="Dead" value={String(worker.deadJobs)} />
        <WorkerFact
          label="Oldest queued"
          value={formatOperatorDate(worker.oldestQueuedAt)}
        />
        <WorkerFact
          label="Last success"
          value={formatOperatorDate(worker.lastSuccessAt)}
        />
        <WorkerFact
          label="Last heartbeat"
          value={formatOperatorDate(worker.lastHeartbeatAt)}
        />
      </dl>

      {worker.pauseReasonCode ? (
        <p className="flex items-start gap-2 rounded-xl bg-accent/12 p-3 text-amber-900 text-xs dark:text-amber-200">
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          Paused since {formatOperatorDate(worker.pausedAt)}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={selected ? "primary" : "outline"}
          size="sm"
          onClick={onSelect}
        >
          Review jobs
        </Button>
        {commandsEnabled && worker.kind === "MODERATION_ASSISTANCE" ? (
          <WorkerStateCommand worker={worker} onCommandError={onCommandError} />
        ) : null}
      </div>
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

function WorkerFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="wrap-break-word text-ink text-sm">{value}</dd>
    </div>
  );
}
