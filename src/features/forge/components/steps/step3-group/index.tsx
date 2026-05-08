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
    <div className="fade-in slide-in-from-bottom-4 animate-in space-y-5 pb-4 duration-500">
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

      <section className="space-y-3.5 border-border/25 border-t pt-4">
        <div className="flex items-baseline justify-between gap-3 px-0.5">
          <p className="font-semibold text-muted-foreground text-xs md:text-sm">
            Group details
          </p>
          <p className="font-semibold text-micro text-muted-foreground/40 uppercase tracking-wide">
            {forgeMode === "MANUAL" ? "Invite-led" : "Automatic"}
          </p>
        </div>

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
