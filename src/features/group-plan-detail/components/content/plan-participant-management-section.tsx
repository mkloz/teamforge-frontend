import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Copy, Link2, UserPlus, UsersRound, X } from "lucide-react";
import { useEffect, useState } from "react";

import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { groupPlanDetailQueries } from "@/features/group-plan-detail/api/group-plan-detail-queries";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Notice } from "@/shared/components/ui/notice";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { PlanManagementSection } from "./plan-management-section";

interface PlanGuest {
  avatar: string | null;
  id: string;
  name: string;
}

interface MembershipProposal {
  approvalCount: number;
  guest: { avatar?: string | null; id: string; name: string };
  id: string;
  requiredApprovals: number;
  status: string;
  viewerVote: "APPROVE" | "REJECT" | null;
}

export function PlanParticipantManagementSection({
  detail,
}: {
  detail: GroupPlanDetail;
}) {
  const plan = detail.plan;
  const enabled =
    detail.viewer.relationship === "MEMBER" ||
    detail.viewer.relationship === "MODERATOR" ||
    detail.viewer.relationship === "ADMIN";
  const guests = useQuery(
    groupPlanDetailQueries.planGuests(plan?.id ?? "", enabled && Boolean(plan)),
  );
  const proposals = useQuery(
    groupPlanDetailQueries.guestMembershipProposals(detail.group.id, enabled),
  );
  const invites = useQuery(
    groupPlanDetailQueries.externalInvites(
      plan?.id ?? "",
      enabled && Boolean(plan?.externalInvitesEnabled),
    ),
  );

  if (!plan?.seatRecoveryEnabled || !enabled) return null;

  const isLoading = guests.isLoading || proposals.isLoading;
  const hasError = guests.isError || proposals.isError;

  return (
    <PlanManagementSection
      description="Guests attend this plan without seeing group chat or history. Permanent membership still needs consent and group approval."
      icon={UsersRound}
      title="Guests and invitations"
    >
      {isLoading ? <Skeleton className="h-24 w-full" shape="card" /> : null}
      {hasError ? (
        <Notice role="alert" size="sm" tone="warning" statusIcon>
          We couldn&apos;t load guests and membership invitations.
        </Notice>
      ) : null}
      {!isLoading && !hasError ? (
        <GuestMembershipList
          detail={detail}
          guests={guests.data ?? []}
          proposals={proposals.data ?? []}
        />
      ) : null}
      {plan.externalInvitesEnabled ? (
        <ExternalInviteControls
          hasError={invites.isError}
          invites={invites.data ?? []}
          isLoading={invites.isLoading}
          planId={plan.id}
        />
      ) : null}
    </PlanManagementSection>
  );
}

