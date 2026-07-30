import { useEffect, useRef, useState } from "react";

import {
  buildGroupNameSuggestions,
  filterAvailableGroupNames,
} from "@/features/forge/lib/group-identity/group-name-suggestions";

const GROUP_NAME_SUGGESTION_COUNT = 4;

interface UseGroupNameSuggestionsParams {
  existingGroupNames: string[];
  groupName: string;
  onGroupNameChange: (value: string) => void;
  planTitle?: string | null;
  selectedActivity?: string | null;
}

export function useGroupNameSuggestions({
  existingGroupNames,
  groupName,
  onGroupNameChange,
  planTitle,
  selectedActivity,
}: UseGroupNameSuggestionsParams) {
  const existingGroupNamesRef = useRef(existingGroupNames);
  const groupNameRef = useRef(groupName);
  const onGroupNameChangeRef = useRef(onGroupNameChange);
  const [suggestions, setSuggestions] = useState<string[]>(() =>
    buildGroupNameSuggestions({
      existingGroupNames,
      planTitle,
      selectedActivity,
      suggestionCount: GROUP_NAME_SUGGESTION_COUNT,
    }),
  );
  const existingGroupNamesKey = existingGroupNames.join("\u0000");

  useEffect(() => {
    existingGroupNamesRef.current = existingGroupNames;
    groupNameRef.current = groupName;
    onGroupNameChangeRef.current = onGroupNameChange;
  }, [existingGroupNames, groupName, onGroupNameChange]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: existingGroupNamesKey tracks array contents without making the effect depend on array identity.
  useEffect(() => {
    const picked = buildGroupNameSuggestions({
      planTitle,
      selectedActivity,
      existingGroupNames: existingGroupNamesRef.current,
      suggestionCount: GROUP_NAME_SUGGESTION_COUNT,
    });

    setSuggestions(picked);

    if (!groupNameRef.current && picked.length > 0) {
      onGroupNameChangeRef.current(picked[0]);
    }
  }, [existingGroupNamesKey, planTitle, selectedActivity]);

  return filterAvailableGroupNames(suggestions, existingGroupNames);
}
