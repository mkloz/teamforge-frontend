import { useEffect, useRef } from "react";
import type {
  MemberRole,
  Plan,
} from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";
import { PlanFactList } from "./plan-facts";
import {
  PlanLifecycleActions,
  type RepeatCandidate,
  type RepeatPlanOptions,
} from "./plan-lifecycle-actions";
import { PlanCategoryPill, PlanStatusPill } from "./plan-section-pills";
import { getPlanSectionViewState } from "./plan-section-view-state";

interface PlanSectionProps {
  canManagePlanDirectly?: boolean;
  plan: Plan;
  groupName?: string;
  currentUserRole?: MemberRole;
  isFocused?: boolean;
  isOnline?: boolean;
  focusedProposalId?: string | null;
  isReadOnly?: boolean;
  onCancelPlan?: () => Promise<void> | void;
  onCompletePlan?: () => Promise<void> | void;
  onConfirmPlan?: () => Promise<void> | void;
  onCreateNextPlan?: (options?: RepeatPlanOptions) => Promise<void> | void;
  onEditPlan?: () => void;
  pendingAction?: string | null;
  repeatCandidates?: RepeatCandidate[];
}

export function PlanSection({
  canManagePlanDirectly,
  currentUserRole = "MEMBER",
  plan,
  groupName,
  isFocused = false,
  isOnline = true,
  isReadOnly = false,
  onCancelPlan,
  onCompletePlan,
  onConfirmPlan,
  onCreateNextPlan,
  onEditPlan,
  pendingAction = null,
  repeatCandidates,
}: PlanSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewState = getPlanSectionViewState(plan, isReadOnly);
  const repeatsGroupName =
    groupName?.trim().toLocaleLowerCase() ===
    viewState.displayTitle.trim().toLocaleLowerCase();

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
          className={cn(
            "text-balance font-bold text-ink text-xl leading-tight tracking-tight",
            repeatsGroupName && "sr-only",
          )}
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
        canManagePlanDirectly={canManagePlanDirectly}
        isOnline={isOnline}
        isReadOnly={isReadOnly}
        onCancelPlan={onCancelPlan}
        onCompletePlan={onCompletePlan}
        onConfirmPlan={onConfirmPlan}
        onCreateNextPlan={onCreateNextPlan}
        repeatCandidates={repeatCandidates}
        onEditPlan={onEditPlan}
        pendingAction={pendingAction}
        plan={plan}
      />
    </section>
  );
}
