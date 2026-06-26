import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Calendar,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  MapPin,
  MessageSquareDiff,
  Pencil,
  PlusCircle,
  XCircle,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type {
  MemberRole,
  Plan,
} from "@/features/activity/lib/activity-contract";
import { formatPlanLocation } from "@/features/activity/lib/plan-location";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { FactItem } from "@/shared/components/ui/fact-item";
import type { IconTileTone } from "@/shared/components/ui/icon-tile";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import {
  categoryColors,
  formatDate,
  formatPanelToken,
  formatTime,
  statusColors,
} from "../lib/constants";
import { stripPanelStatusPrefix } from "../status-prefix";
import {
  getPlanLifecycleViewState,
  type PlanLifecycleViewState,
} from "./plan-lifecycle-view-state";

interface PlanSectionProps {
  plan: Plan;
  currentUserRole?: MemberRole;
  isFocused?: boolean;
  isOnline?: boolean;
  focusedProposalId?: string | null;
  isReadOnly?: boolean;
  onCancelPlan?: () => Promise<void> | void;
  onCompletePlan?: () => Promise<void> | void;
  onConfirmPlan?: () => Promise<void> | void;
  onCreateNextPlan?: () => Promise<void> | void;
  onEditPlan?: () => void;
  pendingAction?: string | null;
}

interface PlanSectionViewState {
  displayTitle: string;
  formattedCost: string;
  formattedDate: string;
  formattedLocation: string;
  formattedTime: string;
  locationHref: string | null;
  sectionLabel: string;
  shouldShowStatusPill: boolean;
}

const PLAN_STATUS_PILL_ICON_BY_STATUS: Partial<
  Record<Plan["status"], LucideIcon>
> = {
  CANCELLED: XCircle,
  COMPLETED: CheckCircle2,
  CONFIRMED: CheckCircle2,
  DRAFT: Pencil,
  IN_PROGRESS: CircleDot,
  PROPOSED: MessageSquareDiff,
};

const READ_ONLY_PLAN_SECTION_LABEL_BY_STATUS: Partial<
  Record<Plan["status"], string>
> = {
  CANCELLED: "Cancelled plan",
  COMPLETED: "Final plan",
};

export function PlanSection({
  currentUserRole = "MEMBER",
  plan,
  isFocused = false,
  isOnline = true,
  isReadOnly = false,
  onCancelPlan,
  onCompletePlan,
  onConfirmPlan,
  onCreateNextPlan,
  onEditPlan,
  pendingAction = null,
}: PlanSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewState = getPlanSectionViewState(plan, isReadOnly);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [isFocused]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "scroll-mt-24 border-border/70 border-t pt-5 transition-all duration-500",
        isFocused &&
          "rounded-xl bg-forge-teal/8 px-3 pb-3 ring-1 ring-forge-teal/20",
      )}
      aria-labelledby="current-plan-title"
    >
      <div className="flex flex-col gap-3 border-border/70 border-b pb-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-bold text-slate-muted text-xs">
            {viewState.sectionLabel}
          </p>
          <div className="flex flex-wrap justify-end gap-1.5">
            <PlanCategoryPill category={plan.category} />
            {viewState.shouldShowStatusPill ? (
              <PlanStatusPill status={plan.status} />
            ) : null}
          </div>
        </div>

        <h2
          id="current-plan-title"
          className="text-balance font-bold text-ink text-xl leading-tight tracking-tight"
        >
          {viewState.displayTitle}
        </h2>
      </div>

      {plan.description ? (
        <p className="mt-2 line-clamp-2 text-ink/70 text-sm leading-relaxed">
          {plan.description}
        </p>
      ) : null}

      <PlanFactList
        cost={viewState.formattedCost}
        date={viewState.formattedDate}
        location={viewState.formattedLocation}
        locationHref={viewState.locationHref}
        time={viewState.formattedTime}
      />

      <PlanLifecycleActions
        currentUserRole={currentUserRole}
        isOnline={isOnline}
        isReadOnly={isReadOnly}
        onCancelPlan={onCancelPlan}
        onCompletePlan={onCompletePlan}
        onConfirmPlan={onConfirmPlan}
        onCreateNextPlan={onCreateNextPlan}
        onEditPlan={onEditPlan}
        pendingAction={pendingAction}
        plan={plan}
      />
    </section>
  );
}

function getPlanSectionViewState(
  plan: Plan,
  isReadOnly: boolean,
): PlanSectionViewState {
  return {
    displayTitle: getPlanDisplayTitle(plan),
    formattedCost: formatPlanCost(plan),
    formattedDate: plan.dateTime ? formatDate(plan.dateTime) : "Date TBD",
    formattedLocation: formatPlanLocation(plan),
    formattedTime: plan.dateTime ? formatTime(plan.dateTime) : "Time TBD",
    locationHref: getPlanLocationHref(plan),
    sectionLabel: getPlanSectionLabel(plan.status, isReadOnly),
    shouldShowStatusPill: shouldShowPlanStatusPill(plan.status, isReadOnly),
  };
}

