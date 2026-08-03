import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { CalendarDays, MapPin, TicketCheck, UsersRound } from "lucide-react";

import { PlanParticipantApi } from "@/features/group-plan-detail/public/plan-participant-api";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";

export function PlanGuestPage() {
  const { planId = "" } = useParams({ strict: false }) as { planId?: string };
  const access = useQuery({
    queryKey: APP_QUERY_KEYS.planGuest.access(planId),
    queryFn: () => PlanParticipantApi.getPlanGuestAccess(planId),
    enabled: planId.length > 0,
  });
  const proposal = useQuery({
    queryKey: APP_QUERY_KEYS.planGuest.membershipProposal(planId),
    queryFn: () => PlanParticipantApi.getGuestMembershipProposal(planId),
    enabled: planId.length > 0,
  });
  const respond = useMutation({
    mutationFn: ({ id, accept }: { accept: boolean; id: string }) =>
      PlanParticipantApi.respondGuestMembershipProposal(id, accept),
    onSuccess: async () => {
      await Promise.all([
        appQueryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.planGuest.membershipProposal(planId),
        }),
        appQueryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.planGuest.access(planId),
        }),
      ]);
    },
  });
  const withdraw = useMutation({
    mutationFn: () => PlanParticipantApi.withdrawPlanGuest(planId),
    onSuccess: () =>
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.planGuest.access(planId),
      }),
  });

  if (access.isLoading) {
    return <PageMessage>Loading your plan place…</PageMessage>;
  }
  if (access.isError || !access.data) {
    return <PageMessage>This plan place is no longer available.</PageMessage>;
  }

  const data = access.data;
  const invitation = proposal.data;
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
          <TicketCheck className="size-5" aria-hidden />
        </span>
        <div>
          <p className="font-semibold text-forge-teal text-xs uppercase tracking-[0.14em]">
            {data.participantScope === "PLAN_GUEST"
              ? "Plan guest"
              : "Group member"}
          </p>
          <h1 className="mt-1 font-bold text-2xl text-ink">
            {data.plan.title}
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            With {data.groupName}
          </p>
        </div>
      </div>

      <section className="mt-7 grid gap-4 rounded-2xl border border-border/70 bg-card p-5">
        <InfoRow icon={CalendarDays}>
          {formatDateTime(data.plan.dateTime)}
        </InfoRow>
        <InfoRow icon={MapPin}>
          {data.plan.location ?? formatLocationMode(data.plan.locationMode)}
        </InfoRow>
        {data.plan.description ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {data.plan.description}
          </p>
        ) : null}
        {data.seat ? (
          <p className="font-semibold text-ink text-sm">
            Place {data.seat.ordinal} ·{" "}
            {data.seat.assignmentStatus.toLowerCase()}
          </p>
        ) : null}
      </section>

      {data.accessFacts.length > 0 ? (
        <section className="mt-5 rounded-2xl border border-border/70 bg-card p-5">
          <h2 className="font-bold text-ink text-sm">Access information</h2>
          <div className="mt-3 grid gap-2">
            {data.accessFacts.map((fact) => (
              <p className="text-sm" key={fact.factKey}>
                <span className="font-semibold text-ink">
                  {formatFactKey(fact.factKey)}:
                </span>{" "}
                <span className="text-muted-foreground">
                  {fact.value.toLowerCase()} · {fact.source}
                </span>
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {invitation?.status === "PENDING_GUEST" ? (
        <section className="mt-5 rounded-2xl border border-forge-teal/30 bg-forge-teal/5 p-5">
          <div className="flex items-start gap-3">
            <UsersRound className="mt-0.5 size-5 text-forge-teal" aria-hidden />
            <div>
              <h2 className="font-bold text-ink text-sm">
                Join {data.groupName} permanently?
              </h2>
              <p className="mt-1 text-muted-foreground text-sm">
                Accepting starts a unanimous group vote. Until it passes, you
                remain a guest for this plan only.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              disabled={respond.isPending}
              onClick={() =>
                respond.mutate({ accept: true, id: invitation.id })
              }
              size="sm"
            >
              Accept invitation
            </Button>
            <Button
              disabled={respond.isPending}
              onClick={() =>
                respond.mutate({ accept: false, id: invitation.id })
              }
              size="sm"
              variant="outline"
            >
              Decline
            </Button>
          </div>
        </section>
      ) : null}

      {invitation?.status === "PENDING_VOTE" ? (
        <Notice className="mt-5">
          You accepted group membership. {invitation.approvalCount} of{" "}
          {invitation.requiredApprovals} members have approved it.
        </Notice>
      ) : null}

      {data.participantScope === "GROUP_MEMBER" ? (
        <Button asChild className="mt-5">
          <Link to="/groups/$groupId" params={{ groupId: data.groupId }}>
            Open group
          </Link>
        </Button>
      ) : null}

      {data.participantScope === "PLAN_GUEST" ? (
        <ActionDialog
          confirmLabel="Release place"
          description="Your plan access will end and the place can be offered to someone else. This does not affect the group."
          loading={withdraw.isPending}
          onConfirm={() => withdraw.mutate()}
          title="Leave this plan?"
          tone="danger"
          trigger={
            <Button className="mt-5" variant="outline">
              Release my place
            </Button>
          }
        />
      ) : null}
    </main>
  );
}

function PageMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-center text-muted-foreground text-sm">
      {children}
    </main>
  );
}

function InfoRow({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: typeof CalendarDays;
}) {
  return (
    <p className="flex items-center gap-2 text-ink text-sm">
      <Icon className="size-4 text-forge-teal" aria-hidden />
      {children}
    </p>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "Time being confirmed";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatLocationMode(value: string) {
  if (value === "ONLINE") return "Online";
  return "Location being confirmed";
}

function formatFactKey(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/^./u, (letter) => letter.toUpperCase());
}
