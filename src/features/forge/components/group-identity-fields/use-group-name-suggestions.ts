import { useEffect, useRef, useState } from "react";

import { getPoolForActivity, pickRandom } from "./group-identity-utils";

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
    pickRandom(getPoolForActivity(selectedActivity), 5),
  );
  const existingGroupNamesKey = existingGroupNames.join("\u0000");

  useEffect(() => {
    existingGroupNamesRef.current = existingGroupNames;
    groupNameRef.current = groupName;
    onGroupNameChangeRef.current = onGroupNameChange;
  }, [existingGroupNames, groupName, onGroupNameChange]);

  useEffect(() => {
    const pool = getPoolForActivity(selectedActivity);
    const taken = existingGroupNamesRef.current.map((name) =>
      name.toLowerCase(),
    );
    const available = pool.filter(
      (name) => !taken.includes(name.toLowerCase()),
    );
    const picked = pickRandom(available, 5);

    setSuggestions(picked);

    if (!groupNameRef.current && picked.length > 0) {
      onGroupNameChangeRef.current(picked[0]);
    }
  }, [existingGroupNamesKey, selectedActivity]);

  return suggestions.filter((name) => {
    const taken = existingGroupNames.map((existing) => existing.toLowerCase());
    return !taken.includes(name.toLowerCase());
  });
}
