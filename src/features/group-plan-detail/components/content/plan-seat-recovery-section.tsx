import {
  type UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { Armchair, Clock3 } from "lucide-react";
import { useState } from "react";

import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { groupPlanDetailQueries } from "@/features/group-plan-detail/api/group-plan-detail-queries";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type { PlanSeatViewerState } from "@/features/group-plan-detail/schemas/plan-seat-recovery.schema";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Notice } from "@/shared/components/ui/notice";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

import { PlanManagementSection } from "./plan-management-section";

export function PlanSeatRecoverySection({
  detail,
}: {
  detail: GroupPlanDetail;
}) {
  const plan = detail.plan;
  const enabled = Boolean(plan?.seatRecoveryEnabled);
  const query = useQuery(
    groupPlanDetailQueries.seatRecovery(plan?.id ?? "", enabled),
  );

  if (!plan || !enabled) return null;

  return (
    <PlanManagementSection
      description="Plan places are separate from group membership. If somebody cannot attend, their place can move safely to the waitlist."
      icon={Armchair}
      title="Plan places"
    >
      <SeatRecoveryBody detail={detail} query={query} />
    </PlanManagementSection>
  );
}

function SeatRecoveryBody({
  detail,
  query,
}: {
  detail: GroupPlanDetail;
  query: UseQueryResult<PlanSeatViewerState>;
}) {
  const plan = detail.plan;
  if (!plan || query.isLoading) {
    return <Skeleton className="h-20 w-full" shape="card" />;
  }
  if (query.isError || !query.data) {
    return (
      <Notice role="alert" size="sm" tone="warning" statusIcon>
        We couldn&apos;t load the current place status.
      </Notice>
    );
  }

  const state = query.data;
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

  return <JoinWaitlistAction planId={plan.id} />;
}

function SeatAvailability({ counts }: { counts: Record<string, number> }) {
  const assigned = counts.OCCUPIED ?? 0;
  const held = counts.HELD ?? 0;
  const open = counts.OPEN ?? 0;
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
                    ? "bg-forge-teal"
                    : segment.position < assigned + held
                      ? "bg-forge-teal/45"
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
  const mutation = useMutation({
    mutationFn: () => GroupPlanDetailCommands.joinSeatWaitlist(planId),
    meta: {
      errorToastMessage:
        "You aren't currently eligible for this plan waitlist.",
      telemetryName: "plan_seat_waitlist_join",
    },
  });
  return (
    <Button
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
      size="sm"
      variant="outline"
    >
      {mutation.isPending ? "Joining…" : "Join the place waitlist"}
    </Button>
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
              disabled={!acknowledged}
              loading={accept.isPending}
              onConfirm={() => accept.mutate()}
              title="Accept this plan place?"
              trigger={<Button size="sm">Review and accept</Button>}
            >
              <label className="flex items-start gap-3 rounded-xl bg-muted/55 p-3 text-sm">
                <input
                  checked={acknowledged}
                  className="mt-1 accent-forge-teal"
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
              onConfirm={() => decline.mutate()}
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
                  className="mt-1 accent-forge-teal"
                  onChange={(event) => setDoNotOfferAgain(event.target.checked)}
                  type="checkbox"
                />
                <span>Do not offer me places in this group again.</span>
              </label>
            </ActionDialog>
          </div>
        </GroupedMenuAction>
      </GroupedMenuItem>
    </GroupedMenuList>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "the displayed deadline";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
