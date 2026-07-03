import { useCurrentSessionSignOut } from "@/shared/hooks/use-current-session-sign-out";

export function useUserMenuSignOut() {
  return useCurrentSessionSignOut();
}
