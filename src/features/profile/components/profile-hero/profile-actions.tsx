import { Link } from "@tanstack/react-router";
import { Settings, SlidersHorizontal } from "lucide-react";
import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import { Button } from "@/shared/components/ui/button";

export function ProfileActions() {
  return (
    <div className="grid w-full grid-cols-2 items-center gap-2 pr-0 sm:flex sm:w-auto sm:flex-row sm:gap-3">
      <Button
        asChild
        size="sm"
        className="min-h-10 w-full shrink-0 px-3 text-xs sm:min-h-11 sm:w-auto sm:px-6 sm:text-sm"
      >
        <Link aria-label="Edit profile" {...buildSettingsNavigation("account")}>
          <Settings className="size-4 shrink-0 sm:size-5" />
          <span>Edit Profile</span>
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="min-h-10 w-full border-2 px-3 text-xs sm:min-h-11 sm:w-auto sm:px-6 sm:text-sm"
      >
        <Link
          aria-label="Update matching"
          {...buildSettingsNavigation("matching")}
        >
          <SlidersHorizontal className="size-4 shrink-0 sm:size-5" />
          <span className="sm:hidden">Matching</span>
          <span className="hidden sm:inline">Update Matching</span>
        </Link>
      </Button>
    </div>
  );
}
