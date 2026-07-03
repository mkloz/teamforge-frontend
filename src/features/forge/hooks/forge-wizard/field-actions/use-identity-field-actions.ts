import type { BaseFieldActionOptions } from "./types";

export function useIdentityFieldActions({ setField }: BaseFieldActionOptions) {
  function setGroupName(value: string) {
    setField("groupName", value);
  }

  function setGroupDescription(value: string) {
    setField("groupDescription", value);
  }

  function setCoverImage(value: string | null) {
    setField("coverImage", value);
  }

  function setAvatarImage(value: string | null) {
    setField("avatarImage", value);
  }

  function setInvitesSent(value: boolean) {
    setField("invitesSent", value);
  }

  return {
    setAvatarImage,
    setCoverImage,
    setGroupDescription,
    setGroupName,
    setInvitesSent,
  };
}
