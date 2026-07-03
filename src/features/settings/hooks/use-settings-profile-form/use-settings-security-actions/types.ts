import type { Dispatch, SetStateAction } from "react";
import type { User } from "@/shared/schemas";

export interface UseSettingsSecurityActionsOptions {
  currentUser?: User | null;
  enabled?: boolean;
}

export interface UseSettingsSecurityMutationsOptions {
  setSecurityError: Dispatch<SetStateAction<string | null>>;
}
