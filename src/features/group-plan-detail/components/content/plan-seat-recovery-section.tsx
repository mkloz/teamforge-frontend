import {
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Armchair, Clock3 } from "lucide-react";
import { useState } from "react";

import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { groupPlanDetailQueries } from "@/features/group-plan-detail/api/group-plan-detail-queries";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type { PlanSeatViewerState } from "@/features/group-plan-detail/schemas/plan-seat-recovery.schema";
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
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import {
  getMutationOutcomeCode,
  presentMutationOutcome,
} from "@/shared/lib/lifecycle-presenters";
import { cn } from "@/shared/lib/utils";
import type { PlanOperationalState } from "@/shared/schemas/plan-operational-state";

import { PlanManagementSection } from "./plan-management-section";

export function PlanSeatRecoverySection({
  detail,
  operationalState,
}: {
  detail: GroupPlanDetail;
  operationalState?: PlanOperationalState;
}) {
  const plan = detail.plan;
  const enabled = Boolean(
    plan?.seatRecoveryEnabled ||
      (operationalState && operationalState.recovery.state !== "NONE"),
  );
  const query = useQuery(
    groupPlanDetailQueries.seatRecovery(
      plan?.id ?? "",
      enabled && !operationalState,
    ),
  );

  if (!plan || !enabled) return null;

  return (
    <PlanManagementSection
      description="Plan places are separate from group membership. If somebody cannot attend, their place can move safely to the waitlist."
      icon={Armchair}
      title="Plan places"
    >
      <SeatRecoveryBody
        detail={detail}
        operationalState={operationalState}
        query={query}
      />
    </PlanManagementSection>
  );
}

function SeatRecoveryBody({
  detail,
  operationalState,
  query,
}: {
  detail: GroupPlanDetail;
  operationalState?: PlanOperationalState;
  query: UseQueryResult<PlanSeatViewerState>;
}) {
  const plan = detail.plan;
  if (!plan || (!operationalState && query.isLoading)) {
    return <Skeleton className="h-20 w-full" shape="card" />;
  }
  if (!operationalState && (query.isError || !query.data)) {
    return (
      <Notice role="alert" size="sm" tone="warning" statusIcon>
        We couldn&apos;t load the current place status.
      </Notice>
    );
  }

  const state = operationalState
    ? projectOperationalSeatState(operationalState)
    : query.data;
  if (!state) return null;
  const offer = state.offer;

  if (offer?.status === "OFFERED") {
    return <OfferedSeatActions planId={plan.id} state={state} />;
  }
  if (offer?.status === "WAITING") {
    return (
      <GroupedMenuList>
        <GroupedMenuItem>
          <GroupedMenuAction className="min-h-16 px-4">
            <Clock3 className="size-4 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold text-ink text-sm">On the waitlist</p>
              <p className="mt-0.5 text-muted-foreground text-xs">
                We&apos;ll show the deadline here when a place is offered.
              </p>
            </div>
          </GroupedMenuAction>
        </GroupedMenuItem>
      </GroupedMenuList>
    );
  }
  if (state.seatCounts) {
    return <SeatAvailability counts={state.seatCounts} />;
  }

  return operationalState?.viewer.capabilities.joinWaitlist ||
    !operationalState ? (
    <JoinWaitlistAction planId={plan.id} />
  ) : (
    <Notice size="sm">No plan place action is available right now.</Notice>
  );
}

function projectOperationalSeatState(
  state: PlanOperationalState,
): PlanSeatViewerState {
  const viewerPlace = state.places.find(
    (place) => place.offerId && place.participantId !== null,
  );
  const seatCounts = state.places
    .filter((place) => place.ordinal !== null)
    .reduce<Record<string, number>>((counts, place) => {
      counts[place.state] = (counts[place.state] ?? 0) + 1;
      return counts;
    }, {});

  return {
    assignmentStatus: viewerPlace?.assignmentStatus ?? null,
    consequenceVersion: "operational-state.v1",
    materialRevision: state.materialRevision,
    offer: viewerPlace?.offerId
      ? {
          expiresAt: viewerPlace.offerExpiresAt,
          id: viewerPlace.offerId,
          status: viewerPlace.state === "WAITLISTED" ? "WAITING" : "OFFERED",
        }
      : null,
    participantScope:
      state.viewer.participantScope === "GUEST"
        ? "PLAN_GUEST"
        : ["MEMBER", "OWNER"].includes(state.viewer.participantScope)
          ? "GROUP_MEMBER"
          : "NONE",
    seatCounts: Object.keys(seatCounts).length > 0 ? seatCounts : null,
  };
}

function SeatAvailability({ counts }: { counts: Record<string, number> }) {
  const assigned = counts.OCCUPIED ?? 0;
  const held = (counts.HELD ?? 0) + (counts.PENDING_INVITE ?? 0);
  const open = (counts.OPEN ?? 0) + (counts.RELEASED ?? 0);
  const total = Math.max(1, assigned + held + open);
  const segments = Array.from({ length: total }, (_, position) => ({
    id: `plan-place-${position + 1}`,
    position,
  }));

  return (
    <GroupedMenuList>
      <GroupedMenuItem>
        <GroupedMenuAction className="min-h-20 flex-col items-stretch gap-3 px-4 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-semibold text-ink text-sm">
              {open > 0
                ? `${open} ${open === 1 ? "place" : "places"} open`
                : "All places filled"}
            </p>
            <p className="text-muted-foreground text-xs">
              {assigned} assigned{held > 0 ? ` · ${held} held` : ""}
            </p>
          </div>
          <div
            aria-label={`${assigned} assigned, ${held} held, ${open} open`}
            className="grid h-1.5 gap-1"
            role="img"
            style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
          >
            {segments.map((segment) => (
              <span
                className={cn(
                  "rounded-full",
                  segment.position < assigned
                    ? "bg-brand-teal"
                    : segment.position < assigned + held
                      ? "bg-brand-teal/45"
                      : "bg-foreground/12",
                )}
                key={segment.id}
              />
            ))}
          </div>
        </GroupedMenuAction>
      </GroupedMenuItem>
    </GroupedMenuList>
  );
}

