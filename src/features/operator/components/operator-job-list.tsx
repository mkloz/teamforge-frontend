import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { RefreshCw, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OperatorApi } from "@/features/operator/api/operator.api";
import {
  OPERATOR_QUERY_KEYS,
  operatorQueries,
} from "@/features/operator/api/operator-queries";
import {
  formatOperatorDate,
  humanizeCode,
} from "@/features/operator/lib/operator-language";
import type {
  OperatorWorkerJob,
  OperatorWorkerJobStatus,
  OperatorWorkerKind,
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
import { Skeleton } from "@/shared/components/ui/skeleton";

const JOB_FILTERS = ["DEAD", "FAILED"] as const;
const PAGE_SIZE = 25;

export function OperatorJobList({
  commandsEnabled,
  workerKind,
}: {
  commandsEnabled: boolean;
  workerKind: OperatorWorkerKind;
}) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<OperatorWorkerJobStatus>("DEAD");
  const [page, setPage] = useState(1);
  const input = { kind: workerKind, status, page, limit: PAGE_SIZE };
  const query = useQuery(operatorQueries.workerJobs(input));

  useEffect(
    () => () => {
      queryClient.removeQueries({
        predicate: ({ queryKey }) =>
          queryKey[0] === "operator" &&
          queryKey[1] === "moderation" &&
          queryKey[2] === "workers" &&
          queryKey[3] === workerKind &&
          queryKey[4] === "jobs",
      });
    },
    [queryClient, workerKind],
  );

  useEffect(() => {
    if (!isAccessError(query.error)) return;
    queryClient.removeQueries({
      predicate: ({ queryKey }) =>
        queryKey[0] === "operator" &&
        queryKey[1] === "moderation" &&
        queryKey[2] === "workers" &&
        queryKey[3] === workerKind &&
        queryKey[4] === "jobs",
    });
  }, [query.error, queryClient, workerKind]);

  const totalPages = query.data
    ? Math.max(1, Math.ceil(query.data.total / query.data.limit))
    : 1;

  return (
    <section
      className="grid gap-4 rounded-2xl border border-border bg-card p-5"
      aria-labelledby="worker-jobs-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h2 id="worker-jobs-heading" className="font-bold text-ink text-xl">
            Jobs needing attention
          </h2>
          <p className="text-slate-muted text-sm">
            Requeue only after checking the safe error code and worker status.
          </p>
        </div>
        <label className="grid gap-1 font-semibold text-ink text-xs">
          Job state
          <select
            value={status}
            onChange={(event) => {
              const nextStatus = JOB_FILTERS.find(
                (filter) => filter === event.target.value,
              );
              if (!nextStatus) return;
              setStatus(nextStatus);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-border bg-input px-3 text-ink text-sm"
          >
            {JOB_FILTERS.map((filter) => (
              <option key={filter} value={filter}>
                {humanizeCode(filter)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {query.isLoading ? (
        <div
          className="grid gap-2"
          role="status"
          aria-label="Loading worker jobs"
        >
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      ) : query.isError || !query.data ? (
        <JobListError
          accessChanged={isAccessError(query.error)}
          onRetry={() => void query.refetch()}
        />
      ) : query.data.data.length ? (
        <>
          <ul className="grid gap-3">
            {query.data.data.map((job) => (
              <WorkerJobCard
                key={job.id}
                job={job}
                workerKind={workerKind}
                commandsEnabled={commandsEnabled}
              />
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 border-border border-t pt-4">
            <p className="text-slate-muted text-xs" role="status">
              Page {page} of {totalPages} · {query.data.total} jobs
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="grid min-h-32 place-items-center rounded-xl bg-muted/45 p-5 text-center">
          <div className="grid gap-1">
            <h3 className="font-semibold text-ink">
              No {status.toLowerCase()} jobs
            </h3>
            <p className="text-slate-muted text-sm">
              This worker has no jobs in the selected state.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function WorkerJobCard({
  commandsEnabled,
  job,
  workerKind,
}: {
  commandsEnabled: boolean;
  job: OperatorWorkerJob;
  workerKind: OperatorWorkerKind;
}) {
  return (
    <li className="sm:main-action-grid grid gap-4 rounded-xl bg-muted/45 p-4 sm:items-center">
      <div className="grid min-w-0 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-all font-semibold text-ink text-sm">{job.id}</h3>
          <span className="rounded-full bg-card px-2.5 py-1 font-semibold text-slate-muted text-xs">
            {humanizeCode(job.status)}
          </span>
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <JobFact label="Case" value={job.caseReference ?? "Not linked"} />
          <JobFact
            label="Attempts since requeue"
            value={`${job.attempts} of ${job.maxAttempts}`}
          />
          <JobFact
            label="Lifetime attempts"
            value={String(job.lifetimeAttempts)}
          />
          <JobFact
            label="Safe error code"
            value={job.lastErrorCode ? humanizeCode(job.lastErrorCode) : "None"}
          />
          <JobFact
            label="Next retry"
            value={formatOperatorDate(job.nextRetryAt)}
          />
          <JobFact label="Updated" value={formatOperatorDate(job.updatedAt)} />
        </dl>
      </div>
      {commandsEnabled ? (
        <ReplayJobCommand job={job} workerKind={workerKind} />
      ) : null}
    </li>
  );
}

function ReplayJobCommand({
  job,
  workerKind,
}: {
  job: OperatorWorkerJob;
  workerKind: OperatorWorkerKind;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const commandRef = useRef<{ key: string; version: number } | null>(null);
  const mutation = useMutation({
    mutationKey: ["operator", "moderation", "worker-job-replay", job.id],
    mutationFn: () => {
      if (commandRef.current?.version !== job.version) {
        commandRef.current = {
          key: crypto.randomUUID(),
          version: job.version,
        };
      }
      return OperatorApi.replayWorkerJob(workerKind, job.id, {
        idempotencyKey: commandRef.current.key,
        expectedVersion: job.version,
        reasonCode: "OWNER_JOB_REPLAY",
      });
    },
    onSuccess: () => {
      setOpen(false);
      commandRef.current = null;
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: OPERATOR_QUERY_KEYS.workers,
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            queryKey[0] === "operator" &&
            queryKey[1] === "moderation" &&
            queryKey[2] === "workers" &&
            queryKey[3] === workerKind &&
            queryKey[4] === "jobs",
        }),
      ]);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <RotateCcw className="size-4" aria-hidden="true" />
          Requeue job
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Requeue this job?</AlertDialogTitle>
          <AlertDialogDescription>
            This returns the existing job to the queue. It does not create a
            second task.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {mutation.isError ? (
          <p className="text-destructive text-sm" role="alert">
            The job was not requeued. Refresh the page and check the current
            worker state before trying again.
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
            Requeue job
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function JobFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="wrap-break-word text-ink">{value}</dd>
    </div>
  );
}

function JobListError({
  accessChanged,
  onRetry,
}: {
  accessChanged: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-xl bg-muted/45 p-4">
      <p className="text-slate-muted text-sm" role="alert">
        {accessChanged
          ? "Owner access changed. Worker job data has been cleared."
          : "Worker jobs could not be loaded."}
      </p>
      {!accessChanged ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={onRetry}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

function isAccessError(error: unknown) {
  return (
    error instanceof HTTPError && [401, 403].includes(error.response.status)
  );
}
