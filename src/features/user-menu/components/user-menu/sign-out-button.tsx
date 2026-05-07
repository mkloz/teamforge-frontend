import { LogOut } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import { useUserMenuSignOut } from "./use-user-menu-sign-out";

export function UserMenuSignOutButton() {
  const { isSigningOut, signOut } = useUserMenuSignOut();

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={() => void signOut()}
      disabled={isSigningOut}
      className="h-auto w-full justify-start px-3 py-3 text-left"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
        <LogOut size={16} aria-hidden="true" />
      </span>
      <span className="font-black">
        {isSigningOut ? "Signing out..." : "Sign out"}
      </span>
    </Button>
  );
}
