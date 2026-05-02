"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { forgeFriendCandidatesQueryOptions } from "@/features/forge/api/forge-query-options";
import { GroupIdentityFields } from "@/features/forge/components/group-identity-fields/index";

import { AutoGroupDetails } from "./auto-group-details";
import { ManualGroupDetails } from "./manual-group-details";
import { MethodSection } from "./method-section";
import { PrivacySection } from "./privacy-section";
import type { Step3GroupProps } from "./types";

export function Step3Group({
  forgeMode,
  onForgeModeChange,
  fixedSize,
  onFixedSizeChange,
  groupSizeMode,
  onGroupSizeModeChange,
  autoMinSize,
  onAutoMinSizeChange,
  autoMaxSize,
  onAutoMaxSizeChange,
  compatibilityWeight,
  onCompatibilityWeightChange,
  diversityWeight,
  onDiversityWeightChange,
  visibility,
  onVisibilityChange,
  groupName = "",
  onGroupNameChange,
  groupDescription = "",
  onGroupDescriptionChange,
  manualInviteeIds,
  onManualInviteeToggle,
  existingGroupNames = [],
  selectedActivity,
}: Step3GroupProps) {
  const [algorithmsExpanded, setAlgorithmsExpanded] = useState(false);
  const { data: friends = [], isLoading: isLoadingFriends } = useQuery(
    forgeFriendCandidatesQueryOptions(),
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-4">
      <GroupIdentityFields
        groupName={groupName}
        onGroupNameChange={(v) => onGroupNameChange?.(v)}
        groupDescription={groupDescription}
        onGroupDescriptionChange={(v) => onGroupDescriptionChange?.(v)}
        selectedActivity={selectedActivity}
        existingGroupNames={existingGroupNames}
      />

      <PrivacySection
        visibility={visibility}
        onVisibilityChange={onVisibilityChange}
      />

      <MethodSection
        forgeMode={forgeMode}
        onForgeModeChange={onForgeModeChange}
      />

      <section className="space-y-4 pt-2 border-t border-muted/20">
        <p className="text-xs md:text-sm font-semibold text-muted-foreground px-0.5">
          Group details
        </p>

        {forgeMode === "MANUAL" ? (
          <ManualGroupDetails
            fixedSize={fixedSize}
            onFixedSizeChange={onFixedSizeChange}
            manualInviteeIds={manualInviteeIds}
            onManualInviteeToggle={onManualInviteeToggle}
            friends={friends}
            isLoadingFriends={isLoadingFriends}
          />
        ) : (
          <AutoGroupDetails
            algorithmsExpanded={algorithmsExpanded}
            onAlgorithmsExpandedChange={setAlgorithmsExpanded}
            autoMaxSize={autoMaxSize}
            autoMinSize={autoMinSize}
            compatibilityWeight={compatibilityWeight}
            diversityWeight={diversityWeight}
            fixedSize={fixedSize}
            groupSizeMode={groupSizeMode}
            onAutoMaxSizeChange={onAutoMaxSizeChange}
            onAutoMinSizeChange={onAutoMinSizeChange}
            onCompatibilityWeightChange={onCompatibilityWeightChange}
            onDiversityWeightChange={onDiversityWeightChange}
            onFixedSizeChange={onFixedSizeChange}
            onGroupSizeModeChange={onGroupSizeModeChange}
          />
        )}
      </section>
    </div>
  );
}

export type { Step3GroupProps } from "./types";
