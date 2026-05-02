import { AnimatePresence, motion } from "framer-motion";

import { Step1Activity } from "@/features/forge/components/steps/step1-activity/index";
import { Step2Plan } from "@/features/forge/components/steps/step2-plan/index";
import { Step3Group } from "@/features/forge/components/steps/step3-group/index";
import { Step4Failed } from "@/features/forge/components/steps/step4-failed";
import { Step4Success } from "@/features/forge/components/steps/step4-success/index";
import { Step5Identity } from "@/features/forge/components/steps/step5-identity/index";
import { Step6Invite } from "@/features/forge/components/steps/step6-invite/index";

import type { ForgeWizardChildProps } from "./types";

interface InlineForgeStepContentProps extends ForgeWizardChildProps {
  activityShakeRequestId: number;
}

export function InlineForgeStepContent({
  activityShakeRequestId,
  fw,
}: InlineForgeStepContentProps) {
  return (
    <div className="flex-1 relative mt-2">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={fw.step}
          initial={{
            opacity: 0,
            x: fw.navDirection === "forward" ? 24 : -24,
          }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: fw.navDirection === "forward" ? -24 : 24 }}
          transition={{
            duration: 0.35,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="w-full py-4 flex flex-col"
        >
          {fw.step === 1 && (
            <Step1Activity
              selectedActivity={fw.selectedActivity}
              onSelect={(activity) => fw.setSelectedActivity(activity)}
              shakeRequestId={activityShakeRequestId}
            />
          )}
          {fw.step === 2 && (
            <Step2Plan
              planName={fw.planName}
              onPlanNameChange={fw.setPlanName}
              planDescription={fw.planDescription}
              onPlanDescriptionChange={fw.setPlanDescription}
              planDate={fw.planDate}
              onPlanDateChange={fw.setPlanDate}
              planTime={fw.planTime}
              onPlanTimeChange={fw.setPlanTime}
              planLocation={fw.planLocation}
              onPlanLocationChange={fw.setPlanLocation}
              planLocationLat={fw.planLocationLat}
              planLocationLng={fw.planLocationLng}
              onPlanLocationCoordinatesChange={fw.setPlanLocationCoordinates}
              locationType={fw.locationType}
              onLocationTypeChange={fw.setLocationType}
              planCost={fw.planCost}
              onPlanCostChange={fw.setPlanCost}
              planCostAmount={fw.planCostAmount}
              onPlanCostAmountChange={fw.setPlanCostAmount}
              planCostDetails={fw.planCostDetails}
              onPlanCostDetailsChange={fw.setPlanCostDetails}
            />
          )}
          {fw.step === 3 && (
            <Step3Group
              forgeMode={fw.forgeMode}
              onForgeModeChange={fw.setForgeMode}
              fixedSize={fw.fixedSize}
              onFixedSizeChange={fw.setFixedSize}
              groupSizeMode={fw.groupSizeMode}
              onGroupSizeModeChange={fw.setGroupSizeMode}
              autoMinSize={fw.autoMinSize}
              onAutoMinSizeChange={fw.setAutoMinSize}
              autoMaxSize={fw.autoMaxSize}
              onAutoMaxSizeChange={fw.setAutoMaxSize}
              compatibilityWeight={fw.compatibilityWeight}
              onCompatibilityWeightChange={fw.setCompatibilityWeight}
              diversityWeight={fw.diversityWeight}
              onDiversityWeightChange={fw.setDiversityWeight}
              visibility={fw.visibility}
              onVisibilityChange={fw.setVisibility}
              groupName={fw.groupName}
              onGroupNameChange={fw.setGroupName}
              groupDescription={fw.groupDescription}
              onGroupDescriptionChange={fw.setGroupDescription}
              manualInviteeIds={fw.manualInviteeIds}
              onManualInviteeToggle={fw.toggleManualInvitee}
              selectedActivity={fw.selectedActivity}
            />
          )}
          {fw.step === 4 && fw.forgeResult === "SUCCESS" && (
            <Step4Success
              planTitle={fw.planName}
              participants={fw.participants}
              removedIds={fw.removedIds}
              onRemoveParticipant={fw.handleRemoveParticipant}
              onRestoreParticipant={fw.handleRestoreParticipant}
              onReforge={fw.handleReforge}
            />
          )}
          {fw.step === 4 && fw.forgeResult === "FAILED" && (
            <Step4Failed forgeMode={fw.forgeMode} />
          )}
          {fw.step === 5 && (
            <Step5Identity
              planTitle={fw.planName}
              activityTitle={fw.selectedActivity || ""}
              coverImage={fw.coverImage}
              onCoverImageChange={fw.setCoverImage}
              avatarImage={fw.avatarImage}
              onAvatarImageChange={fw.setAvatarImage}
              groupName={fw.groupName}
              onGroupNameChange={fw.setGroupName}
              groupDescription={fw.groupDescription}
              onGroupDescriptionChange={fw.setGroupDescription}
            />
          )}
          {fw.step === 6 && (
            <Step6Invite
              planTitle={fw.planName}
              planDate={fw.planDate}
              planLocation={fw.planLocation}
              activityTitle={fw.selectedActivity || ""}
              participantCount={
                fw.forgeMode === "MANUAL"
                  ? fw.manualInviteeIds.length + 1
                  : fw.activeParticipants.length + 1
              }
              inviteeCount={
                fw.forgeMode === "MANUAL"
                  ? fw.manualInviteeIds.length
                  : fw.activeParticipants.length
              }
              forgeMode={fw.forgeMode}
              coverImage={fw.coverImage}
              inviteCopied={fw.inviteCopied}
              onCopyLink={fw.handleCopyLink}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
