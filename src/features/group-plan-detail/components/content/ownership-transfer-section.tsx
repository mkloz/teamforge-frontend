import { useMutation, useQuery } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { useState } from "react";

import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { groupPlanDetailQueries } from "@/features/group-plan-detail/api/group-plan-detail-queries";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { reauthenticateCurrentSession } from "@/shared/api/auth-session-commands";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export function OwnershipTransferSection({
  detail,
}: {
  detail: GroupPlanDetail;
}) {
  const isMember = detail.viewer.role !== null;
  const transfer = useQuery(
    groupPlanDetailQueries.ownershipTransfer(
      detail.group.id,
      isMember && !detail.governance,
    ),
  );
  const [recipientId, setRecipientId] = useState(
    detail.members.find(({ userId }) => userId !== detail.viewer.userId)
      ?.userId ?? "",
  );
  const [password, setPassword] = useState("");
  const create = useMutation({
    mutationFn: async () => {
      await reauthenticateCurrentSession(password);
      return GroupPlanDetailCommands.createOwnershipTransfer(
        detail.group.id,
        recipientId,
      );
    },
    onSuccess: () => setPassword(""),
  });
  const respond = useMutation({
    mutationFn: async (response: "accept" | "decline" | "cancel") => {
      const current = transfer.data;
      if (!current) throw new Error("A pending transfer is required.");
      if (response === "accept") await reauthenticateCurrentSession(password);
      return GroupPlanDetailCommands.respondOwnershipTransfer(
        detail.group.id,
        current.id,
        response,
      );
    },
    onSuccess: () => setPassword(""),
  });

  if (detail.governance || !isMember) return null;
  const current = transfer.data;
  const recipient = current
    ? detail.members.find(({ userId }) => userId === current.recipientId)
    : null;

  return (
    <section className="mt-5 rounded-2xl border border-border/70 bg-card px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-ink">
          <KeyRound className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-ink text-sm">Group ownership</h2>
          <p className="mt-1 text-muted-foreground text-xs">
            Ownership changes only after the named member accepts it.
          </p>
          {current ? (
            <div className="mt-3 rounded-xl bg-muted/55 p-3">
              <p className="text-ink text-sm">
                Waiting for{" "}
                <strong>{recipient?.name ?? "the selected member"}</strong>
                {current.recipientId === detail.viewer.userId
                  ? " to respond."
                  : " to accept ownership."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {current.recipientId === detail.viewer.userId ? (
                  <>
                    <ActionDialog
                      confirmLabel="Accept ownership"
                      description="Confirm your password, then you will become the group owner."
                      disabled={password.length === 0}
                      onConfirm={() => respond.mutateAsync("accept")}
                      title="Accept group ownership?"
                      trigger={<Button size="sm">Accept</Button>}
                    >
                      <Input
                        autoComplete="current-password"
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Current password"
                        type="password"
                        value={password}
                      />
                    </ActionDialog>
                    <Button
                      onClick={() => respond.mutate("decline")}
                      size="sm"
                      variant="outline"
                    >
                      Decline
                    </Button>
                  </>
                ) : null}
                {current.initiatorId === detail.viewer.userId ? (
                  <Button
                    onClick={() => respond.mutate("cancel")}
                    size="sm"
                    variant="outline"
                  >
                    Cancel transfer
                  </Button>
                ) : null}
              </div>
            </div>
          ) : detail.viewer.role === "ADMIN" && detail.members.length > 1 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="ownership-recipient">
                New owner
              </label>
              <select
                className="h-9 min-w-44 rounded-lg border border-input-border bg-input px-3 text-ink text-sm"
                id="ownership-recipient"
                onChange={(event) => setRecipientId(event.target.value)}
                value={recipientId}
              >
                {detail.members
                  .filter(({ userId }) => userId !== detail.viewer.userId)
                  .map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.name}
                    </option>
                  ))}
              </select>
              <ActionDialog
                confirmLabel="Send transfer"
                description="The selected member must accept before ownership changes."
                disabled={!recipientId || password.length === 0}
                onConfirm={() => create.mutateAsync()}
                title="Transfer group ownership?"
                trigger={
                  <Button size="sm" variant="outline">
                    Transfer ownership
                  </Button>
                }
              >
                <Input
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Current password"
                  type="password"
                  value={password}
                />
              </ActionDialog>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
