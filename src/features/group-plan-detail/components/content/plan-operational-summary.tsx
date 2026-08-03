import { CircleCheck, CircleDashed, ListChecks } from "lucide-react";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Notice } from "@/shared/components/ui/notice";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { presentPlanReadiness } from "@/shared/lib/lifecycle-presenters";
import type { PlanOperationalState } from "@/shared/schemas/plan-operational-state";

import { PlanManagementSection } from "./plan-management-section";

export function PlanOperationalSummary({
  isError,
  isLoading,
  state,
}: {
  isError: boolean;
  isLoading: boolean;
  state?: PlanOperationalState;
}) {
  if (isLoading) {
    return <Skeleton className="mt-6 h-32 w-full" shape="card" />;
  }
  if (isError || !state) {
    return (
      <Notice className="mt-6" role="alert" size="sm" tone="warning" statusIcon>
        We couldn&apos;t confirm the latest plan status. Refresh before taking
        an action.
      </Notice>
    );
  }

  const summary = presentPlanReadiness(state);
  const facts = [state.schedule, state.location, state.capacity];

  return (
    <PlanManagementSection
      description={summary.detail}
      icon={ListChecks}
      title={summary.title}
    >
      <GroupedMenuList aria-label={summary.accessibilityLabel}>
        {facts.map((fact) => {
          const Icon = ["RESOLVED", "AVAILABLE", "FULL"].includes(fact.state)
            ? CircleCheck
            : CircleDashed;
          return (
            <GroupedMenuItem key={`${fact.label}-${fact.state}`}>
              <GroupedMenuAction className="min-h-12 px-4">
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 font-semibold text-ink text-sm">
                  {fact.label}
                </span>
                {fact.detail ? (
                  <span className="max-w-48 truncate text-muted-foreground text-xs">
                    {fact.detail}
                  </span>
                ) : null}
              </GroupedMenuAction>
            </GroupedMenuItem>
          );
        })}
      </GroupedMenuList>
    </PlanManagementSection>
  );
}
