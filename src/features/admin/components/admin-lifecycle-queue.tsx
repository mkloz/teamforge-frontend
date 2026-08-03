import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw, Wrench } from "lucide-react";

import {
  ADMIN_LIFECYCLE_QUEUE_QUERY_KEY,
  AdminApi,
  adminLifecycleQueueQueryOptions,
} from "@/features/admin/api/admin.api";
import type {
  AdminLifecycleIssue,
  AdminLifecycleReconciliationAction,
} from "@/features/admin/schemas/admin-lifecycle-operations.schema";
import { adminLifecycleReconciliationActionSchema } from "@/features/admin/schemas/admin-lifecycle-operations.schema";
import { AdminSectionHeader } from "@/shared/components/admin/admin-visuals";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";

export function AdminLifecycleQueue() {
  const queryClient = useQueryClient();
  const queue = useQuery(adminLifecycleQueueQueryOptions());
  const reconcile = useMutation({
    mutationFn: (issue: AdminLifecycleIssue) => {
      const action = getSupportedAction(issue.suggestedAction);
      if (!action) throw new Error("This issue requires manual review.");
      const resourceId =
        action === "RUN_SEAT_RECONCILIATION" ? issue.planId : issue.id;
      if (!resourceId) throw new Error("The affected resource is unavailable.");
      return AdminApi.reconcileLifecycleIssue({ action, resourceId });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ADMIN_LIFECYCLE_QUEUE_QUERY_KEY,
      }),
  });

  return (
    <section className="grid gap-4" aria-labelledby="lifecycle-queue-heading">
      <AdminSectionHeader
        icon={AlertTriangle}
        title="Lifecycle recovery queue"
        description="Resolve expired invitations, place drift, guest approvals, and ownership offers without editing the database."
        action={
          <Button
            onClick={() => void queue.refetch()}
            size="sm"
            type="button"
            variant="outline"
          >
            <RefreshCw aria-hidden className="size-4" />
            Refresh
          </Button>
        }
      />

      {queue.isError ? (
        <Notice role="alert" tone="danger" statusIcon>
          The lifecycle queue could not be loaded.
        </Notice>
      ) : null}
      {reconcile.isError ? (
        <Notice role="alert" tone="danger" statusIcon>
          The recovery command did not complete. Refresh the queue before trying
          again.
        </Notice>
      ) : null}
      {queue.data?.items.length === 0 ? (
        <Notice role="status" tone="success" statusIcon>
          No lifecycle recovery is waiting.
        </Notice>
      ) : null}

      <div className="grid gap-3">
        {queue.data?.items.map((issue) => {
          const action = getSupportedAction(issue.suggestedAction);
          return (
            <article
              className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-center"
              key={`${issue.type}-${issue.id}`}
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-ink text-sm">
                  {humanize(issue.type)}
                </h3>
                <p className="mt-1 text-slate-muted text-sm">{issue.reason}</p>
                <p className="mt-2 text-slate-muted text-xs tabular-nums">
                  {issue.planId
                    ? `Plan ${issue.planId}`
                    : `Group ${issue.groupId ?? "unknown"}`}
                </p>
              </div>
              {action ? (
                <Button
                  disabled={reconcile.isPending}
                  loading={
                    reconcile.isPending && reconcile.variables?.id === issue.id
                  }
                  onClick={() => reconcile.mutate(issue)}
                  size="sm"
                  type="button"
                  variant={
                    action === "REVOKE_EXTERNAL_INVITE"
                      ? "destructive"
                      : "outline"
                  }
                >
                  <Wrench aria-hidden className="size-4" />
                  {action === "REVOKE_EXTERNAL_INVITE"
                    ? "Revoke invite"
                    : "Reconcile"}
                </Button>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function getSupportedAction(
  value: string,
): AdminLifecycleReconciliationAction | null {
  const result = adminLifecycleReconciliationActionSchema.safeParse(value);
  return result.success ? result.data : null;
}

function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
