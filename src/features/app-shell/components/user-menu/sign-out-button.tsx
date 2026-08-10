import { LogOut } from "lucide-react";

import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";

import { useUserMenuSignOut } from "./use-user-menu-sign-out";

export function UserMenuSignOutButton() {
  const { isSigningOut, signOut } = useUserMenuSignOut();

  return (
    <ActionDialog
      cancelLabel="Stay signed in"
      confirmLabel={isSigningOut ? "Signing out..." : "Sign out"}
      description="This ends the current session and returns you to the login screen."
      details={["You can come back with the same email and password."]}
      loading={isSigningOut}
      onConfirm={signOut}
      overlayClassName="z-120"
      contentClassName="z-120"
      title="Sign out of Findafew?"
      tone="warning"
      trigger={
        <Button
          type="button"
          variant="ghost"
          disabled={isSigningOut}
          contentClassName="gap-3"
          className="h-12 w-full justify-start rounded-2xl bg-card px-4 text-left text-destructive shadow-none transition-colors hover:bg-destructive-soft focus-visible:ring-destructive/40 active:bg-destructive-soft"
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 font-bold text-sm">
            {isSigningOut ? "Signing out..." : "Sign out"}
          </span>
        </Button>
      }
    />
  );
}
