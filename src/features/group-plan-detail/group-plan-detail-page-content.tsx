import type { Ref } from "react";
import { FitBriefSection } from "@/features/group-plan-detail/components/fit-brief-section";
import { GroupPlanDetailHero } from "@/features/group-plan-detail/components/group-plan-detail-hero";
import { MemberLineupSection } from "@/features/group-plan-detail/components/member-lineup-section";
import { PlanBriefSection } from "@/features/group-plan-detail/components/plan-brief-section";
import { PlanningSection } from "@/features/group-plan-detail/components/planning-section";
import { SafetyNotesSection } from "@/features/group-plan-detail/components/safety-notes-section";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

interface GroupPlanDetailPageContentProps {
  detail: GroupPlanDetail;
  highlightedProposalId?: string | null;
  isPlanHighlighted?: boolean;
  isPlanningHighlighted?: boolean;
  planSectionRef?: Ref<HTMLElement>;
  planningSectionRef?: Ref<HTMLElement>;
}

export function GroupPlanDetailPageContent({
  detail,
  highlightedProposalId = null,
  isPlanHighlighted = false,
  isPlanningHighlighted = false,
  planSectionRef,
  planningSectionRef,
}: GroupPlanDetailPageContentProps) {
  return (
    <div className="mx-auto w-full max-w-screen-2xl overflow-x-clip px-4 pt-3 pb-28 sm:px-5 md:pt-6 md:pb-10 lg:px-8">
      <GroupPlanDetailHero detail={detail} />

      <main className="grid max-w-6xl grid-cols-1 gap-8 pt-2 pb-4 lg:pt-3 lg:pb-6">
        <div className="flex min-w-0 flex-col gap-9">
          <PlanBriefSection
            detail={detail}
            isHighlighted={isPlanHighlighted}
            sectionRef={planSectionRef}
          />
          <MemberLineupSection detail={detail} />
          <FitBriefSection detail={detail} />
          <PlanningSection
            detail={detail}
            highlightedProposalId={highlightedProposalId}
            isHighlighted={isPlanningHighlighted}
            sectionRef={planningSectionRef}
          />
          <SafetyNotesSection detail={detail} />
        </div>
      </main>
    </div>
  );
}
