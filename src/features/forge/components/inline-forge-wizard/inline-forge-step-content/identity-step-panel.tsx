import { Step5Identity } from "@/features/forge/components/steps/step5-identity";

import type { ForgeWizardChildProps } from "../types";

export function IdentityStepPanel({ fw }: ForgeWizardChildProps) {
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
