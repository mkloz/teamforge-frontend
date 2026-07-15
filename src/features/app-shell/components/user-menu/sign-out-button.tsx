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
      overlayClassName="z-120"
      contentClassName="z-120"
      title="Sign out of TeamForge?"
      tone="warning"
      trigger={
        <Button
          type="button"
          variant="ghost"
          disabled={isSigningOut}
          contentClassName="gap-3"
          className="h-auto w-full justify-start rounded-xl border-destructive/15 bg-destructive/5 px-3 py-3 text-left text-destructive shadow-none transition-colors hover:border-destructive/25 hover:bg-destructive/10 focus-visible:ring-destructive/40 active:bg-destructive/12"
        >
          <IconTile icon={LogOut} tone="destructive" size="md" bordered />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-sm">
              {isSigningOut ? "Signing out..." : "Sign out"}
            </span>
            <span className="mt-0.5 block text-muted-foreground text-xs group-hover:text-destructive/75">
              {isSigningOut
                ? "Ending this session"
                : "End this session on this device"}
            </span>
          </span>
        </Button>
      }
    />
  );
}
