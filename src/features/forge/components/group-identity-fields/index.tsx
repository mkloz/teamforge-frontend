"use client";

import { useId, useRef } from "react";

import { GroupDescriptionField } from "./group-description-field";
import { GroupNameField } from "./group-name-field";
import { useGroupNameSuggestions } from "./use-group-name-suggestions";

const EMPTY_GROUP_NAMES: string[] = [];

export interface GroupIdentityFieldsProps {
  groupName: string;
  onGroupNameChange: (v: string) => void;
  groupDescription: string;
  onGroupDescriptionChange: (v: string) => void;
  selectedActivity?: string | null;
  planTitle?: string | null;
  existingGroupNames?: string[];
  heading?: string | null;
  subtitle?: string;
}

export function GroupIdentityFields({
  groupName,
  onGroupNameChange,
  groupDescription,
  onGroupDescriptionChange,
  selectedActivity,
  planTitle,
  existingGroupNames = EMPTY_GROUP_NAMES,
  heading = "Group details",
  subtitle = "Optional — you can always update this later.",
}: GroupIdentityFieldsProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const descId = useId();
  const visibleSuggestions = useGroupNameSuggestions({
    existingGroupNames,
    groupName,
    onGroupNameChange,
    planTitle,
    selectedActivity,
  });

  return (
    <div className="flex min-w-0 flex-col gap-3.5">
      {heading || subtitle ? (
        <div className="px-0.5">
          {heading ? (
            <p className="font-bold text-base text-foreground">{heading}</p>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      <GroupNameField
        groupName={groupName}
        inputRef={nameInputRef}
        nameId={nameId}
        onGroupNameChange={onGroupNameChange}
        suggestions={visibleSuggestions}
      />

      <GroupDescriptionField
        descId={descId}
        groupDescription={groupDescription}
        onGroupDescriptionChange={onGroupDescriptionChange}
      />
    </div>
  );
}
