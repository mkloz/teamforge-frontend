import type { Ref } from "react";
import { ActivitySection } from "@/features/group-plan-detail/components/content/activity-section";
import { FitSection } from "@/features/group-plan-detail/components/content/fit-section";
import { GroupSection } from "@/features/group-plan-detail/components/content/group-section";
import { PeopleSection } from "@/features/group-plan-detail/components/content/people-section";
import { PitchSection } from "@/features/group-plan-detail/components/content/pitch-section";
import { PlanSection } from "@/features/group-plan-detail/components/content/plan-section";
import { GroupPlanHero } from "@/features/group-plan-detail/components/hero/group-plan-hero";
import { MobileActionDock } from "@/features/group-plan-detail/components/mobile-action-dock";
import { DecisionRail } from "@/features/group-plan-detail/components/rail/decision-rail";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

interface GroupPlanDetailPageContentProps {
  detail: GroupPlanDetail;
  highlightedProposalId?: string | null;
  isPlanHighlighted?: boolean;
  isPlanningHighlighted?: boolean;
  planSectionRef?: Ref<HTMLElement>;
  planningSectionRef?: Ref<HTMLElement>;
}

interface GroupPlanSectionFocusProps {
  highlightedProposalId: string | null;
  isPlanHighlighted: boolean;
  isPlanningHighlighted: boolean;
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
  const focus = {
    highlightedProposalId,
    isPlanHighlighted,
    isPlanningHighlighted,
    planSectionRef,
    planningSectionRef,
  };

  return (
    <>
      <GroupPlanDetailPageShell detail={detail} focus={focus} />
      <MobileActionDock detail={detail} />
    </>
  );
}

function GroupPlanDetailPageShell({
  detail,
  focus,
}: {
  detail: GroupPlanDetail;
  focus: GroupPlanSectionFocusProps;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl overflow-x-clip px-4 pt-3 pb-32 sm:px-5 md:pt-6 md:pb-12 lg:px-8">
      <GroupPlanHero detail={detail} />
      <GroupPlanPitch detail={detail} />
      <GroupPlanDetailGrid detail={detail} focus={focus} />
    </div>
  );
}

function GroupPlanPitch({ detail }: { detail: GroupPlanDetail }) {
  return (
    <div className="mt-8 mb-10">
      <PitchSection detail={detail} />
    </div>
  );
}

function GroupPlanDetailGrid({
  detail,
  focus,
}: {
  detail: GroupPlanDetail;
  focus: GroupPlanSectionFocusProps;
}) {
  return (
    <div className="lg:group-plan-detail-grid mt-12 grid gap-12">
      <GroupPlanMainSections detail={detail} focus={focus} />

      <aside className="min-w-0">
        <DecisionRail detail={detail} />
      </aside>
    </div>
  );
}

function GroupPlanMainSections({
  detail,
  focus,
}: {
  detail: GroupPlanDetail;
  focus: GroupPlanSectionFocusProps;
}) {
  return (
    <main className="flex min-w-0 flex-col gap-12">
      <GroupSection detail={detail} />
      <PlanSection
        detail={detail}
        isHighlighted={focus.isPlanHighlighted}
        sectionRef={focus.planSectionRef}
      />
      <PeopleSection detail={detail} />
      <FitSection detail={detail} />
      <ActivityAnchor detail={detail} focus={focus} />
    </main>
  );
}

function ActivityAnchor({
  detail,
  focus,
}: {
  detail: GroupPlanDetail;
  focus: GroupPlanSectionFocusProps;
}) {
  return (
    <div id="activity" className="scroll-mt-24">
      <ActivitySection
        detail={detail}
        highlightedProposalId={focus.highlightedProposalId}
        isHighlighted={focus.isPlanningHighlighted}
        sectionRef={focus.planningSectionRef}
      />
    </div>
  );
}
