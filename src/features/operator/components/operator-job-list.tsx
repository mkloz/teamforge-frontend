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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/shared/components/ui/pagination";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

const JOB_FILTERS = ["DEAD", "FAILED"] as const;
const PAGE_SIZE = 25;

export function OperatorJobList({
  commandsEnabled,
  onCommandError,
  workerKind,
}: {
  commandsEnabled: boolean;
  onCommandError: (error: unknown) => void;
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
          queryKey[0] === "admin" &&
          queryKey[1] === "operator" &&
          queryKey[2] === "moderation" &&
          queryKey[3] === "workers" &&
          queryKey[4] === workerKind &&
          queryKey[5] === "jobs",
      });
    },
    [queryClient, workerKind],
  );

  useEffect(() => {
    if (!isAccessError(query.error)) return;
    queryClient.removeQueries({
      predicate: ({ queryKey }) =>
        queryKey[0] === "admin" &&
        queryKey[1] === "operator" &&
        queryKey[2] === "moderation" &&
        queryKey[3] === "workers" &&
        queryKey[4] === workerKind &&
        queryKey[5] === "jobs",
    });
  }, [query.error, queryClient, workerKind]);

  const totalPages = query.data
    ? Math.max(1, Math.ceil(query.data.total / query.data.limit))
    : 1;
  const isRecoveringLastValidPage = Boolean(query.data && page > totalPages);

  useEffect(() => {
    if (!query.data || page <= totalPages) return;

    setPage(totalPages);
  }, [page, query.data, totalPages]);

  return (
    <section
      id="operator-worker-jobs"
      className="grid gap-4"
      aria-labelledby="worker-jobs-heading"
    >
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h2
            id="worker-jobs-heading"
            className="font-semibold text-ink text-xl"
          >
            {humanizeCode(workerKind)} jobs needing attention
          </h2>
          <p className="text-slate-muted text-sm">
            Requeue only after checking the safe error code and worker status.
          </p>
        </div>
        <fieldset className="inline-grid grid-cols-2 gap-1 rounded-xl bg-card p-1">
          <legend className="sr-only">Job state</legend>
          {JOB_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={status === filter}
              className={cn(
                "min-h-9 rounded-lg px-3 font-semibold text-sm transition-colors",
                status === filter
                  ? "bg-primary/10 text-ink"
                  : "text-slate-muted hover:bg-muted/50 hover:text-ink",
              )}
              onClick={() => {
                setStatus(filter);
                setPage(1);
              }}
            >
              {humanizeCode(filter)}
            </button>
          ))}
        </fieldset>
      </header>

      {query.isLoading || isRecoveringLastValidPage ? (
        <div
          className="grid gap-2"
          role="status"
          aria-label={
            isRecoveringLastValidPage
              ? "Loading the last available worker jobs page"
              : "Loading worker jobs"
          }
        >
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : query.isError || !query.data ? (
        <JobListError
          accessChanged={isAccessError(query.error)}
          onRetry={() => void query.refetch()}
        />
      ) : query.data.data.length ? (
        <>
          <ul className="grouped-surface grid overflow-hidden rounded-2xl [&>*]:bg-card">
            {query.data.data.map((job) => (
              <WorkerJobCard
                key={job.id}
                job={job}
                workerKind={workerKind}
                commandsEnabled={commandsEnabled}
                onCommandError={onCommandError}
              />
            ))}
          </ul>
          <Pagination className="mx-0 flex-wrap justify-between gap-3 pt-2">
            <p className="text-slate-muted text-xs" role="status">
              Page {page} of {totalPages} · {query.data.total} jobs
            </p>
            <PaginationContent className="gap-2">
              <PaginationItem>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
              </PaginationItem>
              <PaginationItem>
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
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      ) : (
        <div className="grid min-h-32 place-items-center rounded-xl border border-border border-dashed p-5 text-center">
          <div className="grid max-w-md gap-1">
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
  onCommandError,
  workerKind,
}: {
  commandsEnabled: boolean;
  job: OperatorWorkerJob;
  onCommandError: (error: unknown) => void;
  workerKind: OperatorWorkerKind;
}) {
  return (
    <li className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(14rem,0.9fr)_minmax(22rem,1.35fr)_auto] lg:items-center">
      <div className="grid min-w-0 gap-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="truncate font-mono font-semibold text-ink text-sm">
            {job.id}
          </h3>
          <span
            className={cn(
              "font-semibold text-xs",
              job.status === "DEAD" ? "text-danger" : "text-accent",
            )}
          >
            {humanizeCode(job.status)}
          </span>
        </div>
        <p className="text-slate-muted text-xs">
          Case {job.caseReference ?? "not linked"}
        </p>
      </div>

      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <JobFact
          label="Attempts"
          value={`${job.attempts} of ${job.maxAttempts}`}
        />
        <JobFact label="Lifetime" value={String(job.lifetimeAttempts)} />
        <JobFact
          label="Safe error"
          value={job.lastErrorCode ? humanizeCode(job.lastErrorCode) : "None"}
        />
        <JobFact
          label="Next retry"
          value={formatOperatorDate(job.nextRetryAt)}
        />
        <JobFact label="Updated" value={formatOperatorDate(job.updatedAt)} />
      </dl>

      {commandsEnabled ? (
        <ReplayJobCommand
          job={job}
          onCommandError={onCommandError}
          workerKind={workerKind}
        />
      ) : null}
    </li>
  );
}

function ReplayJobCommand({
  job,
  onCommandError,
  workerKind,
}: {
  job: OperatorWorkerJob;
  onCommandError: (error: unknown) => void;
  workerKind: OperatorWorkerKind;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const commandRef = useRef<{ key: string; version: number } | null>(null);
  const mutation = useMutation({
    mutationKey: [
      "admin",
      "operator",
      "moderation",
      "worker-job-replay",
      job.id,
    ],
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
    onError: onCommandError,
    onSuccess: () => {
      setOpen(false);
      commandRef.current = null;
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: OPERATOR_QUERY_KEYS.workers,
        }),
        queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            queryKey[0] === "admin" &&
            queryKey[1] === "operator" &&
            queryKey[2] === "moderation" &&
            queryKey[3] === "workers" &&
            queryKey[4] === workerKind &&
            queryKey[5] === "jobs",
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