function GuestMembershipList({
  detail,
  guests,
  proposals,
}: {
  detail: GroupPlanDetail;
  guests: PlanGuest[];
  proposals: MembershipProposal[];
}) {
  const openGuestIds = new Set(proposals.map((proposal) => proposal.guest.id));
  const create = useMutation({
    mutationFn: (planGuestId: string) =>
      GroupPlanDetailCommands.createGuestMembershipProposal(
        detail.group.id,
        planGuestId,
      ),
    meta: {
      errorToastMessage: "We couldn't start this membership invitation.",
      telemetryName: "guest_membership_proposal_create",
    },
  });
  const vote = useMutation({
    mutationFn: ({ id, approve }: { approve: boolean; id: string }) =>
      GroupPlanDetailCommands.voteGuestMembershipProposal(
        detail.group.id,
        id,
        approve,
      ),
    meta: {
      errorToastMessage: "We couldn't save your membership vote.",
      telemetryName: "guest_membership_proposal_vote",
    },
  });

  if (guests.length === 0 && proposals.length === 0) return null;

  const groupIsFull =
    detail.group.activeMembersCount >= detail.group.maxMembers;

  return (
    <>
      <GroupedMenuList>
        {guests.map((guest) => (
          <GroupedMenuItem key={guest.id}>
            <GroupedMenuAction className="min-h-16 px-3 sm:px-4">
              <Avatar
                className="size-9"
                imageSize={72}
                name={guest.name}
                src={guest.avatar}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink text-sm">
                  {guest.name}
                </p>
                <p className="text-muted-foreground text-xs">Plan guest</p>
              </div>
              <Button
                aria-label={`Invite ${guest.name} to the group`}
                disabled={
                  create.isPending || openGuestIds.has(guest.id) || groupIsFull
                }
                onClick={() => create.mutate(guest.id)}
                size="sm"
                variant="outline"
              >
                <UserPlus className="size-4" aria-hidden />
                <span className="hidden sm:inline">
                  {openGuestIds.has(guest.id) ? "Invited" : "Invite to group"}
                </span>
              </Button>
            </GroupedMenuAction>
          </GroupedMenuItem>
        ))}
        {proposals.map((proposal) => (
          <GroupedMenuItem key={proposal.id}>
            <GroupedMenuAction className="min-h-16 px-3 sm:px-4">
              <Avatar
                className="size-9"
                imageSize={72}
                name={proposal.guest.name}
                src={proposal.guest.avatar}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink text-sm">
                  {proposal.guest.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {proposal.status === "PENDING_GUEST"
                    ? "Waiting for their consent"
                    : `${proposal.approvalCount} of ${proposal.requiredApprovals} approved`}
                </p>
              </div>
              {proposal.status === "PENDING_VOTE" ? (
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    aria-label={`Approve ${proposal.guest.name}`}
                    disabled={
                      vote.isPending || proposal.viewerVote === "APPROVE"
                    }
                    onClick={() =>
                      vote.mutate({ approve: true, id: proposal.id })
                    }
                    size="icon-sm"
                    variant="outline"
                  >
                    <Check className="size-4" aria-hidden />
                  </Button>
                  <Button
                    aria-label={`Reject ${proposal.guest.name}`}
                    disabled={vote.isPending}
                    onClick={() =>
                      vote.mutate({ approve: false, id: proposal.id })
                    }
                    size="icon-sm"
                    variant="outline"
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                </div>
              ) : null}
            </GroupedMenuAction>
          </GroupedMenuItem>
        ))}
      </GroupedMenuList>
      {groupIsFull && guests.length > 0 ? (
        <Notice className="mt-3" size="sm">
          Guests can still attend, but group membership needs an open place.
        </Notice>
      ) : null}
    </>
  );
}

function ExternalInviteControls({
  hasError,
  invites,
  isLoading,
  planId,
}: {
  hasError: boolean;
  invites: Array<{ expiresAt: string; id: string; status: string }>;
  isLoading: boolean;
  planId: string;
}) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const create = useMutation({
    mutationFn: () => GroupPlanDetailCommands.createExternalInvite(planId),
    onSuccess: (result) => {
      setShareUrl(result.shareUrl);
      setCopyState("idle");
    },
  });
  const revoke = useMutation({
    mutationFn: (inviteId: string) =>
      GroupPlanDetailCommands.revokeExternalInvite(planId, inviteId),
  });

  useEffect(() => {
    const timeout =
      copyState === "copied"
        ? window.setTimeout(() => setCopyState("idle"), 2_000)
        : null;
    return () => {
      if (timeout !== null) window.clearTimeout(timeout);
    };
  }, [copyState]);

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  const activeInvites = invites.filter(({ status }) => status === "ACTIVE");

  return (
    <div className="mt-2">
      <GroupedMenuList>
        <GroupedMenuItem>
          <GroupedMenuAction className="min-h-16 px-3 sm:px-4">
            <Link2 className="size-4 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink text-sm">Share one place</p>
              <p className="mt-0.5 text-muted-foreground text-xs">
                Single-use link · expires after 72 hours
              </p>
            </div>
            <Button
              disabled={create.isPending}
              onClick={() => create.mutate()}
              size="sm"
              variant="outline"
            >
              Create link
            </Button>
          </GroupedMenuAction>
        </GroupedMenuItem>
        {shareUrl ? (
          <GroupedMenuItem>
            <GroupedMenuAction className="min-h-14 px-3 sm:px-4">
              <p className="min-w-0 flex-1 truncate text-ink text-xs">
                {shareUrl}
              </p>
              <Button onClick={() => void copyLink()} size="sm" variant="ghost">
                <Copy className="size-4" aria-hidden />
                {copyState === "copied" ? "Copied" : "Copy"}
              </Button>
            </GroupedMenuAction>
          </GroupedMenuItem>
        ) : null}
        {activeInvites.map((invite) => (
          <GroupedMenuItem key={invite.id}>
            <GroupedMenuAction className="min-h-12 px-3 sm:px-4">
              <p className="min-w-0 flex-1 text-muted-foreground text-xs">
                Active until {formatDateTime(invite.expiresAt)}
              </p>
              <Button
                disabled={revoke.isPending}
                onClick={() => revoke.mutate(invite.id)}
                size="sm"
                variant="ghost"
              >
                Revoke
              </Button>
            </GroupedMenuAction>
          </GroupedMenuItem>
        ))}
      </GroupedMenuList>
      {isLoading ? (
        <p className="mt-2 px-1 text-muted-foreground text-xs">
          Checking active links…
        </p>
      ) : null}
      {hasError || create.isError || copyState === "error" ? (
        <Notice className="mt-3" role="alert" size="sm" tone="warning">
          {copyState === "error"
            ? "The link couldn't be copied. Select and copy it manually."
            : "We couldn't update invitation links. Check that a plan place is open."}
        </Notice>
      ) : null}
      {copyState === "copied" ? (
        <span className="sr-only" role="status">
          Invitation link copied
        </span>
      ) : null}
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
