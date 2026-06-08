import { useCallback } from "react";

import type { BaseFieldActionOptions } from "./types";

export function useIdentityFieldActions({ setField }: BaseFieldActionOptions) {
  const setGroupName = useCallback(
    (value: string) => setField("groupName", value),
    [setField],
  );
  const setGroupDescription = useCallback(
    (value: string) => setField("groupDescription", value),
    [setField],
  );
  const setCoverImage = useCallback(
    (value: string | null) => setField("coverImage", value),
    [setField],
  );
  const setAvatarImage = useCallback(
    (value: string | null) => setField("avatarImage", value),
    [setField],
  );
  const setInvitesSent = useCallback(
    (value: boolean) => setField("invitesSent", value),
    [setField],
  );

  return {
    setAvatarImage,
    setCoverImage,
    setGroupDescription,
    setGroupName,
    setInvitesSent,
  };
}
