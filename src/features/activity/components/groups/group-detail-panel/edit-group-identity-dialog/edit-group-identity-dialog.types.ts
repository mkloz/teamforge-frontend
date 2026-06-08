import type { RefObject } from "react";

import type { useEditGroupIdentity } from "@/features/activity/hooks/use-edit-group-identity";

export type GroupIdentityEditor = ReturnType<typeof useEditGroupIdentity>;

export interface GroupIdentityUploadSectionProps {
  editor: GroupIdentityEditor;
  inputRef: RefObject<HTMLInputElement | null>;
}
