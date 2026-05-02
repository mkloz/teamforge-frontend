"use client";

import { useId, useRef, useState } from "react";

import { GroupDescriptionField } from "./group-description-field";
import { GroupNameField } from "./group-name-field";
import { useGroupNameSuggestions } from "./use-group-name-suggestions";

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
  existingGroupNames = [],
  subtitle = "Optional — you can always update this later.",
}: GroupIdentityFieldsProps) {
  const [nameFocused, setNameFocused] = useState(false);
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
    <div className="space-y-4">
      <div className="px-0.5">
        <p className="text-xs md:text-sm font-semibold text-foreground">
          Group identity
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/60 mt-0.5">{subtitle}</p>
        )}
      </div>

      <GroupNameField
        groupName={groupName}
        inputRef={nameInputRef}
        nameFocused={nameFocused}
        nameId={nameId}
        onFocusChange={setNameFocused}
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
