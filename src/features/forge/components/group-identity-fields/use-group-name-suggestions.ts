import { useEffect, useRef, useState } from "react";

import {
  buildGroupNameSuggestions,
  filterAvailableGroupNames,
  getPoolForActivity,
  pickRandom,
} from "@/features/forge/lib/group-identity/group-name-suggestions";

const GROUP_NAME_SUGGESTION_COUNT = 5;

interface UseGroupNameSuggestionsParams {
  existingGroupNames: string[];
  groupName: string;
  onGroupNameChange: (value: string) => void;
  selectedActivity?: string | null;
}

export function useGroupNameSuggestions({
  existingGroupNames,
  groupName,
  onGroupNameChange,
  selectedActivity,
}: UseGroupNameSuggestionsParams) {
  const existingGroupNamesRef = useRef(existingGroupNames);
  const groupNameRef = useRef(groupName);
  const onGroupNameChangeRef = useRef(onGroupNameChange);
  const [suggestions, setSuggestions] = useState<string[]>(() =>
    pickRandom(
      getPoolForActivity(selectedActivity),
      GROUP_NAME_SUGGESTION_COUNT,
    ),
  );
  const existingGroupNamesKey = existingGroupNames.join("\u0000");

  useEffect(() => {
    existingGroupNamesRef.current = existingGroupNames;
    groupNameRef.current = groupName;
    onGroupNameChangeRef.current = onGroupNameChange;
  }, [existingGroupNames, groupName, onGroupNameChange]);

  useEffect(() => {
    const picked = buildGroupNameSuggestions(
      selectedActivity,
      existingGroupNamesRef.current,
      GROUP_NAME_SUGGESTION_COUNT,
    );

    setSuggestions(picked);

    if (!groupNameRef.current && picked.length > 0) {
      onGroupNameChangeRef.current(picked[0]);
    }
  }, [existingGroupNamesKey, selectedActivity]);

  return filterAvailableGroupNames(suggestions, existingGroupNames);
}
