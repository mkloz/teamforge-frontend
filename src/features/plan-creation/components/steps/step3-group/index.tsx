"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { type ReactNode, useDeferredValue, useState } from "react";

import {
  planCreationFriendCandidatesQueryOptions,
  planCreationFriendCompatibilityQueryOptions,
} from "@/features/plan-creation/api/plan-creation-query-options";

import { AutoGroupSizeRange } from "./auto-group-size-range";
import { GroupRequestSummary } from "./group-request-summary";
import { ManualGroupDetails } from "./manual-group-details";
import { PrivacySection } from "./privacy-section";
import type { Step3GroupProps } from "./types";

export function Step3Group({
  groupFormationMode,
  fixedSize,
  onFixedSizeChange,
  autoMinSize,
  autoMaxSize,
  onAutoSizeRangeChange,
  visibility,
  onVisibilityChange,
  groupName = "",
  groupDescription = "",
  manualInviteeIds,
  onManualInviteeToggle,
  selectedActivity,
  coverImage,
  groupFormationScope,
  locationType,
  planDate,
  planDescription,
  planLocation,
  planName,
  planScheduleMode,
  planTime,
}: Step3GroupProps) {
  const [friendSearch, setFriendSearch] = useState("");
  const deferredFriendSearch = useDeferredValue(friendSearch.trim());
  const {
    data: friendsData,
    fetchNextPage,
    hasNextPage,
    isError: isFriendsError,
    isFetchingNextPage,
    isPending: isLoadingFriends,
    refetch: refetchFriends,
  } = useInfiniteQuery({
    ...planCreationFriendCandidatesQueryOptions(deferredFriendSearch),
    enabled: groupFormationMode === "MANUAL",
  });
  const friends = friendsData?.pages.flatMap((page) => page.items) ?? [];
  const totalFriends = friendsData?.pages[0]?.meta.totalItemsCount ?? 0;
  const friendIds = friends.map(({ counterpart }) => counterpart.id);
  const compatibilityQuery = useQuery({
    ...planCreationFriendCompatibilityQueryOptions({
      candidateIds: friendIds,
      groupMemberIds: manualInviteeIds,
    }),
    enabled: groupFormationMode === "MANUAL" && friendIds.length > 0,
  });
  const compatibilityByUserId = new Map(
    compatibilityQuery.data?.map((item) => [item.userId, item]),
  );

  return (
    <div className="grid gap-7 pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,18rem)] lg:items-start">
      <div className="min-w-0">
        {groupFormationMode === "MANUAL" ? (
          <div className="flex flex-col gap-6">
            <PrivacySection
              visibility={visibility}
              onVisibilityChange={onVisibilityChange}
            />

            <GroupSizeSection title="Choose the group">
              <ManualGroupDetails
                compatibilityByUserId={compatibilityByUserId}
                compatibilityPending={compatibilityQuery.isFetching}
                fixedSize={fixedSize}
                onFixedSizeChange={onFixedSizeChange}
                friendSearch={friendSearch}
                onFriendSearchChange={setFriendSearch}
                hasMoreFriends={hasNextPage}
                isLoadingMoreFriends={isFetchingNextPage}
                manualInviteeIds={manualInviteeIds}
                onManualInviteeToggle={onManualInviteeToggle}
                friends={friends}
                totalFriends={totalFriends}
                isFriendsError={isFriendsError}
                isLoadingFriends={isLoadingFriends}
                onLoadMoreFriends={() => void fetchNextPage()}
                onRetryFriends={() => void refetchFriends()}
              />
            </GroupSizeSection>
          </div>
        ) : (
          <GroupSizeSection title="Set the group target">
            <AutoGroupSizeRange
              minimumGroupSize={autoMinSize}
              maximumGroupSize={autoMaxSize}
              onRangeChange={onAutoSizeRangeChange}
            />

            <div className="mt-5 flex items-start gap-2.5 border-border/35 border-t px-0.5 pt-4">
              <Info
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="max-w-2xl text-sm leading-relaxed">
                <strong className="mr-1.5 font-semibold text-foreground">
                  One person short?
                </strong>
                <span className="text-muted-foreground">
                  You can offer one public place. The group forms only after
                  everyone confirms.
                </span>
              </p>
            </div>
          </GroupSizeSection>
        )}
      </div>

      <GroupRequestSummary
        autoMaxSize={autoMaxSize}
        autoMinSize={autoMinSize}
        coverImage={coverImage}
        fixedSize={fixedSize}
        groupFormationMode={groupFormationMode}
        groupFormationScope={groupFormationScope}
        groupDescription={groupDescription}
        groupName={groupName}
        locationType={locationType}
        manualInviteeIds={manualInviteeIds}
        planDate={planDate}
        planDescription={planDescription}
        planLocation={planLocation}
        planName={planName}
        planScheduleMode={planScheduleMode}
        planTime={planTime}
        selectedActivity={selectedActivity}
        visibility={visibility}
      />
    </div>
  );
}

function GroupSizeSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section aria-labelledby="plan-creation-group-size-heading">
      <div className="mb-4 px-0.5">
        <h3
          id="plan-creation-group-size-heading"
          className="font-black text-foreground text-lg tracking-tight"
        >
          {title}
        </h3>
        <p className="mt-1 max-w-xl text-muted-foreground text-sm leading-relaxed">
          {title === "Set the group target"
            ? "Choose the smallest group that works and the size you would prefer."
            : "Set the capacity, then choose who should receive an invite."}
        </p>
      </div>
      {children}
    </section>
  );
}

export type { Step3GroupProps } from "./types";
