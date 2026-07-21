"use client";

import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";

import { forgeFriendCandidatesQueryOptions } from "@/features/forge/api/forge-query-options";
import { GroupIdentityFields } from "@/features/forge/components/group-identity-fields/index";
import { Notice } from "@/shared/components/ui/notice";

import { AutoGroupSizeRange } from "./auto-group-size-range";
import { ManualGroupDetails } from "./manual-group-details";
import { PrivacySection } from "./privacy-section";
import type { Step3GroupProps } from "./types";

const EMPTY_GROUP_NAMES: string[] = [];

export function Step3Group({
  forgeMode,
  fixedSize,
  onFixedSizeChange,
  autoMinSize,
  autoMaxSize,
  onAutoSizeRangeChange,
  visibility,
  onVisibilityChange,
  groupName = "",
  onGroupNameChange,
  groupDescription = "",
  onGroupDescriptionChange,
  manualInviteeIds,
  onManualInviteeToggle,
  existingGroupNames = EMPTY_GROUP_NAMES,
  selectedActivity,
}: Step3GroupProps) {
  const { data: friends = [], isLoading: isLoadingFriends } = useQuery(
    forgeFriendCandidatesQueryOptions(),
  );

  return (
    <div className="flex flex-col gap-5 pb-4">
      {forgeMode === "MANUAL" ? (
        <>
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
        </>
      ) : null}

      <section
        aria-labelledby="forge-group-size-heading"
        className="flex flex-col gap-3.5 border-border/25 border-t pt-4"
      >
        <div className="flex items-baseline gap-3 px-0.5">
          <h3
            id="forge-group-size-heading"
            className="font-semibold text-foreground text-sm"
          >
            Group size
          </h3>
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
          <div className="grid gap-4">
            <AutoGroupSizeRange
              minimumGroupSize={autoMinSize}
              maximumGroupSize={autoMaxSize}
              onRangeChange={onAutoSizeRangeChange}
            />
            <Notice
              icon={<Info className="size-4" aria-hidden="true" />}
              size="sm"
              tone="neutral"
            >
              <p>
                If the proposal ends exactly one person short, you can choose to
                open one public place. TeamForge will not create a smaller
                group, and everyone in the final roster must confirm the new
                proposal.
              </p>
            </Notice>
          </div>
        )}
      </section>
    </div>
  );
}

export type { Step3GroupProps } from "./types";
