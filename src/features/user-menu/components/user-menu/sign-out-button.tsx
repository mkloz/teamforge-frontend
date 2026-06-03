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
          variant="destructive"
          disabled={isSigningOut}
          className="h-auto w-full justify-start px-3 py-2.5 text-left"
        >
          <IconTile icon={LogOut} tone="destructive" />
          <span className="font-black">
            {isSigningOut ? "Signing out..." : "Sign out"}
          </span>
        </Button>
      }
    />
  );
}
