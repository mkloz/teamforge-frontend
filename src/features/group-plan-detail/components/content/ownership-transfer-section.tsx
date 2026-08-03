import { useMutation, useQuery } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";

import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { groupPlanDetailQueries } from "@/features/group-plan-detail/api/group-plan-detail-queries";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { reauthenticateCurrentSession } from "@/shared/api/auth-session-commands";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Input } from "@/shared/components/ui/input";
import { Notice } from "@/shared/components/ui/notice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { PlanManagementSection } from "./plan-management-section";

export function OwnershipTransferSection({
  detail,
}: {
  detail: GroupPlanDetail;
}) {
  const isMember = detail.viewer.role !== null;
  const eligibleMembers = detail.members.filter(
    ({ userId }) => userId !== detail.viewer.userId,
  );
  const transfer = useQuery(
    groupPlanDetailQueries.ownershipTransfer(
      detail.group.id,
      isMember && !detail.governance,
    ),
  );
  const [recipientId, setRecipientId] = useState(
    eligibleMembers.at(0)?.userId ?? "",
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
    meta: {
      errorToastMessage: "We couldn't send the ownership transfer.",
      telemetryName: "group_ownership_transfer_create",
    },
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
    meta: {
      errorToastMessage: "We couldn't update the ownership transfer.",
      telemetryName: "group_ownership_transfer_respond",
    },
  });

  useEffect(() => {
    if (!eligibleMembers.some(({ userId }) => userId === recipientId)) {
      setRecipientId(eligibleMembers.at(0)?.userId ?? "");
    }
  }, [eligibleMembers, recipientId]);

  if (detail.governance || !isMember) return null;
  if (transfer.isSuccess && !transfer.data && detail.viewer.role !== "ADMIN") {
    return null;
  }

  const current = transfer.data;
  const recipient = current
    ? detail.members.find(({ userId }) => userId === current.recipientId)
    : null;

  return (
    <PlanManagementSection
      description="The current owner chooses a member, and that member must accept before anything changes."
      icon={KeyRound}
      title="Group ownership"
    >
      {transfer.isLoading ? (
        <Skeleton className="h-20 w-full" shape="card" />
      ) : null}
      {transfer.isError ? (
        <Notice role="alert" size="sm" tone="warning" statusIcon>
          We couldn&apos;t load the current ownership status.
        </Notice>
      ) : null}
      {current ? (
        <GroupedMenuList>
          <GroupedMenuItem>
            <GroupedMenuAction className="min-h-20 flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-ink text-sm">
                  Waiting for {recipient?.name ?? "the selected member"}
                </p>
                <p className="mt-0.5 text-muted-foreground text-xs">
                  Ownership stays unchanged until this request is accepted.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
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
                      disabled={respond.isPending}
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
                    disabled={respond.isPending}
                    onClick={() => respond.mutate("cancel")}
                    size="sm"
                    variant="outline"
                  >
                    Cancel transfer
                  </Button>
                ) : null}
              </div>
            </GroupedMenuAction>
          </GroupedMenuItem>
        </GroupedMenuList>
      ) : null}
      {!current &&
      !transfer.isLoading &&
      !transfer.isError &&
      detail.viewer.role === "ADMIN" &&
      eligibleMembers.length > 0 ? (
        <GroupedMenuList>
          <GroupedMenuItem>
            <GroupedMenuAction className="min-h-16 flex-col items-stretch gap-3 px-3 py-3 sm:flex-row sm:items-center sm:px-4">
              <div className="min-w-0 flex-1">
                <label
                  className="mb-1.5 block font-semibold text-ink text-xs"
                  htmlFor="ownership-recipient"
                >
                  New owner
                </label>
                <Select onValueChange={setRecipientId} value={recipientId}>
                  <SelectTrigger id="ownership-recipient" size="sm">
                    <SelectValue placeholder="Choose a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleMembers.map((member) => (
                      <SelectItem key={member.userId} value={member.userId}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ActionDialog
                confirmLabel="Send transfer"
                description="The selected member must accept before ownership changes."
                disabled={!recipientId || password.length === 0}
                onConfirm={() => create.mutateAsync()}
                title="Transfer group ownership?"
                trigger={
                  <Button className="sm:self-end" size="sm" variant="outline">
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
            </GroupedMenuAction>
          </GroupedMenuItem>
        </GroupedMenuList>
      ) : null}
    </PlanManagementSection>
  );
}
