import { FitSection } from "@/features/group-plan-detail/components/content/fit-section";
import { InviteSuggestionsSection } from "@/features/group-plan-detail/components/content/invite-suggestions-section";
import { PeopleSection } from "@/features/group-plan-detail/components/content/people-section";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

interface GroupPlanDetailDeferredSectionsProps {
  detail: GroupPlanDetail;
}

export function GroupPlanDetailDeferredSections({
  detail,
}: GroupPlanDetailDeferredSectionsProps) {
  return (
    <>
      <PeopleSection detail={detail} />
      <InviteSuggestionsSection detail={detail} />
      <FitSection detail={detail} />
    </>
  );
}
