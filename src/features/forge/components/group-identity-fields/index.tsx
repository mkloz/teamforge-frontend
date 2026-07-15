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
  existingGroupNames?: string[];
  subtitle?: string;
}

export function GroupIdentityFields({
  groupName,
  onGroupNameChange,
  groupDescription,
  onGroupDescriptionChange,
  selectedActivity,
  existingGroupNames = EMPTY_GROUP_NAMES,
  subtitle = "Optional — you can always update this later.",
}: GroupIdentityFieldsProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const descId = useId();
  const visibleSuggestions = useGroupNameSuggestions({
    existingGroupNames,
    groupName,
    onGroupNameChange,
    selectedActivity,
  });

  return (
    <div className="flex flex-col gap-3.5">
      <div className="px-0.5">
        <p className="font-semibold text-foreground text-xs md:text-sm">
          Group details
        </p>
        {subtitle && (
          <p className="mt-0.5 text-muted-foreground/60 text-xs">{subtitle}</p>
        )}
      </div>

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
