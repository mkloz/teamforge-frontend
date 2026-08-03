import { useMutation, useQuery } from "@tanstack/react-query";
import { Archive, ArchiveRestore, PauseCircle } from "lucide-react";

import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { groupPlanDetailQueries } from "@/features/group-plan-detail/api/group-plan-detail-queries";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";

export function GroupLifecycleSection({ groupId }: { groupId: string }) {
  const lifecycle = useQuery(groupPlanDetailQueries.lifecycle(groupId));
  const command = useMutation({
    mutationFn: (action: "archive" | "restore") => {
      if (!lifecycle.data) throw new Error("Group lifecycle is unavailable");
      return action === "archive"
        ? GroupPlanDetailCommands.archiveGroup(groupId, lifecycle.data.revision)
        : GroupPlanDetailCommands.restoreGroup(
            groupId,
            lifecycle.data.revision,
          );
    },
  });

  if (lifecycle.isPending || lifecycle.isError || !lifecycle.data) return null;
  const state = lifecycle.data;
  if (!state.isDormant && !state.isReadOnly && !state.capabilities.canArchive) {
    return null;
  }

  return (
    <section
      className="mt-10 rounded-2xl bg-card px-4 py-5 sm:px-5"
      aria-labelledby="group-lifecycle-heading"
    >
      <div className="flex items-start gap-3">
        {state.isReadOnly ? (
          <Archive
            aria-hidden="true"
            className="mt-0.5 size-5 text-slate-muted"
          />
        ) : (
          <PauseCircle
            aria-hidden="true"
            className="mt-0.5 size-5 text-spark-amber"
          />
        )}
        <div className="min-w-0 flex-1">
          <h2 id="group-lifecycle-heading" className="font-bold text-ink">
            {state.isReadOnly ? "Archived group" : "Manage group"}
          </h2>
          <p className="mt-1 text-slate-muted text-sm leading-relaxed">
            {getLifecycleCopy(state.isReadOnly, state.isDormant)}
          </p>
        </div>
      </div>

      {state.capabilities.canRestore ? (
        <Button
          className="mt-4"
          loading={command.isPending}
          onClick={() => command.mutate("restore")}
        >
          <ArchiveRestore className="size-4" />
          Restore group
        </Button>
      ) : null}

      {state.capabilities.canArchive ? (
        <ActionDialog
          title="Archive this group?"
          description="The group becomes read-only and disappears from active lists. Its history stays available, and you can restore it later. Pending invites and seat offers will be cancelled."
          confirmLabel="Archive group"
          loading={command.isPending}
          onConfirm={() => command.mutateAsync("archive")}
          trigger={
            <Button className="mt-4" variant="outline">
              <Archive className="size-4" />
              Archive group
            </Button>
          }
        />
      ) : state.activePlanBlocksArchive && !state.isReadOnly ? (
        <p className="mt-3 text-slate-muted text-xs">
          Finish or cancel the active plan before archiving this group.
        </p>
      ) : null}
    </section>
  );
}

function getLifecycleCopy(isReadOnly: boolean, isDormant: boolean) {
  if (isReadOnly) {
    return "Plans, invitations and chat are read-only. The group’s past activity and safety records remain available.";
  }
  if (isDormant) {
    return "This group has been quiet for a while. You can make a new plan, transfer ownership or archive it.";
  }
  return "Archive this group when you want to remove it from active lists without deleting its history.";
}