function getPlanDisplayTitle(plan: Plan) {
  return stripPanelStatusPrefix(plan.title, formatPanelToken(plan.status));
}

function getPlanLocationHref(plan: Plan) {
  if (
    plan.locationMode === "IN_PERSON" &&
    plan.locationLat !== null &&
    plan.locationLng !== null
  ) {
    return `https://maps.google.com/?q=${plan.locationLat},${plan.locationLng}`;
  }

  return null;
}

function shouldShowPlanStatusPill(status: Plan["status"], isReadOnly: boolean) {
  return !(isReadOnly && status === "COMPLETED");
}

function PlanCategoryPill({ category }: { category: Plan["category"] }) {
  return (
    <StatusPill tone="none" className={categoryColors[category]}>
      {formatPanelToken(category)}
    </StatusPill>
  );
}

function PlanStatusPill({ status }: { status: Plan["status"] }) {
  const Icon = getPlanStatusPillIcon(status);
  const label = formatPanelToken(status);

  return (
    <StatusPill icon={Icon} tone="none" className={statusColors[status]}>
      {label}
    </StatusPill>
  );
}

function getPlanStatusPillIcon(status: Plan["status"]) {
  return PLAN_STATUS_PILL_ICON_BY_STATUS[status] ?? CircleDashed;
}

function PlanFactList({
  cost,
  date,
  location,
  locationHref,
  time,
}: {
  cost: string;
  date: string;
  location: string;
  locationHref: string | null;
  time: string;
}) {
  const facts: PlanFactProps[] = [
    {
      icon: Calendar,
      label: "When",
      meta: time,
      tone: "teal" as const,
      value: date,
      wide: true,
    },
    {
      href: locationHref,
      icon: MapPin,
      label: "Where",
      tone: "muted" as const,
      value: location,
      wide: true,
    },
    {
      icon: Banknote,
      label: "Cost",
      tone: "muted" as const,
      value: cost,
    },
  ];

  return (
    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-border/70 border-b pb-3">
      {facts.map((fact) => (
        <PlanFact key={fact.label} {...fact} />
      ))}
    </dl>
  );
}

function PlanFact({
  href,
  icon,
  label,
  meta,
  tone,
  value,
  wide = false,
}: PlanFactProps) {
  return (
    <FactItem
      className={wide ? "col-span-2" : undefined}
      href={href}
      icon={icon}
      iconTone={tone}
      label={label}
      linkClassName={wide ? "wrap-break-word" : undefined}
      meta={meta}
      value={value}
    />
  );
}

function PlanLifecycleActions({
  currentUserRole,
  isReadOnly,
  isOnline,
  onCancelPlan,
  onCompletePlan,
  onConfirmPlan,
  onCreateNextPlan,
  onEditPlan,
  pendingAction,
  plan,
}: {
  currentUserRole: MemberRole;
  isOnline: boolean;
  isReadOnly: boolean;
  onCancelPlan?: () => Promise<void> | void;
  onCompletePlan?: () => Promise<void> | void;
  onConfirmPlan?: () => Promise<void> | void;
  onCreateNextPlan?: () => Promise<void> | void;
  onEditPlan?: () => void;
  pendingAction: string | null;
  plan: Plan;
}) {
  const viewState = getPlanLifecycleViewState({
    currentUserRole,
    hasCancelPlan: Boolean(onCancelPlan),
    hasCompletePlan: Boolean(onCompletePlan),
    hasConfirmPlan: Boolean(onConfirmPlan),
    hasEditPlan: Boolean(onEditPlan),
    isOnline,
    isReadOnly,
    pendingAction,
    plan,
  });

  if (!viewState.canManagePlan) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <PlanLifecycleOfflineNotice visible={viewState.hasOfflineBlock} />

      <ConfirmPlanAction
        onConfirmPlan={onConfirmPlan}
        plan={plan}
        viewState={viewState}
      />

      <CompletePlanAction
        onCompletePlan={onCompletePlan}
        viewState={viewState}
      />

      <CancelPlanAction onCancelPlan={onCancelPlan} viewState={viewState} />

      <CreateNextPlanAction
        onCreateNextPlan={onCreateNextPlan}
        viewState={viewState}
      />

      <EditPlanAction onEditPlan={onEditPlan} viewState={viewState} />
    </div>
  );
}

function PlanLifecycleOfflineNotice({ visible }: { visible: boolean }) {
  if (!visible) {
    return null;
  }

  return (
    <OfflineNotice
      withIcon={false}
      tone="neutral"
      size="xs"
      className="basis-full rounded-lg border-border/70 bg-muted/30 text-slate-muted"
    >
      Reconnect before changing this plan.
    </OfflineNotice>
  );
}

