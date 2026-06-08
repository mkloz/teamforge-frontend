import { LogOut } from "lucide-react";

import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";

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
      title="Sign out of TeamForge?"
      tone="warning"
      trigger={
        <Button
          type="button"
          variant="ghost"
          disabled={isSigningOut}
          className="flex h-auto w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-muted-foreground transition-colors hover:bg-destructive/8 hover:text-destructive"
        >
          <IconTile icon={LogOut} tone="neutral" size="md" bordered />
          <span className="font-semibold text-sm">
            {isSigningOut ? "Signing out..." : "Sign out"}
          </span>
        </Button>
      }
    />
  );
}