function JoinWaitlistAction({ planId }: { planId: string }) {
  const queryClient = useQueryClient();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const mutation = useMutation({
    mutationFn: () => GroupPlanDetailCommands.joinSeatWaitlist(planId),
    meta: {
      errorToastMessage:
        "You aren't currently eligible for this plan waitlist.",
      telemetryName: "plan_seat_waitlist_join",
    },
    onError: () => refreshSeatState(queryClient, planId),
  });
  return (
    <div>
      <Button
        disabled={mutation.isPending || !isOnline}
        onClick={() => {
          if (
            guardOfflineAction({
              description: "Reconnect before joining the plan waitlist.",
              id: "plan-seat-waitlist-offline",
            })
          ) {
            return;
          }
          mutation.mutate();
        }}
        size="sm"
        variant="outline"
      >
        {mutation.isPending ? "Joining…" : "Join the place waitlist"}
      </Button>
      <MutationOutcomeNotice error={mutation.error} />
    </div>
  );
}

function OfferedSeatActions({
  planId,
  state,
}: {
  planId: string;
  state: PlanSeatViewerState;
}) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [doNotOfferAgain, setDoNotOfferAgain] = useState(false);
  const queryClient = useQueryClient();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const offer = state.offer;
  const accept = useMutation({
    mutationFn: () => {
      if (!offer) throw new Error("A current offer is required.");
      return GroupPlanDetailCommands.acceptSeatOffer({
        expectedMaterialRevision: state.materialRevision,
        offerId: offer.id,
        planId,
      });
    },
    meta: {
      errorToastMessage:
        "This place is no longer available. Refresh and try again.",
      telemetryName: "plan_seat_offer_accept",
    },
    onError: () => refreshSeatState(queryClient, planId),
  });
  const decline = useMutation({
    mutationFn: () => {
      if (!offer) throw new Error("A current offer is required.");
      return GroupPlanDetailCommands.declineSeatOffer({
        doNotOfferAgain,
        offerId: offer.id,
        planId,
      });
    },
    meta: {
      errorToastMessage: "We couldn't decline this place.",
      telemetryName: "plan_seat_offer_decline",
    },
    onError: () => refreshSeatState(queryClient, planId),
  });

  if (!offer) return null;

  return (
    <GroupedMenuList>
      <GroupedMenuItem>
        <GroupedMenuAction className="min-h-20 flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-ink text-sm">
              A place is ready for you
            </p>
            <p className="mt-0.5 text-muted-foreground text-xs">
              Held until {formatDateTime(offer.expiresAt)}.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <ActionDialog
              confirmLabel="Accept plan place"
              description="This accepts attendance for this plan only. It does not add you to the group or its chat."
              disabled={!acknowledged || !isOnline}
              loading={accept.isPending}
              onConfirm={() => {
                if (
                  guardOfflineAction({
                    description: "Reconnect before accepting this place.",
                    id: "plan-seat-accept-offline",
                  })
                ) {
                  return;
                }
                accept.mutate();
              }}
              title="Accept this plan place?"
              trigger={<Button size="sm">Review and accept</Button>}
            >
              <label className="flex items-start gap-3 rounded-xl bg-muted/55 p-3 text-sm">
                <input
                  checked={acknowledged}
                  className="mt-1 accent-brand-teal"
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  type="checkbox"
                />
                <span>I understand this is plan-only access.</span>
              </label>
            </ActionDialog>
            <ActionDialog
              confirmLabel="Decline place"
              description="The place will be released immediately for the next eligible person."
              loading={decline.isPending}
              onConfirm={() => {
                if (
                  guardOfflineAction({
                    description: "Reconnect before declining this place.",
                    id: "plan-seat-decline-offline",
                  })
                ) {
                  return;
                }
                decline.mutate();
              }}
              title="Decline this place?"
              tone="danger"
              trigger={
                <Button size="sm" variant="outline">
                  Decline
                </Button>
              }
            >
              <label className="flex items-start gap-3 rounded-xl bg-muted/55 p-3 text-sm">
                <input
                  checked={doNotOfferAgain}
                  className="mt-1 accent-brand-teal"
                  onChange={(event) => setDoNotOfferAgain(event.target.checked)}
                  type="checkbox"
                />
                <span>Do not offer me places in this group again.</span>
              </label>
            </ActionDialog>
          </div>
          <MutationOutcomeNotice error={accept.error ?? decline.error} />
        </GroupedMenuAction>
      </GroupedMenuItem>
    </GroupedMenuList>
  );
}

function MutationOutcomeNotice({ error }: { error: unknown }) {
  if (!error) return null;
  const outcome = presentMutationOutcome(getMutationOutcomeCode(error));
  return (
    <Notice className="mt-3 w-full" role="alert" tone={outcome.tone} statusIcon>
      <p className="font-semibold">{outcome.title}</p>
      <p>{outcome.detail}</p>
    </Notice>
  );
}

function refreshSeatState(
  queryClient: ReturnType<typeof useQueryClient>,
  planId: string,
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.groupPlanDetail.seatRecovery(planId),
    }),
    queryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.groupPlanDetail.operationalState(planId),
    }),
  ]);
}

function formatDateTime(value: string | null) {
  if (!value) return "the displayed deadline";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