function ConfirmPlanAction({
  onConfirmPlan,
  plan,
  viewState,
}: {
  onConfirmPlan?: () => Promise<void> | void;
  plan: Plan;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.confirm;

  if (!viewState.showConfirmAction) {
    return null;
  }

  return (
    <ActionDialog
      cancelLabel="Review first"
      confirmLabel={action.confirmLabel}
      description="This turns the draft into the plan everyone sees as ready."
      details={[
        plan.dateTime ? `Time: ${formatDate(plan.dateTime)}` : "Date TBD",
        `Place: ${formatPlanLocation(plan)}`,
      ]}
      disabled={action.disabled}
      loading={action.loading}
      onConfirm={onConfirmPlan}
      title="Confirm this plan?"
      tone="info"
      trigger={
        <Button
          type="button"
          size="sm"
          className="min-w-max grow basis-36"
          contentClassName="gap-1.5"
          disabled={action.disabled}
          loading={action.loading}
          title={action.title}
        >
          <CheckCircle2 className="size-3.5 shrink-0" />
          Confirm plan
        </Button>
      }
    />
  );
}

function CompletePlanAction({
  onCompletePlan,
  viewState,
}: {
  onCompletePlan?: () => Promise<void> | void;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.complete;

  if (!viewState.showCompleteAction) {
    return null;
  }

  return (
    <ActionDialog
      cancelLabel="Not yet"
      confirmLabel={action.confirmLabel}
      description="Mark this plan as finished when the group has wrapped it up."
      details={[
        "The plan moves into completed history.",
        "Members can still use the group for follow-up and future plans.",
      ]}
      disabled={action.disabled}
      loading={action.loading}
      onConfirm={onCompletePlan}
      title="Complete this plan?"
      tone="success"
      trigger={
        <Button
          type="button"
          size="sm"
          className="min-w-max grow basis-36"
          contentClassName="gap-1.5"
          disabled={action.disabled}
          loading={action.loading}
          title={action.title}
        >
          <CheckCircle2 className="size-3.5 shrink-0" />
          Complete
        </Button>
      }
    />
  );
}

function CancelPlanAction({
  onCancelPlan,
  viewState,
}: {
  onCancelPlan?: () => Promise<void> | void;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.cancel;

  if (!viewState.showCancelAction) {
    return null;
  }

  return (
    <ActionDialog
      cancelLabel="Keep plan"
      confirmLabel={action.confirmLabel}
      description="This closes the current plan for the group."
      details={[
        "Members will see the plan as cancelled.",
        "The group chat stays open for deciding what happens next.",
      ]}
      disabled={action.disabled}
      loading={action.loading}
      onConfirm={onCancelPlan}
      title="Cancel this plan?"
      tone="danger"
      trigger={
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="min-w-max grow basis-36"
          contentClassName="gap-1.5"
          disabled={action.disabled}
          loading={action.loading}
          title={action.title}
        >
          <XCircle className="size-3.5 shrink-0" />
          Cancel
        </Button>
      }
    />
  );
}

function CreateNextPlanAction({
  onCreateNextPlan,
  viewState,
}: {
  onCreateNextPlan?: () => Promise<void> | void;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.createNext;

  if (!viewState.showCreateNextAction) {
    return null;
  }

  return (
    <Button
      type="button"
      size="sm"
      className="min-w-max grow basis-36"
      contentClassName="gap-1.5"
      disabled={action.disabled}
      loading={action.loading}
      onClick={onCreateNextPlan}
      title={action.title}
    >
      <PlusCircle className="size-3.5 shrink-0" />
      Plan another
    </Button>
  );
}

function EditPlanAction({
  onEditPlan,
  viewState,
}: {
  onEditPlan?: () => void;
  viewState: PlanLifecycleViewState;
}) {
  const action = viewState.edit;

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="min-w-max grow basis-36"
      contentClassName="gap-1.5"
      disabled={action.disabled}
      onClick={onEditPlan}
      title={action.title}
    >
      <Pencil className="size-3.5 shrink-0" />
      Edit plan
    </Button>
  );
}

interface PlanFactProps {
  href?: string | null;
  icon: LucideIcon;
  label: string;
  meta?: string;
  tone: Extract<IconTileTone, "amber" | "muted" | "teal">;
  value: string;
  wide?: boolean;
}

function getPlanSectionLabel(planStatus: Plan["status"], isReadOnly: boolean) {
  if (!isReadOnly) {
    return "Current plan";
  }

  return READ_ONLY_PLAN_SECTION_LABEL_BY_STATUS[planStatus] ?? "Plan";
}

function formatPlanCost(plan: Plan) {
  if (plan.cost === "FREE") {
    return formatFreePlanCost(plan.costDetails);
  }

  return formatPaidPlanCost(plan);
}

function formatFreePlanCost(costDetails: Plan["costDetails"]) {
  return costDetails ? `Free · ${costDetails}` : "Free";
}

function formatPaidPlanCost({ costAmount, costDetails }: Plan) {
  return typeof costAmount === "number"
    ? `About £${costAmount.toFixed(0)}`
    : (costDetails ?? "Paid");
}
