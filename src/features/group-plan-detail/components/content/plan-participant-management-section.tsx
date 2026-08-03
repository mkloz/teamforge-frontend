import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Copy, Link2, UserPlus, UsersRound, X } from "lucide-react";
import { useState } from "react";

import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { groupPlanDetailQueries } from "@/features/group-plan-detail/api/group-plan-detail-queries";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";

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

  return (
    <section className="mt-5 rounded-2xl border border-border/70 bg-card px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
          <UsersRound className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-ink text-sm">Plan guests</h2>
          <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
            Guests can attend this plan without joining the group. Permanent
            membership needs their consent, every member&apos;s approval, and an
            open group place.
          </p>
          <GuestMembershipList
            detail={detail}
            guests={guests.data ?? []}
            proposals={proposals.data ?? []}
          />
          {plan.externalInvitesEnabled ? (
            <ExternalInviteControls
              invites={invites.data ?? []}
              planId={plan.id}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function GuestMembershipList({
  detail,
  guests,
  proposals,
}: {
  detail: GroupPlanDetail;
  guests: Array<{ id: string; name: string }>;
  proposals: Array<{
    approvalCount: number;
    guest: { id: string; name: string };
    id: string;
    requiredApprovals: number;
    status: string;
    viewerVote: "APPROVE" | "REJECT" | null;
  }>;
}) {
  const openGuestIds = new Set(proposals.map((proposal) => proposal.guest.id));
  const create = useMutation({
    mutationFn: (planGuestId: string) =>
      GroupPlanDetailCommands.createGuestMembershipProposal(
        detail.group.id,
        planGuestId,
      ),
  });
  const vote = useMutation({
    mutationFn: ({ id, approve }: { approve: boolean; id: string }) =>
      GroupPlanDetailCommands.voteGuestMembershipProposal(
        detail.group.id,
        id,
        approve,
      ),
  });

  if (guests.length === 0 && proposals.length === 0) return null;
  return (
    <div className="mt-4 grid gap-3">
      {guests.map((guest) => (
        <div
          className="flex items-center justify-between gap-3 rounded-xl bg-muted/55 px-3 py-2.5"
          key={guest.id}
        >
          <div>
            <p className="font-semibold text-ink text-sm">{guest.name}</p>
            <p className="text-muted-foreground text-xs">Plan-only guest</p>
          </div>
          <Button
            disabled={
              create.isPending ||
              openGuestIds.has(guest.id) ||
              detail.group.activeMembersCount >= detail.group.maxMembers
            }
            onClick={() => create.mutate(guest.id)}
            size="sm"
            variant="outline"
          >
            <UserPlus className="size-4" aria-hidden />
            {openGuestIds.has(guest.id) ? "Invited" : "Invite to group"}
          </Button>
        </div>
      ))}
      {proposals.map((proposal) => (
        <div
          className="rounded-xl border border-border/60 px-3 py-3"
          key={proposal.id}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-ink text-sm">
                {proposal.guest.name}
              </p>
              <p className="text-muted-foreground text-xs">
                {proposal.status === "PENDING_GUEST"
                  ? "Waiting for guest consent"
                  : `${proposal.approvalCount}/${proposal.requiredApprovals} members approved`}
              </p>
            </div>
            {proposal.status === "PENDING_VOTE" ? (
              <div className="flex gap-1.5">
                <Button
                  aria-label={`Approve ${proposal.guest.name}`}
                  disabled={vote.isPending || proposal.viewerVote === "APPROVE"}
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
          </div>
        </div>
      ))}
      {detail.group.activeMembersCount >= detail.group.maxMembers &&
      guests.length > 0 ? (
        <Notice size="sm">
          The group is full. Guests can still attend this plan, but membership
          cannot start until a group place opens.
        </Notice>
      ) : null}
    </div>
  );
}

function ExternalInviteControls({
  invites,
  planId,
}: {
  invites: Array<{
    expiresAt: string;
    id: string;
    status: string;
  }>;
  planId: string;
}) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const create = useMutation({
    mutationFn: () => GroupPlanDetailCommands.createExternalInvite(planId),
    onSuccess: (result) => setShareUrl(result.shareUrl),
  });
  const revoke = useMutation({
    mutationFn: (inviteId: string) =>
      GroupPlanDetailCommands.revokeExternalInvite(planId, inviteId),
  });

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  }

  return (
    <div className="mt-5 border-border/60 border-t pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-ink text-sm">Invite a friend</p>
          <p className="text-muted-foreground text-xs">
            Each link claims one open plan place and expires automatically.
          </p>
        </div>
        <Button
          disabled={create.isPending}
          onClick={() => create.mutate()}
          size="sm"
          variant="outline"
        >
          <Link2 className="size-4" aria-hidden />
          Create link
        </Button>
      </div>
      {shareUrl ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted/60 p-2">
          <p className="min-w-0 flex-1 truncate px-1 text-ink text-xs">
            {shareUrl}
          </p>
          <Button onClick={() => void copyLink()} size="sm" variant="outline">
            <Copy className="size-4" aria-hidden />
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      ) : null}
      {create.isError ? (
        <Notice className="mt-3" role="alert" size="sm" tone="warning">
          A link can only be created while a plan place is open.
        </Notice>
      ) : null}
      {invites
        .filter(({ status }) => status === "ACTIVE")
        .map((invite) => (
          <div
            className="mt-2 flex items-center justify-between gap-3 text-xs"
            key={invite.id}
          >
            <span className="text-muted-foreground">
              Active until {formatDateTime(invite.expiresAt)}
            </span>
            <Button
              disabled={revoke.isPending}
              onClick={() => revoke.mutate(invite.id)}
              size="sm"
              variant="ghost"
            >
              Revoke
            </Button>
          </div>
        ))}
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
