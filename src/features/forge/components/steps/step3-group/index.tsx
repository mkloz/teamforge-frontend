"use client";

import { useQuery } from "@tanstack/react-query";

import { forgeFriendCandidatesQueryOptions } from "@/features/forge/api/forge-query-options";
import { GroupIdentityFields } from "@/features/forge/components/group-identity-fields/index";

import { ManualGroupDetails } from "./manual-group-details";
import { PrivacySection } from "./privacy-section";
import type { Step3GroupProps } from "./types";

const EMPTY_GROUP_NAMES: string[] = [];

export function Step3Group({
  forgeMode,
  fixedSize,
  onFixedSizeChange,
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

      <section className="flex flex-col gap-3.5 border-border/25 border-t pt-4">
        <div className="flex items-baseline gap-3 px-0.5">
          <p className="font-semibold text-foreground text-sm">Group size</p>
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
          <div className="grid gap-1 rounded-2xl border border-border bg-card p-4">
            <p className="font-semibold text-foreground text-sm">
              Four people, with a minimum of three
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              This request targets four people and uses three as the minimum
              group size.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export type { Step3GroupProps } from "./types";
