import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import {
  CalendarCheck,
  CalendarDays,
  Check,
  HelpCircle,
  MapPin,
  TicketCheck,
  UsersRound,
  X,
} from "lucide-react";
import {
  type PlanCommitmentResponse,
  PlanParticipantApi,
} from "@/features/group-plan-detail/public/plan-participant-api";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Notice } from "@/shared/components/ui/notice";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { PlanOperationalState } from "@/shared/schemas/plan-operational-state";

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
  const operational = useQuery({
    queryKey: APP_QUERY_KEYS.groupPlanDetail.operationalState(planId),
    queryFn: () => PlanParticipantApi.getOperationalState(planId),
    enabled: planId.length > 0,
    staleTime: 10_000,
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
    meta: {
      errorToastMessage: "We couldn't save your membership response.",
      telemetryName: "plan_guest_membership_respond",
    },
  });
  const withdraw = useMutation({
    mutationFn: () => PlanParticipantApi.withdrawPlanGuest(planId),
    onSuccess: () =>
      appQueryClient.invalidateQueries({
        queryKey: APP_QUERY_KEYS.planGuest.access(planId),
      }),
    meta: {
      errorToastMessage: "We couldn't release your plan place.",
      telemetryName: "plan_guest_withdraw",
    },
  });

  if (access.isLoading) return <PlanGuestPageSkeleton />;

  if (access.isError || !access.data) {
    return (
      <PageMessage>
        <Notice role="alert" tone="warning" statusIcon>
          This plan place is no longer available.
        </Notice>
      </PageMessage>
    );
  }

  const data = access.data;
  const invitation = proposal.data;
  const isGuest = data.participantScope === "PLAN_GUEST";
  const hasReleasedPlace = data.participantScope === "NONE";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
      <header className="max-w-3xl">
        <p className="flex items-center gap-2 font-semibold text-muted-foreground text-sm">
          <TicketCheck className="size-4" aria-hidden />
          {isGuest
            ? "Your plan place"
            : hasReleasedPlace
              ? "Plan place released"
              : "Your group plan"}
        </p>
        <h1 className="mt-2 text-balance font-extrabold text-3xl text-ink tracking-tight sm:text-4xl">
          {data.plan.title}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          With {data.groupName}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-12">
        <div className="min-w-0">
          {data.plan.description ? (
            <p className="max-w-2xl text-ink text-lg leading-relaxed">
              {data.plan.description}
            </p>
          ) : null}

          <GroupedMenuList className="mt-5">
            <GroupedMenuItem>
              <GroupedMenuAction className="min-h-14 px-4">
                <CalendarDays className="size-4 shrink-0" aria-hidden />
                <span className="font-semibold text-ink text-sm">
                  {formatDateTime(data.plan.dateTime)}
                </span>
              </GroupedMenuAction>
            </GroupedMenuItem>
            <GroupedMenuItem>
              <GroupedMenuAction className="min-h-14 px-4">
                <MapPin className="size-4 shrink-0" aria-hidden />
                <span className="font-semibold text-ink text-sm">
                  {data.plan.location ??
                    formatLocationMode(data.plan.locationMode)}
                </span>
              </GroupedMenuAction>
            </GroupedMenuItem>
            {data.seat ? (
              <GroupedMenuItem>
                <GroupedMenuAction className="min-h-14 px-4">
                  <TicketCheck className="size-4 shrink-0" aria-hidden />
                  <span className="font-semibold text-ink text-sm">
                    Place {data.seat.ordinal} ·{" "}
                    {formatSeatStatus(data.seat.assignmentStatus)}
                  </span>
                </GroupedMenuAction>
              </GroupedMenuItem>
            ) : null}
          </GroupedMenuList>

          {operational.data?.viewer.capabilities.setCommitment ? (
            <GuestCommitmentSection planId={planId} state={operational.data} />
          ) : null}

          {data.accessFacts.length > 0 ? (
            <section className="mt-8" aria-labelledby="access-heading">
              <h2 id="access-heading" className="font-bold text-ink text-lg">
                What to expect
              </h2>
              <p className="mt-1 text-muted-foreground text-sm">
                Practical information shared for this plan.
              </p>
              <GroupedMenuList className="mt-3">
                {data.accessFacts.map((fact) => (
                  <GroupedMenuItem key={fact.factKey}>
                    <GroupedMenuAction className="min-h-12 px-4">
                      <FactIcon value={fact.value} />
                      <span className="min-w-0 flex-1 font-semibold text-ink text-sm">
                        {formatFactKey(fact.factKey)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatFactValue(fact.value)}
                      </span>
                    </GroupedMenuAction>
                  </GroupedMenuItem>
                ))}
              </GroupedMenuList>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24">
          {hasReleasedPlace ? (
            <Notice size="sm" tone="success" statusIcon>
              Your place is available to somebody else. You no longer have
              access to this plan.
            </Notice>
          ) : null}
          {isGuest ? (
            <Notice size="sm">
              You can see this plan, but not group chat, member lists, or group
              history.
            </Notice>
          ) : null}

          {invitation?.status === "PENDING_GUEST" ? (
            <section className="mt-3 rounded-2xl bg-forge-teal/8 p-4">
              <h2 className="flex items-center gap-2 font-bold text-ink text-sm">
                <UsersRound className="size-4" aria-hidden />
                Join the group?
              </h2>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                Accepting starts a group vote. You remain a plan guest until
                every active member approves.
              </p>
              <div className="mt-4 grid gap-2">
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
            <Notice className="mt-3" size="sm">
              Membership vote: {invitation.approvalCount} of{" "}
              {invitation.requiredApprovals} approved.
            </Notice>
          ) : null}

          <div className="mt-4 grid gap-2">
            {data.participantScope === "GROUP_MEMBER" ? (
              <Button asChild>
                <Link to="/groups/$groupId" params={{ groupId: data.groupId }}>
                  Open group
                </Link>
              </Button>
            ) : null}
            {isGuest ? (
              <ActionDialog
                confirmLabel="Release place"
                description="Your plan access will end and the place can be offered to someone else. This does not affect the group."
                loading={withdraw.isPending}
                onConfirm={() => withdraw.mutate()}
                title="Leave this plan?"
                tone="danger"
                trigger={<Button variant="outline">Release my place</Button>}
              />
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}

function GuestCommitmentSection({
  planId,
  state,
}: {
  planId: string;
  state: PlanOperationalState;
}) {
  const mutation = useMutation({
    mutationFn: (response: PlanCommitmentResponse) =>
      PlanParticipantApi.setCommitment(
        planId,
        { expectedMaterialRevision: state.materialRevision, response },
        crypto.randomUUID(),
      ),
    onSuccess: async () => {
      await Promise.all([
        appQueryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.groupPlanDetail.operationalState(planId),
        }),
        appQueryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.planGuest.access(planId),
        }),
      ]);
    },
    meta: {
      errorToastMessage: "We couldn't save your plan response.",
      telemetryName: "plan_guest_commitment_set",
    },
  });
  const options: Array<{ label: string; value: PlanCommitmentResponse }> = [
    { label: "Going", value: "GOING" },
    { label: "Unsure", value: "UNSURE" },
    { label: "Can’t attend", value: "CANNOT_ATTEND" },
  ];

  return (
    <section className="mt-8" aria-labelledby="guest-commitment-heading">
      <h2
        id="guest-commitment-heading"
        className="flex items-center gap-2 font-bold text-ink text-lg"
      >
        <CalendarCheck className="size-4" aria-hidden />
        Can you make it?
      </h2>
      {!state.viewer.commitmentIsCurrent && state.viewer.commitmentState ? (
        <Notice className="mt-3" role="status" size="sm" tone="warning">
          The plan changed. Review it and answer again.
        </Notice>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            aria-pressed={
              state.viewer.commitmentIsCurrent &&
              state.viewer.commitmentState === option.value
            }
            disabled={mutation.isPending}
            key={option.value}
            onClick={() => mutation.mutate(option.value)}
            size="sm"
            variant={
              state.viewer.commitmentIsCurrent &&
              state.viewer.commitmentState === option.value
                ? "primary"
                : "outline"
            }
          >
            {option.label}
          </Button>
        ))}
      </div>
    </section>
  );
}

function PlanGuestPageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-10 w-3/5" />
      <Skeleton className="mt-3 h-5 w-40" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
        <div>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="mt-5 h-36 w-full" shape="card" />
        </div>
        <Skeleton className="h-32 w-full" shape="card" />
      </div>
    </main>
  );
}

function PageMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl items-center px-4 py-12">
      <div className="w-full">{children}</div>
    </main>
  );
}

function FactIcon({ value }: { value: "YES" | "NO" | "UNKNOWN" }) {
  const Icon = value === "YES" ? Check : value === "NO" ? X : HelpCircle;
  return <Icon className="size-4 shrink-0" aria-hidden />;
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

function formatSeatStatus(value: string) {
  return value.toLowerCase().replace(/^./u, (letter) => letter.toUpperCase());
}

function formatFactValue(value: "YES" | "NO" | "UNKNOWN") {
  if (value === "YES") return "Available";
  if (value === "NO") return "Not available";
  return "Not confirmed";
}

function formatFactKey(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/^./u, (letter) => letter.toUpperCase());
}
