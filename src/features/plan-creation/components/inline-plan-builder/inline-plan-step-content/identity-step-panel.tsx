import { Step5Identity } from "@/features/plan-creation/components/steps/step5-identity";

import type { PlanBuilderChildProps } from "../types";

export function IdentityStepPanel({ fw }: PlanBuilderChildProps) {
  return (
    <Step5Identity
      planTitle={fw.planName}
      activityTitle={fw.selectedActivity || ""}
      coverImage={fw.coverImage}
      templateCoverImage={fw.templateCoverImage}
      onCoverImageChange={fw.setCoverImage}
      avatarImage={fw.avatarImage}
      onAvatarImageChange={fw.setAvatarImage}
      groupName={fw.groupName}
      onGroupNameChange={fw.setGroupName}
      groupDescription={fw.groupDescription}
      onGroupDescriptionChange={fw.setGroupDescription}
    />
  );
}
